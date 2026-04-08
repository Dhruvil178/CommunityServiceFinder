import express from "express";
import { getEvents, registerEvent } from "../controllers/eventController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/events", getEvents);
router.post("/events/register", registerEvent);
router.post("/events/:eventId/register", requireAuth, async (req, res) => {
  try {
    const { studentName, studentEmail, studentPhone, studentCollege, userId } = req.body;

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.spotsAvailable <= 0) {
      return res.status(400).json({ message: "No spots available for this event" });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.some(
      r => r.studentEmail === studentEmail || r.userId?.toString() === userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    // Add registration
    event.registrations.push({
      userId,
      studentName,
      studentEmail,
      studentPhone,
      studentCollege,
      status: "registered",
      attended: false,
      certificateIssued: false,
      registeredAt: new Date(),
    });

    event.spotsAvailable = Math.max(0, event.spotsAvailable - 1);
    await event.save();

    res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
