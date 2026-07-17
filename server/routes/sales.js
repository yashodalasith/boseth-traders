const express = require("express");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Item = require("../models/Item");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { validateSale } = require("../middleware/validation");

const router = express.Router();

const mapItemQuantities = (items = []) => {
  const quantityMap = new Map();

  items.forEach((lineItem) => {
    if (!lineItem.item) {
      return;
    }

    const itemId = lineItem.item.toString();
    const quantity = Number(lineItem.quantity || 0);
    quantityMap.set(itemId, (quantityMap.get(itemId) || 0) + quantity);
  });

  return quantityMap;
};

const applySalesCountDelta = async (quantityMap, multiplier = 1) => {
  for (const [itemId, quantity] of quantityMap.entries()) {
    const item = await Item.findById(itemId);
    if (!item) {
      continue;
    }

    item.salesCount = Math.max(
      0,
      (item.salesCount || 0) + quantity * multiplier,
    );
    await item.save();
  }
};

// New helper to build a map of itemId -> total quantity from an array of sale line items
const buildQuantityMapFromResolved = (resolvedItems = []) => {
  const map = new Map();
  for (const li of resolvedItems) {
    if (!li.item) continue;
    const id = li.item.toString();
    map.set(id, (map.get(id) || 0) + Number(li.quantity || 0));
  }
  return map;
};

const normalizeAdjustments = (adjustments = []) =>
  (Array.isArray(adjustments) ? adjustments : [])
    .map((entry) => ({
      label: String(entry?.label || "").trim(),
      value: Number(entry?.value || 0),
    }))
    .filter((entry) => entry.label && entry.value >= 0);

const resolveCustomerData = async (customerInput = {}, session = null) => {
  let linkedUser = null;

  if (customerInput.userId) {
    linkedUser = await User.findById(customerInput.userId).session(
      session || null,
    );
    if (!linkedUser) {
      throw new Error("Selected customer not found");
    }
  }

  const userAddress = linkedUser?.address
    ? [
        linkedUser.address.street,
        linkedUser.address.city,
        linkedUser.address.state,
        linkedUser.address.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const name = (customerInput.name || linkedUser?.name || "").trim();
  const contact = (customerInput.contact || linkedUser?.contact || "").trim();
  const address = (customerInput.address || userAddress || "").trim();

  if (!name || !contact || !address) {
    throw new Error("Customer name, contact, and address are required");
  }

  return {
    user: linkedUser?._id,
    name,
    contact,
    address,
  };
};

const resolveSaleItems = async (lineItems = [], session = null) => {
  const resolvedItems = [];

  for (const entry of lineItems) {
    let linkedItem = null;

    // Accept either `itemId` (older code) or `item` (frontend uses `item`)
    const candidateId = entry.itemId || entry.item;
    if (candidateId) {
      linkedItem = await Item.findById(candidateId).session(session || null);
      if (!linkedItem) {
        throw new Error("One or more selected items were not found");
      }
    }

    // Only resolve inventory items by explicit itemId/item.
    // Manual item names are preserved as non-linked sale lines.
    const itemName = (entry.itemName || linkedItem?.name || "").trim();
    if (!itemName) {
      throw new Error("Each sale line must include an item name");
    }

    const sellingPrice = Number(entry.sellingPrice);
    const quantity = Number(entry.quantity);
    const fallbackBuyingPrice =
      linkedItem?.buyingPrice !== undefined && linkedItem?.buyingPrice !== null
        ? Number(linkedItem.buyingPrice)
        : 0;
    const buyingPrice =
      entry.buyingPrice !== undefined && entry.buyingPrice !== ""
        ? Number(entry.buyingPrice)
        : fallbackBuyingPrice;

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      throw new Error("Each sale line must include a valid selling price");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Each sale line must include a valid quantity");
    }

    if (!Number.isFinite(buyingPrice) || buyingPrice < 0) {
      throw new Error("Buying price cannot be negative");
    }

    resolvedItems.push({
      item: linkedItem?._id,
      itemName,
      buyingPrice,
      sellingPrice,
      quantity,
    });
  }

  if (!resolvedItems.length) {
    throw new Error("At least one sale item is required");
  }

  return resolvedItems;
};

