import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  patientName: {
    type: String,
    required: [true, 'Please provide the patient name'],
    trim: true,
  },
  patientPhone: {
    type: String,
    required: [true, 'Please provide a patient phone number'],
  },
  patientEmail: {
    type: String,
    required: [true, 'Please provide a patient email'],
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide the appointment date'],
  },
  timeSlot: {
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
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure we don't double-book an appointment
AppointmentSchema.index({ doctor: 1, date: 1, 'timeSlot.startTime': 1 }, { unique: true });

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema); 