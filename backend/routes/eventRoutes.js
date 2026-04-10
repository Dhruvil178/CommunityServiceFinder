import express from "express";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch all events for the Student App
// Path is just "/" because server.js already prefixes with "/api/events"
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Register for an event
router.post("/:eventId/register", requireAuth, async (req, res) => {
  try {
    // Support both naming conventions just in case your frontend varies
    const studentName = req.body.studentName || req.body.name;
    const studentEmail = req.body.studentEmail || req.body.email;
    const studentPhone = req.body.studentPhone || req.body.phone;
    const studentCollege = req.body.studentCollege || req.body.college;
    const userId = req.user?.id || req.body.userId;

    const events = await Event.find({ ngoId: req.user.id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.spotsAvailable <= 0) {
      return res.status(400).json({ message: "No spots available for this event" });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations?.some(
      r => r.studentEmail === studentEmail || (userId && r.userId?.toString() === userId)
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    // Add registration directly to the EVENT array (This fixes the NGO side!)
    event.registrations.push({
      userId: userId || null,
      studentName,
      studentEmail,
      studentPhone,
      studentCollege,
      status: "registered",
      attended: false,
      certificateIssued: false,
      registeredAt: new Date(),
    });

    // Reduce available spots
    event.spotsAvailable = Math.max(0, event.spotsAvailable - 1);
    await event.save();

    res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;