// server/middleware/validation.js
const { body, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Item creation/update validation
const validateItem = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("modelNumber")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Model number must be between 1 and 50 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("brand").trim().notEmpty().withMessage("Brand is required"),
  body("availability")
    .isIn(["available", "not available", "not specified"])
    .withMessage("Invalid availability status"),
  body("quantity")
    .if(body("availability").equals("available"))
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer when item is available"),
  body("hasDiscount")
    .isBoolean()
    .withMessage("hasDiscount must be a boolean value"),
  body("discountType")
    .if(body("hasDiscount").equals(true))
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be either percentage or fixed"),
  body("discountValue")
    .if(body("hasDiscount").equals(true))
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a positive number"),
  handleValidationErrors,
];

// Sales entry validation
const validateSale = [
  body("itemId").optional().isMongoId().withMessage("Invalid item ID"),
  body("itemName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("buyingPrice")
    .isFloat({ min: 0 })
    .withMessage("Buying price must be a positive number"),
  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("dateTime").optional().isISO8601().withMessage("Invalid date format"),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateItem,
  validateSale,
};
