const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateSaleTotals } = require("../models/Sale");

test("calculateSaleTotals aggregates line totals, charges, costs, and net profit", () => {
  const result = calculateSaleTotals({
    items: [
      { sellingPrice: 100, buyingPrice: 70, quantity: 2 },
      { sellingPrice: 50, buyingPrice: 40, quantity: 1 },
    ],
    additionalCharges: [{ label: "Delivery", value: 15 }],
    additionalCosts: [{ label: "Packaging", value: 5 }],
  });

  assert.equal(result.totalSale, 250);
  assert.equal(result.grossProfit, 70);
  assert.equal(result.totalCharges, 15);
  assert.equal(result.totalCosts, 5);
  assert.equal(result.netProfit, 80);
});
