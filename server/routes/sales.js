const express = require("express");
const Sale = require("../models/Sale");
const Item = require("../models/Item");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { validateSale } = require("../middleware/validation");
const router = express.Router();
// Get all sales with optional filtering
router.get("/", auth, admin, async (req, res) => {
  try {
    const { startDate, endDate, itemId } = req.query;
    let filter = {};
    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }
    if (itemId) {
      filter.item = itemId;
    }
    const sales = await Sale.find(filter)
      .populate("item", "name modelNumber")
      .sort({ dateTime: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Create new sale entry
router.post("/", auth, admin, validateSale, async (req, res) => {
  try {
    const { itemId, itemName, buyingPrice, sellingPrice, quantity, dateTime } =
      req.body;
    let item = null;
    if (itemId) {
      item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
    }
    const sale = new Sale({
      item: itemId,
      itemName: item ? item.name : itemName,
      buyingPrice,
      sellingPrice,
      quantity,
      dateTime: dateTime || new Date(),
    });
    await sale.save();
    // Update item sales count if it exists in the system
    if (item) {
      item.salesCount += quantity;
      await item.save();
    }
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get sale by id
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      "item",
      "name modelNumber"
    );

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
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    const { itemId, itemName, buyingPrice, sellingPrice, quantity, dateTime } =
      req.body;
    // If item ID changed, update item sales counts
    if (itemId && sale.item && sale.item.toString() !== itemId) {
      const oldItem = await Item.findById(sale.item);
      if (oldItem) {
        oldItem.salesCount -= sale.quantity;
        await oldItem.save();
      }
      const newItem = await Item.findById(itemId);
      if (newItem) {
        newItem.salesCount += quantity;
        await newItem.save();
      }
    } else if (itemId && !sale.item) {
      const newItem = await Item.findById(itemId);
      if (newItem) {
        newItem.salesCount += quantity;
        await newItem.save();
      }
    } else if (!itemId && sale.item) {
      const oldItem = await Item.findById(sale.item);
      if (oldItem) {
        oldItem.salesCount -= sale.quantity;
        await oldItem.save();
      }
    }
    sale.item = itemId;
    sale.itemName = itemName;
    sale.buyingPrice = buyingPrice;
    sale.sellingPrice = sellingPrice;
    sale.quantity = quantity;
    sale.dateTime = dateTime || sale.dateTime;
    await sale.save();
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete sale
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    // Update item sales count if it exists in the system
    if (sale.item) {
      const item = await Item.findById(sale.item);
      if (item) {
        item.salesCount -= sale.quantity;
        await item.save();
      }
    }
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get sales analytics
router.get("/analytics/hourly", auth, admin, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    const sales = await Sale.find({
      dateTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    // Group sales by hour
    const hourlySales = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sales: 0,
      revenue: 0,
    }));
    sales.forEach((sale) => {
      const hour = new Date(sale.dateTime).getHours();
      hourlySales[hour].sales += sale.quantity;
      hourlySales[hour].revenue += sale.totalSale;
    });
    // Format for chart
    const formattedData = hourlySales.map((data, index) => ({
      hour: `${index}:00`,
      sales: data.sales,
      revenue: data.revenue,
    }));
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
