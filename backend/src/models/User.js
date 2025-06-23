// backend/src/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String }, // ✅ New field: Phone number
    profilePic: { type: String, default: '' }, // ✅ New field: Profile picture URL
    role: { type: String, enum: ['admin', 'judge', 'member'], default: 'member' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
