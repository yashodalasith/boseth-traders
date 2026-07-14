// server/models/Sale.js
const mongoose = require("mongoose");

const calculateSaleTotals = ({
  items = [],
  additionalCharges = [],
  additionalCosts = [],
}) => {
  let totalSale = 0;
  let grossProfit = 0;

  (Array.isArray(items) ? items : []).forEach((lineItem) => {
    const sellingPrice = Number(lineItem.sellingPrice || 0);
    const buyingPrice = Number(lineItem.buyingPrice || 0);
    const quantity = Number(lineItem.quantity || 0);

    const lineTotalSale = sellingPrice * quantity;
    const lineProfit = (sellingPrice - buyingPrice) * quantity;

    totalSale += lineTotalSale;
    grossProfit += lineProfit;
  });

  const totalCharges = (
    Array.isArray(additionalCharges) ? additionalCharges : []
  ).reduce((sum, entry) => sum + Number(entry.value || 0), 0);
  const totalCosts = (
    Array.isArray(additionalCosts) ? additionalCosts : []
  ).reduce((sum, entry) => sum + Number(entry.value || 0), 0);

  return {
    totalSale,
    grossProfit,
    totalCharges,
    totalCosts,
    netProfit: grossProfit + totalCharges - totalCosts,
  };
};

const saleItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    buyingPrice: {
      type: Number,
      min: 0,
      default: 0,
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
    lineTotalSale: {
      type: Number,
      min: 0,
      default: 0,
    },
    lineProfit: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const saleAdjustmentSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const saleCustomerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    items: {
      type: [saleItemSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one sale item is required",
      },
      required: true,
    },
    customer: {
      type: saleCustomerSchema,
      required: true,
    },
    additionalCharges: {
      type: [saleAdjustmentSchema],
      default: [],
    },
    additionalCosts: {
      type: [saleAdjustmentSchema],
      default: [],
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
    grossProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    totalCharges: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalCosts: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    netProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSale: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

saleSchema.pre("save", function (next) {
  const items = Array.isArray(this.items) ? this.items : [];
  const totals = calculateSaleTotals({
    items,
    additionalCharges: this.additionalCharges,
    additionalCosts: this.additionalCosts,
  });

  items.forEach((lineItem) => {
    lineItem.lineTotalSale =
      Number(lineItem.sellingPrice || 0) * Number(lineItem.quantity || 0);
    lineItem.lineProfit =
      (Number(lineItem.sellingPrice || 0) - Number(lineItem.buyingPrice || 0)) *
      Number(lineItem.quantity || 0);
  });

  this.totalSale = totals.totalSale;
  this.grossProfit = totals.grossProfit;
  this.totalCharges = totals.totalCharges;
  this.totalCosts = totals.totalCosts;
  this.netProfit = totals.netProfit;

  next();
});

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
module.exports.calculateSaleTotals = calculateSaleTotals;
