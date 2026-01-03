import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router(); // ✅ declare router first

// GET /api/profile - Get user profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile - Update user profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, email, bio, phone, preferences } = req.body; // include bio + phone

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;       // update bio
    if (phone !== undefined) user.phone = phone; // update phone
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; // ✅ export default at the end