const adjustItemsByDifference = async (differenceMap, session = null) => {
  // differenceMap: Map(itemId -> (newQuantity - oldQuantity))
  for (const [itemId, diff] of differenceMap.entries()) {
    const item = await Item.findById(itemId).session(session || null);
    if (!item) {
      // ignore items that don't exist in the item collection
      continue;
    }

    const inventoryDelta = -diff; // positive -> increase stock, negative -> decrease stock
    const salesDelta = diff; // positive -> increase salesCount, negative -> decrease

    // Validate stock availability when reducing inventory
    if (inventoryDelta < 0) {
      const projected = Number(item.quantity || 0) + inventoryDelta;
      if (projected < 0) {
        const err = new Error(
          `Insufficient stock for item '${item.name}' (id=${item._id}). Requested change would make quantity negative.`,
        );
        err.code = "INSUFFICIENT_STOCK";
        err.itemId = String(item._id);
        err.itemName = String(item.name || "");
        err.available = Number(item.quantity || 0);
        err.requested = Math.abs(inventoryDelta);
        throw err;
      }
    }

    item.quantity = Math.max(0, Number(item.quantity || 0) + inventoryDelta);
    item.salesCount = Math.max(0, Number(item.salesCount || 0) + salesDelta);

    // Automatically update availability
    if (item.availability !== "not specified") {
      if (item.quantity === 0) {
        item.availability = "not available";
      } else {
        item.availability = "available";
      }
    }

    await item.save({ session: session || undefined });
  }
};

