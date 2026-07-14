const express = require("express");
const Brand = require("../models/Brand");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

// Get all brands
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new brand (admin only)
router.post("/", auth, admin, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ message: "Brand already exists" });
    }

    const brand = new Brand({
      name,
      description,
    });

    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update brand (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    brand.name = req.body.name || brand.name;
    brand.description = req.body.description || brand.description;

    await brand.save();
    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete brand (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Check if brand is used by any items
    const Item = require("../models/Item");
    const itemsCount = await Item.countDocuments({ brand: brand._id });

    if (itemsCount > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete brand with associated items" });
    }

    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
