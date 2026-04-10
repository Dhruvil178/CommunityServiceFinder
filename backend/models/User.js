import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  bio: {
    type: String,
    default: "",
  },

  phone: {
    type: String,
    default: "",
  },

  preferences: {
    interests: [String],
    skills: [String],
    availableDays: [String],
    tags: [String],
    city: String,
  },

  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // hashed
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  
  // Achievements tracking
  achievements: {
    type: Map,
    of: {
      id: String,
      unlockedAt: Date,
    },
    default: new Map(),
  },

  // Track if user has received the first login welcome achievement
  hasReceivedFirstLoginAchievement: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
phoneVerified: { type: Boolean, default: false },
twoFactorEnabled: { type: Boolean, default: false },

});

export default mongoose.model("User", userSchema);
