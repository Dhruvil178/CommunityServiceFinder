import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/authMiddleware.js";
import { sendVerificationEmail } from "../utils/emailService.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Status
router.get("/status", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("email emailVerified twoFactorEnabled");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ isVerified: user.emailVerified, twoFactorEnabled: user.twoFactorEnabled });
});

// Toggle 2FA
router.put("/toggle-2fa", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.emailVerified && !user.twoFactorEnabled) return res.status(400).json({ message: "Verify email first" });
  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save();
  res.json({ twoFactorEnabled: user.twoFactorEnabled });
});

// Resend verification email
router.post("/resend-email", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
  await sendVerificationEmail(user.email, token);
  res.json({ message: "Verification email sent" });
});

// Verify OTP
router.post("/verify-otp", requireAuth, async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ message: "OTP required" });

  try {
    const decoded = jwt.verify(otp, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.emailVerified = true;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

export default router;
