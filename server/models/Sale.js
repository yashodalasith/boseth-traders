// server/models/Sale.js
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    itemName: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
    buyingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalSale: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total sale before saving
saleSchema.pre("save", function (next) {
  this.totalSale = this.sellingPrice * this.quantity;
  next();
});

module.exports = mongoose.model("Sale", saleSchema);
