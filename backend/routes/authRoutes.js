// backend/routes/authRoutes.js
import express from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Student Registration
router.post(
  "/auth/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")
  ],
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign({ id: user._id, userType: 'student' }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          phone: user.phone,
          preferences: user.preferences,
          userType: 'student'
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
/* ============================
   NGO REGISTER
   POST /api/ngo/register
============================ */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      organizationName,
      registrationNumber,
    } = req.body;

    // Check existing NGO
    const existing = await NGO.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existing) {
      return res.status(400).json({ message: "NGO already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const ngo = new NGO({
      name,
      email,
      password: hashedPassword,
      organizationName,
      registrationNumber,
    });

    await ngo.save();

    // Generate token
    const token = jwt.sign(
      { id: ngo._id, userType: "ngo" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "NGO registered successfully",
      token,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organizationName: ngo.organizationName,
        userType: "ngo",
      },
    });
  } catch (err) {
    console.error("NGO register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Student Login
router.post(
  "/auth/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id, userType: 'student' }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          phone: user.phone,
          preferences: user.preferences,
          userType: 'student'
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
/* ============================
   NGO LOGIN
   POST /api/ngo/login
============================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const ngo = await NGO.findOne({ email });
    if (!ngo) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, ngo.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: ngo._id, userType: "ngo" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "NGO login successful",
      token,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organizationName: ngo.organizationName,
        userType: "ngo",
      },
    });
  } catch (err) {
    console.error("NGO login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;