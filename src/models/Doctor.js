import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the doctor name'],
    trim: true,
  },
  specialization: {
    type: String,
    required: [true, 'Please provide the specialization'],
    trim: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
  },
  availableSlots: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema); 