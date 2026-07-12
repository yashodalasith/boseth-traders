const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

const allowedStatuses = new Set([
  "new",
  "pending",
  "done",
  "in-progress",
  "resolved",
]);

router.post("/", auth, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "Subject and message are required" });
    }

    const contactMessage = await ContactMessage.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json(contactMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const messages = await ContactMessage.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({
        message:
          "Status must be one of: new, pending, done, in-progress, resolved",
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("user", "name email");

    if (!message) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
