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

/* =========================================================
   CREATE EVENT
========================================================= */
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

/* =========================================================
   GET NGO EVENTS
========================================================= */
router.get('/events', requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.user.id }).sort({ createdAt: -1 });
    res.json({ events });

  } catch (error) {
    console.error('Fetch NGO events error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

/* =========================================================
   🔥 FIX: GET EVENT REGISTRATIONS (MISSING ROUTE)
   THIS FIXES YOUR 404 ERROR
========================================================= */
router.get('/events/:eventId/registrations', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('Fetching registrations for eventId:', eventId, 'by NGO:', req.user.id);
    const event = await Event.findById(eventId).populate('registrations');

    if (!event) {
      console.log('Event not found for eventId:', eventId);
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event belongs to the NGO
    if (event.ngoId.toString() !== req.user.id) {
      console.log('Event does not belong to NGO. Event ngoId:', event.ngoId, 'NGO id:', req.user.id);
      return res.status(403).json({ message: 'Unauthorized - you do not own this event' });
    }

    const registrations = event.registrations || [];
    
    // Get attendance records to merge with registration data
    const attendanceRecords = await Attendance.find({ eventId });
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record;
    });

    // Update registrations with attendance data
    const updatedRegistrations = registrations.map(reg => {
      const studentId = reg.userId?.toString();
      const attendanceRecord = studentId ? attendanceMap[studentId] : null;
      
      if (attendanceRecord) {
        // Use attendance record status if it exists
        reg.attended = attendanceRecord.status === 'present';
        reg.attendedAt = attendanceRecord.markedAt;
      }
      
      return reg;
    });

    const stats = {
      total: registrations.length,
      attended: updatedRegistrations.filter(r => r.attended).length,
      certificatesIssued: updatedRegistrations.filter(r => r.certificateIssued).length,
      pendingCertificates: updatedRegistrations.filter(r => r.attended && !r.certificateIssued).length,
    };

    console.log('Found event:', event.title, 'with', registrations.length, 'registrations');
    res.json({ 
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status,
        spotsTotal: event.spotsTotal,
        spotsAvailable: event.spotsAvailable,
      },
      stats,
      registrations: updatedRegistrations 
    });

  } catch (error) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

/* =========================================================
   DELETE EVENT - NEW ROUTE
========================================================= */
router.delete('/events/:eventId', requireAuth, async (req, res) => {
  console.log('[NGO ROUTES] DELETE /events/', req.params.eventId, 'by user', req.user.id);
  try {
    const { eventId } = req.params;
    const ngo = await NGO.findById(req.user.id);

    if (!ngo) {
      console.log('[NGO ROUTES] NGO not found:', req.user.id);
      return res.status(404).json({ message: 'NGO not found' });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      console.log('[NGO ROUTES] Event not found:', eventId);
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ngoId.toString() !== req.user.id) {
      console.log('[NGO ROUTES] Unauthorized:', event.ngoId, '!=', req.user.id);
      return res.status(403).json({ message: 'Unauthorized - you do not own this event' });
    }

    // Remove from NGO's eventsCreated array
    await NGO.findByIdAndUpdate(req.user.id, {
      $pull: { eventsCreated: eventId }
    });

    await Event.findByIdAndDelete(eventId);

    console.log('[NGO ROUTES] Event deleted:', eventId);
    res.json({ 
      message: 'Event deleted successfully',
      deletedEventId: eventId 
    });

  } catch (error) {
    console.error('[NGO ROUTES] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

/* =========================================================
   BULK ATTENDANCE MARKING
========================================================= */
router.post('/events/:eventId/attendance/bulk', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { registrationIds, attended } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ message: 'registrationIds must be a non-empty array' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized - you do not own this event' });
    }

    const now = new Date();
    let updatedCount = 0;

    for (const regId of registrationIds) {
      const registration = event.registrations.id(regId);
      if (registration) {
        registration.attended = attended;
        registration.attendedAt = attended ? now : null;
        registration.status = attended ? 'completed' : 'registered';
        updatedCount++;

        // Also update attendance record if student is linked
        if (registration.userId) {
          let attendance = await Attendance.findOne({ 
            eventId, 
            studentId: registration.userId 
          });
          
          if (attendance) {
            attendance.status = attended ? 'present' : 'absent';
            attendance.markedAt = now;
          } else {
            attendance = new Attendance({
              eventId,
              studentId: registration.userId,
              status: attended ? 'present' : 'absent',
              markedAt: now,
            });
          }

          // Handle XP/coins rewards
          const student = await User.findById(registration.userId);
          if (student) {
            const rewardXp = Number(event.xpReward || 0);
            const rewardCoins = Number(event.coinsReward || 0);

            if (attended) {
              if (attendance.status !== 'present') {
                student.xp = Math.max(0, student.xp + rewardXp);
                student.coins = Math.max(0, student.coins + rewardCoins);
                attendance.xpAwarded = rewardXp;
                attendance.coinsAwarded = rewardCoins;
              }
            } else {
              if (attendance.status === 'present') {
                student.xp = Math.max(0, student.xp - (attendance.xpAwarded || rewardXp));
                student.coins = Math.max(0, student.coins - (attendance.coinsAwarded || rewardCoins));
                attendance.xpAwarded = 0;
                attendance.coinsAwarded = 0;
              }
            }
            await student.save();
          }

          await attendance.save();
        }
      }
    }

    await event.save();

    res.json({ 
      message: `Successfully updated ${updatedCount} registrations`,
      updatedCount 
    });

  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

/* =========================================================
   DASHBOARD
========================================================= */
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.user.id);

    if (!ngo) {
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
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
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