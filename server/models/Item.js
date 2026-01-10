// server/models/Item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    modelNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    availability: {
      type: String,
      enum: ["available", "not available", "not specified"],
      default: "not specified",
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    hasDiscount: {
      type: Boolean,
      default: false,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: function () {
        return this.hasDiscount;
      },
    },
    discountValue: {
      type: Number,
      min: 0,
      required: function () {
        return this.hasDiscount;
      },
    },
    features: [
      {
        key: String,
        value: String,
      },
    ],
    favoritesCount: {
      type: Number,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
