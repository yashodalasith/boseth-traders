// middlewares/sanitize.js
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

/**
 * Recursively sanitize an object:
 * - Strings: XSS-cleaned
 * - Objects/Arrays: sanitized recursively
 * - Other types: returned as-is
 */
const sanitizeObject = (obj) => {
  if (typeof obj === "string") return xss(obj); // sanitize string
  if (Array.isArray(obj)) return obj.map(sanitizeObject); // sanitize array elements
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, sanitizeObject(val)])
    );
  }
  return obj; // numbers, booleans, null, etc.
};

// Middleware function
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    const sanitizedBody = mongoSanitize.sanitize(req.body);
    req.body = sanitizeObject(sanitizedBody);
  }

  if (req.params) {
    const sanitizedParams = mongoSanitize.sanitize(req.params);
    req.params = sanitizeObject(sanitizedParams);
  }

  // Do NOT sanitize req.query to avoid read-only error
  next();
};

module.exports = sanitizeMiddleware;
