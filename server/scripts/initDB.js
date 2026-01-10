// server/scripts/initDB.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
require("dotenv").config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    // Create default categories
    const defaultCategories = [
      "Electronics",
      "Home Appliances",
      "Kitchenware",
      "Gift Items",
      "Mobile Phones",
      "Laptops & Computers",
      "TVs & Monitors",
      "Audio Equipment",
    ];

    for (const categoryName of defaultCategories) {
      const categoryExists = await Category.findOne({ name: categoryName });
      if (!categoryExists) {
        const category = new Category({ name: categoryName });
        await category.save();
      }
    }

    // Create default brands
    const defaultBrands = [
      "Samsung",
      "LG",
      "Sony",
      "Panasonic",
      "Philips",
      "Tefal",
      "Apple",
      "Huawei",
      "Bosch",
      "Whirlpool",
    ];

    for (const brandName of defaultBrands) {
      const brandExists = await Brand.findOne({ name: brandName });
      if (!brandExists) {
        const brand = new Brand({ name: brandName });
        await brand.save();
      }
    }

    console.log("Database initialized successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initDatabase();
