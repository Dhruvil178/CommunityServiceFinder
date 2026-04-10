import express from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
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
    const previousStatus = attendance?.status;

    if (attendance) {
      attendance.status = status;
      attendance.markedAt = now;
    } else {
      attendance = new Attendance({
        eventId,
        studentId,
        status,
        markedAt: now,
      });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student user not found' });
    }

    const rewardXp = Number(event.xpReward || 0);
    const rewardCoins = Number(event.coinsReward || 0);

    let xpDelta = 0;
    let coinsDelta = 0;

    if (status === 'present') {
      if (previousStatus !== 'present') {
        xpDelta = rewardXp - (attendance.xpAwarded || 0);
        coinsDelta = rewardCoins - (attendance.coinsAwarded || 0);
        attendance.xpAwarded = rewardXp;
        attendance.coinsAwarded = rewardCoins;
      }
    } else {
      if (previousStatus === 'present') {
        xpDelta = -(attendance.xpAwarded || rewardXp);
        coinsDelta = -(attendance.coinsAwarded || rewardCoins);
        attendance.xpAwarded = 0;
        attendance.coinsAwarded = 0;
      }
    }

    if (xpDelta !== 0 || coinsDelta !== 0) {
      student.xp = Math.max(0, student.xp + xpDelta);
      student.coins = Math.max(0, student.coins + coinsDelta);
      await student.save();
    }

    await attendance.save();

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
      student: {
        id: student._id,
        xp: student.xp,
        coins: student.coins,
      },
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
