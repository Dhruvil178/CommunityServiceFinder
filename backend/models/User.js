import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  preferences: {
  interests: [String],
  skills: [String],
  availableDays: [String],
  tags: [String],
  city: String
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // hashed
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
