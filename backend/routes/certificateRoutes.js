import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateCertificateContent } from '../services/certificateService.js';
import { sendCertificateEmail } from '../services/emailService.js';

const router = express.Router();

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

const findRegistrationByStudentId = (event, studentId) =>
  event.registrations.find(
    registration => registration.userId?.toString() === studentId.toString()
  );

router.post('/certificate/send', requireAuth, async (req, res) => {
  try {
    const { eventId, studentId } = req.body;

    if (!eventId || !studentId) {
      return res.status(400).json({ message: 'eventId and studentId are required' });
    }

    if (!isValidObjectId(eventId) || !isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Invalid eventId or studentId' });
    }

    const event = await Event.findOne({
      _id: eventId,
      ngoId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const student = await User.findById(studentId).select('name email');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.email) {
      return res.status(400).json({ message: 'Student email is missing' });
    }

    const attendance = await Attendance.findOne({
      eventId,
      studentId,
      status: 'present',
    });

    if (!attendance) {
      return res.status(400).json({
        message: 'Certificate can only be sent to students marked as present',
      });
    }

    const certificateText = await generateCertificateContent({
      studentName: student.name || 'Student',
      eventName: event.title,
      date: event.date,
    });

    await sendCertificateEmail({
      email: student.email,
      name: student.name,
      certificateText,
    });

    const registration = findRegistrationByStudentId(event, studentId);
    if (registration) {
      registration.certificateIssued = true;
      registration.certificateIssuedAt = new Date();
      registration.status = 'completed';
      await event.save();
    }

    return res.json({
      message: `Certificate sent to ${student.email}`,
      studentId,
      eventId,
    });
  } catch (error) {
    console.error('Send certificate error:', error);
    return res.status(500).json({
      message: 'Failed to send certificate',
      error: error.message,
    });
  }
});

router.post('/certificate/send-all/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const event = await Event.findOne({
      _id: eventId,
      ngoId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const presentAttendance = await Attendance.find({
      eventId,
      status: 'present',
    }).populate('studentId', 'name email');

    if (!presentAttendance.length) {
      return res.json({
        message: 'No present students found for this event',
        totalPresent: 0,
        sentCount: 0,
        failedCount: 0,
        skippedCount: 0,
        failures: [],
      });
    }

    const alreadyIssued = new Set(
      event.registrations
        .filter(registration => registration.certificateIssued)
        .map(registration => registration.userId?.toString())
        .filter(Boolean)
    );

    const results = await Promise.all(
      presentAttendance.map(async attendance => {
        const studentId =
          attendance.studentId?._id?.toString() || attendance.studentId?.toString();

        if (!studentId) {
          return {
            success: false,
            studentId: null,
            reason: 'Student reference missing in attendance',
          };
        }

        if (alreadyIssued.has(studentId)) {
          return {
            success: true,
            skipped: true,
            studentId,
            reason: 'Certificate already issued',
          };
        }

        try {
          const populatedStudent = attendance.studentId;
          const student =
            populatedStudent?.email && populatedStudent?.name
              ? populatedStudent
              : await User.findById(studentId).select('name email');

          if (!student) {
            return {
              success: false,
              studentId,
              reason: 'Student not found',
            };
          }

          if (!student.email) {
            return {
              success: false,
              studentId,
              reason: 'Student email missing',
            };
          }

          const certificateText = await generateCertificateContent({
            studentName: student.name || 'Student',
            eventName: event.title,
            date: event.date,
          });

          await sendCertificateEmail({
            email: student.email,
            name: student.name,
            certificateText,
          });

          return {
            success: true,
            studentId,
            email: student.email,
          };
        } catch (error) {
          return {
            success: false,
            studentId,
            reason: error.message || 'Failed to generate/send certificate',
          };
        }
      })
    );

    const newlySentStudentIds = new Set(
      results
        .filter(result => result.success && !result.skipped && result.studentId)
        .map(result => result.studentId)
    );

    if (newlySentStudentIds.size) {
      const issuedAt = new Date();
      event.registrations.forEach(registration => {
        if (newlySentStudentIds.has(registration.userId?.toString())) {
          registration.certificateIssued = true;
          registration.certificateIssuedAt = issuedAt;
          registration.status = 'completed';
        }
      });
      await event.save();
    }

    const sentCount = results.filter(result => result.success && !result.skipped).length;
    const skippedCount = results.filter(result => result.success && result.skipped).length;
    const failures = results.filter(result => !result.success);

    return res.json({
      message: 'Bulk certificate processing completed',
      totalPresent: presentAttendance.length,
      sentCount,
      failedCount: failures.length,
      skippedCount,
      failures,
    });
  } catch (error) {
    console.error('Bulk send certificates error:', error);
    return res.status(500).json({
      message: 'Failed to process bulk certificates',
      error: error.message,
    });
  }
});

export default router;

