import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NGO from "../models/NGO.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ============================
// NGO REGISTER
// POST /api/ngo/register
// ============================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      organizationName,
      registrationNumber,
      description,
      contactNumber,
      website,
      categories,
    } = req.body;

    // Check existing NGO
    const existing = await NGO.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existing) {
      return res.status(400).json({
        message: "NGO already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const ngo = new NGO({
      name,
      email,
      password: hashedPassword,
      organizationName,
      registrationNumber,
      description,
      contactNumber,
      website,
      categories,
    });

    await ngo.save();

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
        categories: ngo.categories,
        userType: "ngo",
      },
    });
  } catch (err) {
    console.error("NGO Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// NGO LOGIN
// POST /api/ngo/login
// ============================
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
      message: "Login successful",
      token,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organizationName: ngo.organizationName,
        categories: ngo.categories,
        userType: "ngo",
      },
    });
  } catch (err) {
    console.error("NGO Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;