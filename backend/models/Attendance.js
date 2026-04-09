import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
