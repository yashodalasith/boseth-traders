// server/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { sendPasswordResetEmail } = require("../utils/email");
require("dotenv").config();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, address, contact } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username",
      });
    }

    // Create user
    const user = new User({
      name,
      username,
      email,
      password,
      address,
      contact,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");

      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      await sendPasswordResetEmail(user.email, resetToken);
    }

    // 🔒 Always return success (prevents email enumeration)
    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong. Try again." });
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          oauthId: profile.id,
          oauthProvider: "google",
        });

        if (user) {
          return done(null, user);
        }

        // Check if user with this email already exists
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link OAuth account to existing user
          user.oauthId = profile.id;
          user.oauthProvider = "google";
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value.split("@")[0],
          oauthId: profile.id,
          oauthProvider: "google",
          // Generate a random password that won't be used
          password: Math.random().toString(36).slice(-8),
        });

        await user.save();
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

// Configure Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          oauthId: profile.id,
          oauthProvider: "facebook",
        });

        if (user) {
          return done(null, user);
        }

        // Check if user with this email already exists
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.id}@facebook.com`;
        user = await User.findOne({ email });

        if (user) {
          // Link OAuth account to existing user
          user.oauthId = profile.id;
          user.oauthProvider = "facebook";
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          name: profile.displayName,
          email: email,
          username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
          oauthId: profile.id,
          oauthProvider: "facebook",
          // Generate a random password that won't be used
          password: Math.random().toString(36).slice(-8),
        });

        await user.save();
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  },
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  },
);

// Get current user
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
