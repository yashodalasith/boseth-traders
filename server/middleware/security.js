// server/middleware/security.js
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Security middleware configuration
const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Limit requests from same API
  app.use("/api", limiter);

  // Body parser, reading data from body into req.body
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(
    hpp({
      whitelist: [
        "price",
        "category",
        "brand",
        "availability",
        "hasDiscount",
        "sort",
      ],
    })
  );
};

module.exports = securityMiddleware;
