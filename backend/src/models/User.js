// backend/src/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: function() { return !this.isGoogleUser; }, // Password not required for Google users
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: { 
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  building: {
    type: String,
    trim: true
  },
  flat: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  age: {
    type: Number,
    min: [18, 'User must be at least 18 years old']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  profilePic: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['admin', 'judge', 'member'], 
    default: 'member' 
  },
  
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  
  // Judge request fields
  judgeRequest: {
    status: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    requestedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  },
  
  // ✅ New fields for better user management
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  
  // ✅ For password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // ✅ User statistics
  casesFiled: { type: Number, default: 0 },
  casesWon: { type: Number, default: 0 },
  casesLost: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 },

  judgeRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  judgeRequestReason: String,
  judgeRequestDate: Date,
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Virtual for win rate
userSchema.virtual('winRate').get(function() {
  if (this.casesFiled === 0) return 0;
  return Math.round((this.casesWon / this.casesFiled) * 100);
});

// ✅ Pre-save middleware to calculate age
userSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// ✅ Additional indexes for better performance (email and username already indexed by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'judgeRequest.status': 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isGoogleUser: 1 });

export default mongoose.model('User', userSchema);
