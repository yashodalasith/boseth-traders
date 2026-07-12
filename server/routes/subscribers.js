const express = require("express");
const auth = require("../middleware/auth");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const subscriber = await Subscriber.findOne({ user: req.user._id });
    res.json({ subscribed: Boolean(subscriber) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/me", auth, async (req, res) => {
  try {
    const existingSubscriber = await Subscriber.findOne({ user: req.user._id });

    if (existingSubscriber) {
      return res.json({ subscribed: true, message: "Already subscribed" });
    }

    await Subscriber.create({
      user: req.user._id,
      email: req.user.email,
    });

    res.status(201).json({
      subscribed: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    await Subscriber.deleteOne({ user: req.user._id });
    res.json({ subscribed: false, message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
