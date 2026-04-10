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



// ================= CREATE EVENT =================
router.post('/events', requireAuth, async (req, res) => {
  console.log("👉 CREATE EVENT HIT", req.user);

  try {
    const ngo = await NGO.findById(req.user.id);

    if (!ngo) {
      console.log("❌ NGO NOT FOUND:", req.user.id);
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
    console.error('❌ Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});



// ================= GET EVENTS =================
router.get('/events', requireAuth, async (req, res) => {
  console.log("👉 GET EVENTS HIT", req.user);

  try {
    const events = await Event.find({ ngoId: req.user.id }).sort({ createdAt: -1 });
    res.json({ events });

  } catch (error) {
    console.error('❌ Fetch NGO events error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});



// ================= DASHBOARD =================
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  console.log("👉 DASHBOARD HIT", req.user);

  try {
    const ngo = await NGO.findById(req.user.id);

    if (!ngo) {
      console.log("❌ NGO NOT FOUND IN DASHBOARD");
      return res.status(404).json({ message: 'NGO not found' });
    }

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
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
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
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;