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
  createdAt: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
phoneVerified: { type: Boolean, default: false },
twoFactorEnabled: { type: Boolean, default: false },

});

export default mongoose.model("User", userSchema);
