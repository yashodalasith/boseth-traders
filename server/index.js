const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const passport = require("passport");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const categoryRoutes = require("./routes/categories");
const brandRoutes = require("./routes/brands");
const salesRoutes = require("./routes/sales");
const userRoutes = require("./routes/users");
const sanitizeMiddleware = require("./middleware/sanitize");

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;
const limiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000, // 15 minutes
  max: maxRequests, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization
app.use(sanitizeMiddleware);

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

// Initialize passport
app.use(passport.initialize());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
