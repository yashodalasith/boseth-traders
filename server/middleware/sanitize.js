// middlewares/sanitize.js
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss"); // use xss package, not xss-clean

/**
 * Recursively sanitize an object:
 * - Strings: XSS-cleaned
 * - Arrays/Objects: recursively sanitized
 * - Other types: left as-is
 */
const sanitizeObject = (obj) => {
  if (typeof obj === "string") {
    return xss(obj); // safe XSS cleaning for strings only
  }

  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, sanitizeObject(val)])
    );
  }

  return obj; // numbers, booleans, null, undefined remain as-is
};

// Middleware function
const sanitizeMiddleware = (req, res, next) => {
  if (req.body)
    req.body = sanitizeObject(
      mongoSanitize.sanitize(req.body, { replaceWith: "" })
    );
  if (req.params)
    req.params = sanitizeObject(
      mongoSanitize.sanitize(req.params, { replaceWith: "" })
    );
  if (req.query)
    req.query = sanitizeObject(
      mongoSanitize.sanitize(req.query, { replaceWith: "" })
    );

  next();
};

module.exports = sanitizeMiddleware;
