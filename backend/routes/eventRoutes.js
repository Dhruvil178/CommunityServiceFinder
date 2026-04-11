import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import User from "../models/User.js";
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
    if (req.user?.type !== "student") {
      return res.status(403).json({ message: "Only students can register for events" });
    }

    const { eventId } = req.params;
    const studentName = req.body.studentName || req.body.name;
    const studentEmail = req.body.studentEmail || req.body.email;
    const studentPhone = req.body.studentPhone || req.body.phone;
    const studentCollege = req.body.studentCollege || req.body.college;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.spotsAvailable <= 0) {
      return res.status(400).json({ message: "No spots available for this event" });
    }

    const alreadyRegistered = event.registrations?.some(
      (r) => r.studentEmail === studentEmail || (userId && r.userId?.toString() === userId)
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const matchConditions = [];
    if (userId) {
      matchConditions.push({ "registrations.userId": new mongoose.Types.ObjectId(userId) });
    }
    if (studentEmail) {
      matchConditions.push({ "registrations.studentEmail": studentEmail });
    }

    const monthlyCountResult = await Event.aggregate([
      { $unwind: "$registrations" },
      {
        $match: {
          "registrations.registeredAt": { $gte: startOfMonth, $lt: startOfNextMonth },
          $or: matchConditions
        }
      },
      { $count: "count" }
    ]);

    const monthlyRegistrationCount = monthlyCountResult[0]?.count || 0;
    if (monthlyRegistrationCount >= 2) {
      return res.status(400).json({
        message: "Monthly limit reached for registration in an event"
      });
    }

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

    event.spotsAvailable = Math.max(0, event.spotsAvailable - 1);
    await event.save();

    // Update the user's daily quest registration count
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        // Initialize daily quests if not present
        if (!user.dailyQuests) {
          user.dailyQuests = {
            lastReset: new Date().setHours(0, 0, 0, 0),
            quests: {
              DAILY_LOGIN: {
                lastClaimedAt: null,
                claimedToday: false,
                claimCount: 0
              },
              JOIN_2_EVENTS: {
                lastClaimedAt: null,
                claimedToday: false,
                eventRegistrationCount: 0,
                claimCount: 0
              }
            }
          };
        }

        // Count the user's total event registrations
        const eventCount = await Event.countDocuments({
          'registrations.userId': userId
        });

        // Update the JOIN_2_EVENTS quest count
        if (user.dailyQuests.quests.JOIN_2_EVENTS) {
          user.dailyQuests.quests.JOIN_2_EVENTS.eventRegistrationCount = eventCount;
        }

        await user.save();
      }
    }

    res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;