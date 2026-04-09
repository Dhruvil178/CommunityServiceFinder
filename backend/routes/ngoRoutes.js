import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import Event from '../models/Event.js';
import NGO from '../models/NGO.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

      if (!registration.attended) {
        return res.status(400).json({
          message: 'Student must be marked as attended before issuing a certificate.',
        });
      }

      if (registration.certificateIssued) {
        return res.status(400).json({ message: 'Certificate already issued.' });
      }

      const ngoName = event.ngoId?.organizationName || 'the organising NGO';

      const aiPrompt = `
You are generating an official certificate of participation for a community service event.
Write a formal, warm, and motivating certificate body (2-3 short paragraphs) for:

Student Name: ${registration.studentName}
Event Name: ${event.title}
Event Date: ${event.date}
Event Category: ${event.category || 'Community Service'}
Location: ${event.location}
NGO / Organiser: ${ngoName}
Duration: ${event.duration || 'the full event'}

The certificate should:
1. Officially acknowledge participation and completion
2. Briefly describe the nature of the event
3. Express appreciation and encouragement for future service
4. Keep a professional yet warm tone - this is for a college student

Return ONLY the certificate body text (no subject line, no HTML, no JSON).
      `.trim();

      const aiResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: aiPrompt }],
      });

      const certificateBody =
        aiResponse.content[0]?.text?.trim() || 'Congratulations on your participation!';

      const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Georgia, serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .certificate {
      background: #fff;
      border: 8px double #8b6914;
      max-width: 680px;
      margin: 0 auto;
      padding: 48px;
      text-align: center;
    }
    .org-name { font-size: 13px; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .cert-title { font-size: 36px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px; }
    .cert-subtitle { font-size: 14px; color: #6b7280; margin-bottom: 28px; letter-spacing: 1px; }
    .divider { border: none; border-top: 2px solid #e5c76b; margin: 24px auto; width: 200px; }
    .presented-to { font-size: 14px; color: #555; margin-bottom: 6px; }
    .student-name { font-size: 30px; font-style: italic; color: #1a1a1a; margin-bottom: 24px; }
    .cert-body { font-size: 15px; color: #374151; line-height: 1.8; white-space: pre-line; text-align: left; margin-bottom: 28px; }
    .event-badge {
      display: inline-block;
      background: #fef3c7;
      border: 1px solid #e5c76b;
      border-radius: 8px;
      padding: 8px 24px;
      font-size: 16px;
      color: #92400e;
      font-weight: bold;
      margin-bottom: 24px;
    }
    .footer { font-size: 12px; color: #9ca3af; margin-top: 32px; }
    .sign-line { border-top: 1px solid #d1d5db; width: 180px; margin: 32px auto 4px; }
    .sign-name { font-size: 14px; color: #374151; font-weight: bold; }
    .sign-role { font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="certificate">
    <p class="org-name">${ngoName}</p>
    <h1 class="cert-title">Certificate of Participation</h1>
    <p class="cert-subtitle">COMMUNITY SERVICE ACHIEVEMENT</p>
    <hr class="divider"/>

    <p class="presented-to">This certificate is proudly presented to</p>
    <h2 class="student-name">${registration.studentName}</h2>

    <div class="event-badge">${event.title}</div>

    <div class="cert-body">${certificateBody}</div>

    <p style="color:#555; font-size:14px;">
      ${event.date} | ${event.location}
    </p>

    <div class="sign-line"></div>
    <p class="sign-name">${ngoName}</p>
    <p class="sign-role">Authorised Signatory</p>

    <p class="footer">
      Certificate ID: CERT-${Date.now()} ·
      Issued on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
</body>
</html>
      `.trim();

      await transporter.sendMail({
        from: `"${ngoName}" <${process.env.EMAIL_USER}>`,
        to: registration.studentEmail,
        subject: `Your Certificate for "${event.title}" - ${ngoName}`,
        html: certificateHtml,
      });

      registration.certificateIssued = true;
      registration.certificateIssuedAt = new Date();
      registration.status = 'completed';
      await event.save();

      res.json({
        message: `Certificate sent to ${registration.studentEmail}`,
        certificateIssuedAt: registration.certificateIssuedAt,
      });
    } catch (error) {
      console.error('Certificate generation error:', error);
      res.status(500).json({
        message: 'Failed to generate certificate',
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
