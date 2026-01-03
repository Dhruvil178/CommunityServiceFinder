// backend/models/NGO.js
import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  contactNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  categories: [{
    type: String,
    enum: ['Environmental', 'Education', 'Health', 'Community Support', 'Animal Welfare', 'Technology']
  }],
  website: String,
  logo: String,
  verified: {
    type: Boolean,
    default: false
  },
  eventsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("NGO", ngoSchema);