// Get all sales with optional filtering
router.get("/", auth, admin, async (req, res) => {
  try {
    const { startDate, endDate, itemId } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    if (itemId) {
      filter["items.item"] = itemId;
    }

    const sales = await Sale.find(filter)
      .populate("items.item", "name modelNumber")
      .populate("customer.user", "name username email contact address")
      .sort({ dateTime: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new sale entry
router.post("/", auth, admin, validateSale, async (req, res) => {
  const session = await mongoose.startSession();
  let populatedSale = null;

  try {
    await session.withTransaction(async () => {
      const resolvedItems = await resolveSaleItems(req.body.items, session);
      const customer = await resolveCustomerData(req.body.customer, session);

      // validate inventory availability against resolved items
      const quantityMap = buildQuantityMapFromResolved(resolvedItems);
      for (const [itemId, qty] of quantityMap.entries()) {
        const item = await Item.findById(itemId).session(session);
        if (!item) {
          throw new Error("One or more selected items were not found");
        }
        if (Number(item.quantity || 0) < qty) {
          const err = new Error(
            `Insufficient stock for item '${item.name}'. Available: ${item.quantity}, requested: ${qty}`,
          );
          err.code = "INSUFFICIENT_STOCK";
          err.itemId = String(item._id);
          err.itemName = item.name;
          err.available = Number(item.quantity || 0);
          err.requested = qty;
          throw err;
        }
      }

      const sale = new Sale({
        items: resolvedItems,
        customer,
        additionalCharges: normalizeAdjustments(req.body.additionalCharges),
        additionalCosts: normalizeAdjustments(req.body.additionalCosts),
        dateTime: req.body.dateTime || new Date(),
      });

      await sale.save({ session });

      // adjust Item.quantity and Item.salesCount atomically
      await adjustItemsByDifference(quantityMap, session);

      populatedSale = await Sale.findById(sale._id)
        .populate("items.item", "name modelNumber")
        .populate("customer.user", "name username email contact address")
        .session(session);
    });

    res.status(201).json(populatedSale);
  } catch (error) {
    if (res.headersSent) {
      return;
    }

    if (error && error.code === "INSUFFICIENT_STOCK") {
      res.status(422).json({
        message: error.message,
        code: error.code,
        itemId: error.itemId,
        itemName: error.itemName,
        available: error.available,
        requested: error.requested,
      });
      return;
    }

    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get sale by id
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.item", "name modelNumber")
      .populate("customer.user", "name username email contact address");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sale
router.put("/:id", auth, admin, validateSale, async (req, res) => {
  const session = await mongoose.startSession();
  let populatedSale = null;

  try {
    await session.withTransaction(async () => {
      const sale = await Sale.findById(req.params.id).session(session);
      if (!sale) {
        throw new Error("Sale not found");
      }

      const previousResolved = sale.items || [];
      const previousMap = buildQuantityMapFromResolved(previousResolved);

      const resolvedItems = await resolveSaleItems(req.body.items, session);
      const customer = await resolveCustomerData(req.body.customer, session);

      const newMap = buildQuantityMapFromResolved(resolvedItems);

      // compute difference map: new - old
      const diffMap = new Map();
      const keys = new Set([
        ...Array.from(previousMap.keys()),
        ...Array.from(newMap.keys()),
      ]);
      for (const k of keys) {
        const newQty = newMap.get(k) || 0;
        const oldQty = previousMap.get(k) || 0;
        const diff = newQty - oldQty;
        if (diff !== 0) diffMap.set(k, diff);
      }

      // validate inventory availability for items that will reduce stock
      for (const [itemId, diff] of diffMap.entries()) {
        if (diff > 0) {
          const item = await Item.findById(itemId).session(session);
          if (!item)
            throw new Error("One or more selected items were not found");
          if (Number(item.quantity || 0) < diff) {
            const err = new Error(
              `Insufficient stock for item '${item.name}'. Available: ${item.quantity}, requested: ${diff}`,
            );
            err.code = "INSUFFICIENT_STOCK";
            err.itemId = String(item._id);
            err.itemName = item.name;
            err.available = Number(item.quantity || 0);
            err.requested = diff;
            throw err;
          }
        }
      }

      sale.items = resolvedItems;
      sale.customer = customer;
      sale.additionalCharges = normalizeAdjustments(req.body.additionalCharges);
      sale.additionalCosts = normalizeAdjustments(req.body.additionalCosts);
      sale.dateTime = req.body.dateTime || sale.dateTime;

      await sale.save({ session });

      // apply differences to Item documents (quantity and salesCount)
      await adjustItemsByDifference(diffMap, session);

      populatedSale = await Sale.findById(sale._id)
        .populate("items.item", "name modelNumber")
        .populate("customer.user", "name username email contact address")
        .session(session);
    });

    res.json(populatedSale);
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    if (error && error.code === "INSUFFICIENT_STOCK") {
      res.status(422).json({
        message: error.message,
        code: error.code,
        itemId: error.itemId,
        itemName: error.itemName,
        available: error.available,
        requested: error.requested,
      });
      return;
    }
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Delete sale
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const sale = await Sale.findById(req.params.id).session(session);
      if (!sale) {
        throw new Error("Sale not found");
      }

      const previousMap = buildQuantityMapFromResolved(sale.items || []);

      // When deleting a sale, we need to return quantities and reduce salesCount
      const diffMap = new Map();
      for (const [itemId, qty] of previousMap.entries()) {
        // to reverse the sale we decrease salesCount by qty (diff negative),
        // and increase quantity by qty (inventoryDelta positive)
        diffMap.set(itemId, -qty);
      }

      await adjustItemsByDifference(diffMap, session);

      await Sale.findByIdAndDelete(req.params.id).session(session);
    });

    session.endSession();
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getDateRange = (range = "day", baseDate = new Date()) => {
  const targetDate = new Date(baseDate);
  const start = new Date(targetDate);
  const end = new Date(targetDate);

  switch (range) {
    case "week": {
      const day = start.getDay();
      const diff = (day + 6) % 7;
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - diff);
      end.setHours(23, 59, 59, 999);
      end.setDate(start.getDate() + 6);
      break;
    }
    case "month": {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "year": {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "day":
    default: {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { start, end };
};

const buildHourlySeries = (range = "day", startDate, endDate) => {
  const bucketCount =
    range === "day"
      ? 24
      : range === "week"
        ? 7
        : range === "month"
          ? new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()
          : 12;

  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    label: "",
    sales: 0,
    revenue: 0,
  }));

  const formatLabel = (value, bucketIndex) => {
    if (range === "day") {
      return `${String(bucketIndex).padStart(2, "0")}:00`;
    }

    if (range === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days[bucketIndex];
    }

    if (range === "month") {
      return `${bucketIndex + 1}`;
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[bucketIndex];
  };

  buckets.forEach((bucket, index) => {
    bucket.label = formatLabel(index, index);
  });

  return buckets;
};

// Get sales analytics summary
router.get("/analytics/summary", auth, admin, async (req, res) => {
  try {
    const { range = "day" } = req.query;
    const { start, end } = getDateRange(range, new Date());

    const sales = await Sale.find({
      dateTime: {
        $gte: start,
        $lte: end,
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.totalSale || 0),
      0,
    );
    const totalProfit = sales.reduce(
      (sum, sale) => sum + Number(sale.netProfit || 0),
      0,
    );
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalProducts = await Item.countDocuments();

    const previousRange = getDateRange(range, new Date(start.getTime() - 1));
    const previousSales = await Sale.find({
      dateTime: {
        $gte: previousRange.start,
        $lte: previousRange.end,
      },
    });
    const previousSalesCount = previousSales.length;
    const salesGrowth =
      previousSalesCount > 0
        ? ((totalSales - previousSalesCount) / previousSalesCount) * 100
        : totalSales > 0
          ? 100
          : 0;

    res.json({
      totalSales,
      totalRevenue,
      totalProfit,
      totalCustomers,
      totalProducts,
      salesGrowth,
      trendingUp: salesGrowth >= 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales analytics for charts
router.get("/analytics/hourly", auth, admin, async (req, res) => {
  try {
    const { range = "day" } = req.query;
    const { start, end } = getDateRange(range, new Date());

    const sales = await Sale.find({
      dateTime: {
        $gte: start,
        $lte: end,
      },
    });

    const buckets = buildHourlySeries(range, start, end);

    sales.forEach((sale) => {
      const saleDate = new Date(sale.dateTime);
      let index = 0;

      if (range === "week") {
        index = Math.floor((saleDate.getTime() - start.getTime()) / 86400000);
      } else if (range === "month") {
        index = saleDate.getDate() - 1;
      } else if (range === "year") {
        index = saleDate.getMonth();
      } else {
        index = saleDate.getHours();
      }

      if (index < 0 || index >= buckets.length) {
        return;
      }

      const itemCount = Array.isArray(sale.items)
        ? sale.items.reduce(
            (sum, lineItem) => sum + Number(lineItem.quantity || 0),
            0,
          )
        : 0;

      buckets[index].sales += itemCount;
      buckets[index].revenue += Number(sale.totalSale || 0);
    });

    res.json(buckets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top products analytics, combining sales, favorites, and wishlists
router.get("/analytics/top-products", auth, admin, async (req, res) => {
  try {
    const { range = "day" } = req.query;
    const { start, end } = getDateRange(range, new Date());

    const sales = await Sale.find({
      dateTime: {
        $gte: start,
        $lte: end,
      },
    });

    const itemIds = [
      ...new Set(
        sales
          .flatMap((sale) =>
            (sale.items || [])
              .map((lineItem) => lineItem.item?.toString())
              .filter(Boolean),
          )
          .filter(Boolean),
      ),
    ];

    // Collect unique item names from sales that don't have linked item ids
    const nameKeys = [
      ...new Set(
        sales
          .flatMap((sale) =>
            (sale.items || [])
              .map((lineItem) =>
                !lineItem.item && lineItem.itemName
                  ? String(lineItem.itemName).trim().toLowerCase()
                  : null,
              )
              .filter(Boolean),
          )
          .filter(Boolean),
      ),
    ];

    const itemDocsById = itemIds.length
      ? await Item.find({ _id: { $in: itemIds } }).select(
          "name favoritesCount wishlistCount",
        )
      : [];

    const itemDocsByName = nameKeys.length
      ? await Item.find({ name: { $in: nameKeys } }).select(
          "name favoritesCount wishlistCount",
        )
      : [];

    // Merge and dedupe item docs
    const idSet = new Set(itemDocsById.map((d) => d._id.toString()));
    const itemDocs = [
      ...itemDocsById,
      ...itemDocsByName.filter((d) => !idSet.has(d._id.toString())),
    ];
    const itemLookup = new Map(
      itemDocs.map((item) => [item._id.toString(), item]),
    );
    // Also build a name -> doc lookup so we can resolve items that were
    // saved by name (no linked ObjectId) in older/manual sales entries.
    const itemLookupByName = new Map(
      itemDocs
        .map((item) => [
          String(item.name || "")
            .trim()
            .toLowerCase(),
          item,
        ])
        .filter(([k]) => k),
    );

    const resolvedIds = itemDocs.map((d) => d._id.toString());
    const objectIds = resolvedIds.map((id) => new mongoose.Types.ObjectId(id));
    const favoritesCounts = resolvedIds.length
      ? await User.aggregate([
          { $match: { favorites: { $in: objectIds } } },
          { $unwind: "$favorites" },
          { $match: { favorites: { $in: objectIds } } },
          {
            $group: {
              _id: "$favorites",
              count: { $sum: 1 },
            },
          },
        ])
      : [];

    const wishlistCounts = resolvedIds.length
      ? await User.aggregate([
          { $match: { wishlist: { $in: objectIds } } },
          { $unwind: "$wishlist" },
          { $match: { wishlist: { $in: objectIds } } },
          {
            $group: {
              _id: "$wishlist",
              count: { $sum: 1 },
            },
          },
        ])
      : [];

    const favoritesMap = new Map(
      favoritesCounts.map((entry) => [entry._id.toString(), entry.count]),
    );
    const wishlistMap = new Map(
      wishlistCounts.map((entry) => [entry._id.toString(), entry.count]),
    );

    const aggregate = new Map();

    sales.forEach((sale) => {
      (sale.items || []).forEach((lineItem) => {
        const itemKey = lineItem.item?.toString();
        const key = itemKey || lineItem.itemName;
        const existing = aggregate.get(key) || {
          name: lineItem.itemName || "Unknown item",
          sales: 0,
          revenue: 0,
          profit: 0,
          favorites: 0,
          wishlists: 0,
        };

        const qty = Number(lineItem.quantity || 0);
        const sellingPrice = Number(lineItem.sellingPrice || 0);
        const buyingPrice = Number(lineItem.buyingPrice || 0);

        existing.sales += qty;
        existing.revenue += sellingPrice * qty;
        existing.profit += (sellingPrice - buyingPrice) * qty;

        // Try to resolve an Item document by linked id first, then by name.
        let itemDoc = itemKey ? itemLookup.get(itemKey) : null;
        let resolvedId = itemKey;

        if (!itemDoc && lineItem.itemName) {
          const nameKey = String(lineItem.itemName).trim().toLowerCase();
          const byName = itemLookupByName.get(nameKey);
          if (byName) {
            itemDoc = byName;
            resolvedId = String(byName._id.toString());
          }
        }

        if (itemDoc) {
          existing.name = itemDoc.name;
          // Prefer the aggregated user counts (favoritesMap/wishlistMap)
          // when available, otherwise fall back to the stored item counters.
          existing.favorites =
            (resolvedId && favoritesMap.get(resolvedId)) ??
            Number(itemDoc.favoritesCount || 0);
          existing.wishlists =
            (resolvedId && wishlistMap.get(resolvedId)) ??
            Number(itemDoc.wishlistCount || 0);
        }

        aggregate.set(key, existing);
      });
    });

    const topProducts = Array.from(aggregate.values())
      .sort(
        (a, b) =>
          (b.sales - a.sales) * 100 +
          (b.favorites - a.favorites) * 10 +
          (b.wishlists - a.wishlists),
      )
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        favorites: product.favorites,
        wishlists: product.wishlists,
        sales: product.sales,
        revenue: product.revenue,
        profit: product.profit,
      }));

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
