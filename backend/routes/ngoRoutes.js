import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NGO from "../models/NGO.js";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/* ============================
   NGO REGISTRATION
============================ */
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("organizationName").notEmpty(),
    body("registrationNumber").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        email,
        password,
        organizationName,
        registrationNumber,
        description,
        contactNumber,
        address,
        categories,
        website,
      } = req.body;

      const existingNGO = await NGO.findOne({
        $or: [{ email }, { registrationNumber }],
      });

      if (existingNGO) {
        return res.status(400).json({
          message: "NGO already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const ngo = await NGO.create({
        name,
        email,
        password: hashedPassword,
        organizationName,
        registrationNumber,
        description,
        contactNumber,
        address,
        categories,
        website,
      });

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
          registrationNumber: ngo.registrationNumber,
          verified: ngo.verified,
          userType: "ngo",
        },
      });
    } catch (error) {
      console.error("NGO Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

/* ============================
   NGO LOGIN
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
      message: "Login successful",
      token,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organizationName: ngo.organizationName,
        userType: "ngo",
      },
    });
  } catch (error) {
    console.error("NGO Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ============================
   NGO PROFILE
============================ */
router.get("/profile", requireAuth, async (req, res) => {
  const ngo = await NGO.findById(req.user.id).select("-password");
  res.json(ngo);
});

router.put("/profile", requireAuth, async (req, res) => {
  delete req.body.password;
  delete req.body.registrationNumber;

  const ngo = await NGO.findByIdAndUpdate(
    req.user.id,
    { $set: req.body },
    { new: true }
  ).select("-password");

  res.json({ ngo });
});

/* ============================
   EVENTS
============================ */
router.post("/events", requireAuth, async (req, res) => {
  const event = await Event.create({
    ...req.body,
    ngoId: req.user.id,
  });
  res.status(201).json({ event });
});

router.get("/events", requireAuth, async (req, res) => {
  const events = await Event.find({ ngoId: req.user.id });
  res.json({ events });
});

router.get("/events/:eventId", requireAuth, async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    ngoId: req.user.id,
  });
  res.json({ event });
});

router.put("/events/:eventId", requireAuth, async (req, res) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.eventId, ngoId: req.user.id },
    req.body,
    { new: true }
  );
  res.json({ event });
});

/* ============================
   DASHBOARD
============================ */
router.get("/dashboard/stats", requireAuth, async (req, res) => {
  const events = await Event.find({ ngoId: req.user.id });

  res.json({
    totalEvents: events.length,
    totalRegistrations: events.reduce(
      (sum, e) => sum + e.registrations.length,
      0
    ),
  });
});

export default router;
