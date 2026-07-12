// server/routes/items.js
const express = require("express");
const { upload } = require("../utils/cloudinary");
const Item = require("../models/Item");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Subscriber = require("../models/Subscriber");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();
const { cloudinary } = require("../utils/cloudinary");
const { sendDiscountNotificationEmail } = require("../utils/email");

const notifyDiscountSubscribers = async (item) => {
  const subscribers = await Subscriber.find().select("email");

  if (!subscribers.length) {
    return;
  }

  const discountLabel =
    item.discountType === "percentage"
      ? `${item.discountValue}% off`
      : `Rs. ${item.discountValue} off`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">New Discount Alert</h2>
      <p>${item.name} is now available with a special discount at Boseth Traders.</p>
      <p><strong>Offer:</strong> ${discountLabel}</p>
      <p><strong>Price:</strong> Rs. ${Number(item.price).toLocaleString()}</p>
    </div>
  `;

  await Promise.all(
    subscribers.map((subscriber) =>
      sendDiscountNotificationEmail({
        to: subscriber.email,
        subject: `New discount: ${item.name}`,
        html,
      }),
    ),
  );
};

// Get all items with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};

    // Category Filter
    if (req.query.category) {
      filter.category = req.query.category; // Filter by category ID directly
    }

    // Brand Filter
    if (req.query.brand) {
      filter.brand = req.query.brand; // Filter by brand ID directly
    }

    // Search Filter
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, "i") },
        { modelNumber: new RegExp(req.query.search, "i") },
        { description: new RegExp(req.query.search, "i") },
      ];
    }

    // Availability Filter (if necessary)
    if (req.query.availability) {
      filter.availability = req.query.availability;
    }

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice)
        filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice)
        filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Has Discount Filter
    if (req.query.hasDiscount === "true") {
      filter.hasDiscount = true; // Only items with discounts
    }

    // Determine Sorting Order
    let sort = { createdAt: -1 }; // Default to sorting by newest

    if (req.query.sort === "price-low") {
      sort = { price: 1 }; // Sort by price: low to high
    } else if (req.query.sort === "price-high") {
      sort = { price: -1 }; // Sort by price: high to low
    } else if (req.query.sort === "name") {
      sort = { name: 1 }; // Sort by name A-Z
    }

    // Get total count first
    const totalItems = await Item.countDocuments(filter);

    // Fetch items with pagination and sorting
    const items = await Item.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      items,
      totalItems, // total number of matching products
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("category", "name")
      .populate("brand", "name");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new item (admin only)
router.post("/", auth, admin, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      modelNumber,
      description,
      price,
      buyingPrice,
      category,
      brand,
      availability,
      quantity,
      hasDiscount,
      discountType,
      discountValue,
      features,
    } = req.body;

    // Check if category exists, if not create it
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = new Category({ name: category });
      await categoryDoc.save();
    }

    // Check if brand exists, if not create it
    let brandDoc = await Brand.findOne({ name: brand });
    if (!brandDoc) {
      brandDoc = new Brand({ name: brand });
      await brandDoc.save();
    }

    // Process images
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
        }))
      : [];

    // Create item
    const item = new Item({
      name,
      modelNumber,
      description,
      price,
      buyingPrice:
        buyingPrice !== undefined && buyingPrice !== ""
          ? Number(buyingPrice)
          : undefined,
      category: categoryDoc._id,
      brand: brandDoc._id,
      availability,
      quantity: availability === "available" ? quantity : 0,
      hasDiscount,
      discountType: hasDiscount ? discountType : undefined,
      discountValue: hasDiscount ? discountValue : undefined,
      features: features ? JSON.parse(features) : [],
      images,
    });

    await item.save();

    // Populate category and brand before sending response
    await item.populate("category", "name");
    await item.populate("brand", "name");

    if (item.hasDiscount) {
      await notifyDiscountSubscribers(item);
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item (admin only)
router.put("/:id", auth, admin, upload.array("images", 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const previousHasDiscount = item?.hasDiscount;

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Process new images if any
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of item.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      // Add new images
      item.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    // Update other fields
    const updates = req.body;

    if (updates.category) {
      let categoryDoc = await Category.findOne({ name: updates.category });
      if (!categoryDoc) {
        categoryDoc = new Category({ name: updates.category });
        await categoryDoc.save();
      }
      item.category = categoryDoc._id;
    }

    if (updates.brand) {
      let brandDoc = await Brand.findOne({ name: updates.brand });
      if (!brandDoc) {
        brandDoc = new Brand({ name: updates.brand });
        await brandDoc.save();
      }
      item.brand = brandDoc._id;
    }

    if (updates.name) item.name = updates.name;
    if (updates.modelNumber) item.modelNumber = updates.modelNumber;
    if (updates.description) item.description = updates.description;
    if (updates.price) item.price = updates.price;
    if (updates.buyingPrice !== undefined) {
      item.buyingPrice =
        updates.buyingPrice === "" || updates.buyingPrice === null
          ? undefined
          : Number(updates.buyingPrice);
    }
    if (updates.availability) item.availability = updates.availability;
    if (updates.quantity) item.quantity = updates.quantity;
    if (updates.hasDiscount !== undefined)
      item.hasDiscount = updates.hasDiscount;
    if (updates.discountType) item.discountType = updates.discountType;
    if (updates.discountValue) item.discountValue = updates.discountValue;
    if (updates.features) item.features = JSON.parse(updates.features);

    await item.save();

    // Populate category and brand before sending response
    await item.populate("category", "name");
    await item.populate("brand", "name");

    if (!previousHasDiscount && item.hasDiscount) {
      await notifyDiscountSubscribers(item);
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete images from Cloudinary
    for (const image of item.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete item (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete images from Cloudinary
    for (const image of item.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
