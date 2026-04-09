import express from 'express';
import Event from '../models/Event.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateCertificateContent } from '../services/certificateService.js';
import { sendCertificateEmail } from '../services/emailService.js';

const router = express.Router();

const EVENT_CATEGORIES = [
  'Environmental',
  'Education',
  'Health',
  'Community Support',
  'Animal Welfare',
  'Technology',
];

const buildEventPayload = (body, ngo, existingEvent = null) => {
  const spotsTotal = Number(body.spotsTotal);
  const registrationsCount = existingEvent?.registrations?.length || 0;

  return {
    title: body.title?.trim(),
    description: body.description?.trim(),
    category: body.category,
    city: body.city?.trim(),
    location: body.location?.trim(),
    date: body.date?.trim(),
    time: body.time?.trim(),
    duration: body.duration?.trim(),
    spotsTotal,
    spotsAvailable: existingEvent
      ? Math.max(0, spotsTotal - registrationsCount)
      : spotsTotal,
    xpReward: Number(body.xpReward) || 50,
    coinsReward: Number(body.coinsReward) || 10,
    image: body.image?.trim(),
    skillsRequired: Array.isArray(body.skillsRequired) ? body.skillsRequired : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    status: body.status || existingEvent?.status || 'upcoming',
    ngoId: existingEvent?.ngoId || ngo._id,
    organizer: existingEvent?.organizer || ngo.organizationName,
  };
};

const validateEventPayload = (body, existingEvent = null) => {
  const requiredFields = [
    ['title', 'Event title is required'],
    ['description', 'Description is required'],
    ['city', 'City is required'],
    ['location', 'Location is required'],
    ['date', 'Date is required'],
    ['time', 'Time is required'],
    ['duration', 'Duration is required'],
  ];

  for (const [field, message] of requiredFields) {
    if (!body[field]?.toString().trim()) return message;
  }

  if (!EVENT_CATEGORIES.includes(body.category)) {
    return 'Please choose a valid category';
  }

  const spotsTotal = Number(body.spotsTotal);
  if (!Number.isInteger(spotsTotal) || spotsTotal < 1) {
    return 'Enter a valid number of spots';
  }

  const registrationsCount = existingEvent?.registrations?.length || 0;
  if (spotsTotal < registrationsCount) {
    return `Total spots cannot be less than current registrations (${registrationsCount})`;
  }

  return null;
};

router.post('/events', requireAuth, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.user.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const validationError = validateEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const event = await Event.create(buildEventPayload(req.body, ngo));

    await NGO.findByIdAndUpdate(ngo._id, {
      $addToSet: { eventsCreated: event._id },
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

router.get('/events', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.user.id }).sort({ createdAt: -1 });
    res.json({ events });
  } catch (error) {
    console.error('Fetch NGO events error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.get('/events/:eventId', requireAuth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      ngoId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Fetch event details error:', error);
    res.status(500).json({ message: 'Failed to fetch event details' });
  }
});

