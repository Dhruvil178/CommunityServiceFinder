import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router(); // ✅ declare router first

// GET /api/profile - Get user profile with game stats
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        ...user.toObject(),
        xp: user.xp || 0,
        coins: user.coins || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/leaderboard - Get top students by XP/level
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const users = await User.find()
      .select("name xp coins _id createdAt")
      .sort({ xp: -1 })
      .limit(limit);

    // Calculate level from XP (level * 100 XP required per level)
    const leaderboard = users.map((user, index) => {
      let level = 1;
      let remainingXp = user.xp || 0;
      while (remainingXp >= level * 100) {
        remainingXp -= level * 100;
        level++;
      }
      return {
        rank: index + 1,
        userId: user._id.toString(),
        name: user.name || 'Anonymous',
        xp: user.xp || 0,
        coins: user.coins || 0,
        level,
        currentLevelXp: remainingXp,
      };
    });

    res.json({ leaderboard });
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

// POST /api/profile/sync-achievements - Sync achievements to backend
router.post("/profile/sync-achievements", requireAuth, async (req, res) => {
  try {
    const { achievements } = req.body;
    if (!achievements) {
      return res.status(400).json({ message: "Achievements data required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Store achievements as a Map
    user.achievements = new Map(Object.entries(achievements).map(([key, value]) => [
      key,
      {
        id: key,
        unlockedAt: new Date(value.unlockedAt) || new Date(),
      }
    ]));

    await user.save();

    res.json({ message: "Achievements synced successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/sync-game-state - Sync XP and coins to backend
router.post("/profile/sync-game-state", requireAuth, async (req, res) => {
  try {
    const { xp, coins } = req.body;

    if (typeof xp !== 'number' || typeof coins !== 'number') {
      return res.status(400).json({ message: "XP and coins must be numbers" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp = xp;
    user.coins = coins;

    await user.save();

    res.json({
      message: "Game state synced successfully",
      user: {
        xp: user.xp,
        coins: user.coins,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/profile/full - Get user profile with achievements
router.get("/profile/full", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert achievements Map to object
    const achievementsObj = {};
    if (user.achievements && typeof user.achievements.entries === 'function') {
      for (const [key, value] of user.achievements.entries()) {
        achievementsObj[key] = value;
      }
    } else if (user.achievements) {
      Object.assign(achievementsObj, user.achievements);
    }

    res.json({
      user: {
        ...user.toObject(),
        xp: user.xp || 0,
        coins: user.coins || 0,
        achievements: achievementsObj,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/mark-first-login - Mark user as having received first login achievement
router.post("/profile/mark-first-login", requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { hasReceivedFirstLoginAchievement: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ 
      message: "First login achievement marked",
      hasReceivedFirstLoginAchievement: user.hasReceivedFirstLoginAchievement 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; // ✅ export default at the end
