import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  skillsRequired: [String],
  tags: [String],
  city: String,
  category: String,
  date: String,
  time: String,
  duration: String,
  location: String,
  organizer: String,
  spotsAvailable: Number,
  spotsTotal: Number,
  image: String,
});

export default mongoose.model("Event", eventSchema);