router.put('/events/:eventId', requireAuth, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.user.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const event = await Event.findOne({
      _id: req.params.eventId,
      ngoId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const validationError = validateEventPayload(req.body, event);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    Object.assign(event, buildEventPayload(req.body, ngo, event));
    await event.save();

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

router.get('/events/:eventId/registrations', requireAuth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      ngoId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 🔥 FIX: Safely fallback to an empty array if no one has registered yet
    const regs = event.registrations ||[];

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status,
        spotsAvailable: event.spotsAvailable,
      },
      registrations: regs,
      stats: {
        total: regs.length,
        registered: regs.filter(r => r.status === 'registered').length,
        attended: regs.filter(r => r.attended === true).length,
        completed: regs.filter(r => r.status === 'completed').length,
        certificatesIssued: regs.filter(r => r.certificateIssued).length,
      },
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/events/:eventId/registrations/:registrationId/attendance',
  requireAuth,
  async (req, res) => {
    try {
      const { attended } = req.body;

      const event = await Event.findOne({
        _id: req.params.eventId,
        ngoId: req.user.id,
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const registration = event.registrations.id(req.params.registrationId);
      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      registration.attended = attended;
      if (attended) {
        registration.attendedAt = new Date();
        registration.status = 'completed';
      } else {
        registration.status = 'registered';
        registration.attendedAt = null;
      }

      await event.save();

      res.json({
        message: attended ? 'Attendance marked' : 'Attendance unmarked',
        registration,
      });
    } catch (error) {
      console.error('Mark attendance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/events/:eventId/attendance/bulk', requireAuth, async (req, res) => {
  try {
    const { registrationIds, attended } = req.body;

    const event = await Event.findOne({
      _id: req.params.eventId,
      ngoId: req.user.id,
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    let updatedCount = 0;
    for (const regId of registrationIds || []) {
      const registration = event.registrations.id(regId);
      if (registration) {
        registration.attended = attended;
        registration.status = attended ? 'completed' : 'registered';
        registration.attendedAt = attended ? new Date() : null;
        updatedCount++;
      }
    }

    await event.save();
    res.json({ message: `${updatedCount} registrations updated`, updatedCount });
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/events/:eventId/registrations/:registrationId/certificate',
  requireAuth,
  async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.eventId,
        ngoId: req.user.id,
      }).populate('ngoId', 'organizationName');

      if (!event) return res.status(404).json({ message: 'Event not found' });

      const registration = event.registrations.id(req.params.registrationId);
      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      const studentId = registration.userId?.toString();
      if (!studentId) {
        return res.status(400).json({
          message: 'Registration is not linked to a student account.',
        });
      }

      const isPresentInAttendance = await Attendance.findOne({
        eventId: event._id,
        studentId,
        status: 'present',
      });

      if (!registration.attended && !isPresentInAttendance) {
        return res.status(400).json({
          message: 'Student must be marked as attended before issuing a certificate.',
        });
      }

      if (registration.certificateIssued) {
        return res.status(400).json({ message: 'Certificate already issued.' });
      }

      const student = await User.findById(studentId).select('name email');
      const recipientEmail = student?.email || registration.studentEmail;

      if (!recipientEmail) {
        return res.status(400).json({ message: 'Student email is missing.' });
      }

      const certificateText = await generateCertificateContent({
        studentName: student?.name || registration.studentName || 'Student',
        eventName: event.title,
        date: event.date,
      });

      await sendCertificateEmail({
        email: recipientEmail,
        name: student?.name || registration.studentName || 'Volunteer',
        certificateText,
      });

      registration.certificateIssued = true;
      registration.certificateIssuedAt = new Date();
      registration.status = 'completed';
      await event.save();

      res.json({
        message: `Certificate sent to ${recipientEmail}`,
        certificateIssuedAt: registration.certificateIssuedAt,
      });
    } catch (error) {
      console.error('Certificate generation error:', error);
      res.status(500).json({
        message: 'Failed to send certificate',
        error: error.message,
      });
    }
  }
);
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.user.id });

    const now = new Date();
    const activeEvents = events.filter(
      e => e.status === 'upcoming' || e.status === 'ongoing'
    ).length;
    const completedEvents = events.filter(e => e.status === 'completed').length;

    const allRegistrations = events.flatMap(e => e.registrations || []);
    const totalRegistrations = allRegistrations.length;
    const totalAttended = allRegistrations.filter(r => r.attended).length;
    const totalCertificates = allRegistrations.filter(r => r.certificateIssued).length;

    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((totalAttended / totalRegistrations) * 100)
        : 0;

    const thisMonth = events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    res.json({
      totalEvents: events.length,
      activeEvents,
      completedEvents,
      eventsThisMonth: thisMonth,
      totalRegistrations,
      totalAttended,
      totalCertificates,
      attendanceRate,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


