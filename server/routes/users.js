const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

// Get current user profile
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put("/me", auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ["name", "email", "address", "contact"];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    Object.keys(updates).forEach((update) => {
      req.user[update] = updates[update];
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's favorites
router.get("/me/favorites", auth, async (req, res) => {
  try {
    await req.user.populate({
      path: "favorites",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
      ],
    });
    res.json(req.user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to favorites
router.post("/me/favorites/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    if (req.user.favorites.includes(itemId)) {
      return res.status(400).json({ message: "Item already in favorites" });
    }

    req.user.favorites.push(itemId);
    await req.user.save();

    // Increment favorites count on the item
    const Item = require("../models/Item");
    await Item.findByIdAndUpdate(itemId, { $inc: { favoritesCount: 1 } });

    res.json({ message: "Item added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete("/me/favorites/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!req.user.favorites.includes(itemId)) {
      return res.status(400).json({ message: "Item not in favorites" });
    }

    req.user.favorites = req.user.favorites.filter(
      (id) => id.toString() !== itemId
    );
    await req.user.save();

    // Decrement favorites count on the item
    const Item = require("../models/Item");
    await Item.findByIdAndUpdate(itemId, { $inc: { favoritesCount: -1 } });

    res.json({ message: "Item removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's wishlist
router.get("/me/wishlist", auth, async (req, res) => {
  try {
    await req.user.populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
      ],
    });
    res.json(req.user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post("/me/wishlist/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    if (req.user.wishlist.includes(itemId)) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    req.user.wishlist.push(itemId);
    await req.user.save();

    // Increment wishlist count on the item
    const Item = require("../models/Item");
    await Item.findByIdAndUpdate(itemId, { $inc: { wishlistCount: 1 } });

    res.json({ message: "Item added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete("/me/wishlist/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!req.user.wishlist.includes(itemId)) {
      return res.status(400).json({ message: "Item not in wishlist" });
    }

    req.user.wishlist = req.user.wishlist.filter(
      (id) => id.toString() !== itemId
    );
    await req.user.save();

    // Decrement wishlist count on the item
    const Item = require("../models/Item");
    await Item.findByIdAndUpdate(itemId, { $inc: { wishlistCount: -1 } });

    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by id (admin only)
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = req.body;
    const allowedUpdates = ["name", "email", "address", "contact", "role"];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    Object.keys(updates).forEach((update) => {
      user[update] = updates[update];
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
