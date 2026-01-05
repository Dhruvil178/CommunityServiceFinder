// backend/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // NGO Information
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NGO",
    required: true
  },
  organizer: { type: String, required: true }, // NGO name
  
  // Event Details
  category: {
    type: String,
    enum: ['Environmental', 'Education', 'Health', 'Community Support', 'Animal Welfare', 'Technology'],
    required: true
  },
  skillsRequired: [String],
  tags: [String],
  
  // Location & Time
  city: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  
  // Spots Management
  spotsTotal: { type: Number, required: true },
  spotsAvailable: { type: Number, required: true },
  
  // Registrations
  registrations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName: String,
    studentEmail: String,
    studentPhone: String,
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'cancelled'],
      default: 'registered'
    },
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" }
  }],
  
  // Event Status
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Gamification
  xpReward: { type: Number, default: 50 },
  coinsReward: { type: Number, default: 10 },
  
  // Media
  image: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Event", eventSchema);