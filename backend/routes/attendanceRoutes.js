import express from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const VALID_STATUSES = ['present', 'absent'];

router.post('/attendance/mark', requireAuth, async (req, res) => {
  try {
    const { eventId, studentId, status } = req.body;

    if (!eventId || !studentId || !status) {
      return res.status(400).json({
        message: 'eventId, studentId and status are required',
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'status must be either "present" or "absent"',
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({ message: 'Invalid eventId or studentId' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ngoId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    const now = new Date();
    let attendance = await Attendance.findOne({ eventId, studentId });
    const existed = Boolean(attendance);

    if (attendance) {
      attendance.status = status;
      attendance.markedAt = now;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        eventId,
        studentId,
        status,
        markedAt: now,
      });
    }

    // Keep existing registration-based attendance workflows in sync.
    const registration = event.registrations.find(
      reg => reg.userId?.toString() === studentId.toString()
    );
    if (registration) {
      const isPresent = status === 'present';
      registration.attended = isPresent;
      registration.attendedAt = isPresent ? now : null;
      registration.status = isPresent ? 'completed' : 'registered';
      await event.save();
    }

    res.status(existed ? 200 : 201).json({
      message: existed ? 'Attendance updated successfully' : 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

router.get('/attendance/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const event = await Event.findById(eventId).select('_id ngoId');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ngoId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    const attendance = await Attendance.find({ eventId })
      .populate('studentId', 'name email')
      .sort({ markedAt: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

export default router;
