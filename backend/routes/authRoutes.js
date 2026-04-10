import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import NGO from "../models/NGO.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const generateToken = (id, userType) => {
  return jwt.sign(
    { id, userType },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* =========================
   STUDENT REGISTER
========================= */
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id, "student");

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp || 0,
        coins: user.coins || 0,
        userType: "student",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   STUDENT LOGIN
========================= */
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, "student");

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp || 0,
        coins: user.coins || 0,
        userType: "student",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   NGO REGISTER
========================= */
router.post("/ngo/register", async (req, res) => {
  try {
    const { name, email, password, organizationName, registrationNumber } = req.body;

    const existing = await NGO.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existing) {
      return res.status(400).json({ message: "NGO already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const ngo = await NGO.create({
      name,
      email,
      password: hashedPassword,
      organizationName,
      registrationNumber,
    });

    const token = generateToken(ngo._id, "ngo");

    res.status(201).json({
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
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   NGO LOGIN
========================= */
router.post("/ngo/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const ngo = await NGO.findOne({ email });
    if (!ngo) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, ngo.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(ngo._id, "ngo");

    res.json({
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
    res.status(500).json({ message: "Server error" });
  }
});

export default router;