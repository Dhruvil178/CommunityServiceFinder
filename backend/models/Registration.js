import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  name: String,
  email: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Registration", registrationSchema);
