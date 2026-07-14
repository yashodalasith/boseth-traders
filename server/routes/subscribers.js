const express = require("express");
const auth = require("../middleware/auth");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

router.get("/unsubscribe", async (req, res) => {
  try {
    const email = req.query.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).send("Email is required to unsubscribe.");
    }

    await Subscriber.deleteOne({ email });

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 48px auto; padding: 32px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); color: #1f2937;">
        <h1 style="margin-top: 0; color: #0f172a;">You are unsubscribed</h1>
        <p style="line-height: 1.6; color: #475569;">This email address has been removed from promotional notifications. You can close this page now.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send("Unable to process unsubscribe request.");
  }
});

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
