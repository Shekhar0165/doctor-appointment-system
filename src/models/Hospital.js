import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the hospital name'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide the hospital address'],
    trim: true,
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
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema); 