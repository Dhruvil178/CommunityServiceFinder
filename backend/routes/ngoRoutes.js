// ============================================================
// ADD THESE ROUTES TO YOUR EXISTING backend/routes/ngoRoutes.js
// (paste below your existing router.put("/events/:eventId") block)
// ============================================================
import express from 'express';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import Anthropic from "@anthropic-ai/sdk";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NGO from "../models/NGO.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Email transporter (uses env vars, works with Gmail or any SMTP) ────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // Gmail App Password (not your login password)
  },
});

/* ============================
   GET REGISTRATIONS FOR AN EVENT
   GET /ngo/events/:eventId/registrations
   Returns full student list with attendance status
============================ */
router.get("/events/:eventId/registrations", requireAuth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      ngoId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

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
      registrations: event.registrations,
      stats: {
        total: event.registrations.length,
        registered: event.registrations.filter(r => r.status === "registered").length,
        attended: event.registrations.filter(r => r.attended === true).length,
        completed: event.registrations.filter(r => r.status === "completed").length,
        certificatesIssued: event.registrations.filter(r => r.certificateIssued).length,
      },
    });
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   MARK STUDENT ATTENDANCE (the "ticker")
   POST /ngo/events/:eventId/registrations/:registrationId/attendance
   Body: { attended: true/false }
============================ */
router.post(
  "/events/:eventId/registrations/:registrationId/attendance",
  requireAuth,
  async (req, res) => {
    try {
      const { attended } = req.body;

      const event = await Event.findOne({
        _id: req.params.eventId,
        ngoId: req.user.id,
      });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Find the registration within the event's embedded array
      const registration = event.registrations.id(req.params.registrationId);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      // Update attendance flag
      registration.attended = attended;
      if (attended) {
        registration.attendedAt = new Date();
        registration.status = "completed";
      } else {
        registration.status = "registered";
        registration.attendedAt = null;
      }

      await event.save();

      res.json({
        message: attended ? "Attendance marked ✓" : "Attendance unmarked",
        registration,
      });
    } catch (error) {
      console.error("Mark attendance error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ============================
   MARK BULK ATTENDANCE (all present)
   POST /ngo/events/:eventId/attendance/bulk
   Body: { registrationIds: [...], attended: true }
============================ */
router.post(
  "/events/:eventId/attendance/bulk",
  requireAuth,
  async (req, res) => {
    try {
      const { registrationIds, attended } = req.body;

      const event = await Event.findOne({
        _id: req.params.eventId,
        ngoId: req.user.id,
      });

      if (!event) return res.status(404).json({ message: "Event not found" });

      let updatedCount = 0;
      for (const regId of registrationIds) {
        const registration = event.registrations.id(regId);
        if (registration) {
          registration.attended = attended;
          registration.status = attended ? "completed" : "registered";
          if (attended) registration.attendedAt = new Date();
          updatedCount++;
        }
      }

      await event.save();
      res.json({ message: `${updatedCount} registrations updated`, updatedCount });
    } catch (error) {
      console.error("Bulk attendance error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ============================
   GENERATE AI CERTIFICATE + SEND EMAIL
   POST /ngo/events/:eventId/registrations/:registrationId/certificate
   - Uses Claude to write a personalized certificate
   - Uses Nodemailer to email it to the student
============================ */
router.post(
  "/events/:eventId/registrations/:registrationId/certificate",
  requireAuth,
  async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.eventId,
        ngoId: req.user.id,
      }).populate("ngoId", "organizationName");

      if (!event) return res.status(404).json({ message: "Event not found" });

      const registration = event.registrations.id(req.params.registrationId);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      if (!registration.attended) {
        return res.status(400).json({
          message: "Student must be marked as attended before issuing a certificate.",
        });
      }

      if (registration.certificateIssued) {
        return res.status(400).json({ message: "Certificate already issued." });
      }

      // ── Step 1: Generate personalized certificate text with Claude ──────────
      const ngoName =
        event.ngoId?.organizationName || "the organising NGO";

      const aiPrompt = `
You are generating an official certificate of participation for a community service event.
Write a formal, warm, and motivating certificate body (2–3 short paragraphs) for:

Student Name: ${registration.studentName}
Event Name: ${event.title}
Event Date: ${event.date}
Event Category: ${event.category || "Community Service"}
Location: ${event.location}
NGO / Organiser: ${ngoName}
Duration: ${event.duration || "the full event"}

The certificate should:
1. Officially acknowledge participation and completion
2. Briefly describe the nature of the event
3. Express appreciation and encouragement for future service
4. Keep a professional yet warm tone — this is for a college student

Return ONLY the certificate body text (no subject line, no HTML, no JSON).
      `.trim();

      const aiResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: aiPrompt }],
      });

      const certificateBody =
        aiResponse.content[0]?.text?.trim() || "Congratulations on your participation!";

      // ── Step 2: Build the HTML email with the certificate ────────────────────
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

    <div class="event-badge">🌱 ${event.title}</div>

    <div class="cert-body">${certificateBody}</div>

    <p style="color:#555; font-size:14px;">
      📅 ${event.date} &nbsp;|&nbsp; 📍 ${event.location}
    </p>

    <div class="sign-line"></div>
    <p class="sign-name">${ngoName}</p>
    <p class="sign-role">Authorised Signatory</p>

    <p class="footer">
      Certificate ID: CERT-${Date.now()} &nbsp;·&nbsp;
      Issued on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
    </p>
  </div>
</body>
</html>
      `.trim();

      // ── Step 3: Send email via Nodemailer ────────────────────────────────────
      await transporter.sendMail({
        from: `"${ngoName}" <${process.env.EMAIL_USER}>`,
        to: registration.studentEmail,
        subject: `🎉 Your Certificate for "${event.title}" — ${ngoName}`,
        html: certificateHtml,
      });

      // ── Step 4: Mark certificate as issued in DB ─────────────────────────────
      registration.certificateIssued = true;
      registration.certificateIssuedAt = new Date();
      registration.status = "completed";
      await event.save();

      res.json({
        message: `Certificate sent to ${registration.studentEmail}`,
        certificateIssuedAt: registration.certificateIssuedAt,
      });
    } catch (error) {
      console.error("Certificate generation error:", error);
      res.status(500).json({
        message: "Failed to generate certificate",
        error: error.message,
      });
    }
  }
);

/* ============================
   IMPROVED DASHBOARD STATS
   GET /ngo/dashboard/stats
   (replace existing basic stats route)
============================ */
router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.user.id });

    const now = new Date();
    const activeEvents   = events.filter(e => e.status === "upcoming" || e.status === "ongoing").length;
    const completedEvents = events.filter(e => e.status === "completed").length;

    const allRegistrations = events.flatMap(e => e.registrations || []);
    const totalRegistrations = allRegistrations.length;
    const totalAttended = allRegistrations.filter(r => r.attended).length;
    const totalCertificates = allRegistrations.filter(r => r.certificateIssued).length;

    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((totalAttended / totalRegistrations) * 100)
        : 0;

    // Events this month
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
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
// ============================================================
// ALSO: Add this new event registration route to your
// backend/routes/eventRoutes.js (student-facing)
// POST /api/events/:eventId/register
// ============================================================

// In eventRoutes.js or a new studentRoutes.js:
/*
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
*/