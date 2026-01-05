// backend/models/Certificate.js
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  // Student Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  
  // Event Information
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  eventTitle: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventDuration: { type: String, required: true },
  
  // NGO Information
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NGO",
    required: true
  },
  ngoName: { type: String, required: true },
  
  // Certificate Details
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  
  // Verification
  verified: {
    type: Boolean,
    default: true
  },
  
  // Additional Details
  hoursCompleted: String,
  skillsGained: [String],
  category: String,
  
  // Gamification Rewards
  xpAwarded: Number,
  coinsAwarded: Number,
  
  createdAt: { type: Date, default: Date.now }
});

// Generate unique certificate number before saving
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.certificateNumber = `CERT-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model("Certificate", certificateSchema);