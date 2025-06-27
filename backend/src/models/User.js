// backend/src/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profilePic: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'judge', 'member'], default: 'member' },
  
  // ✅ For password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
