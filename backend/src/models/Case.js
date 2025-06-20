// backend/src/models/Case.js

import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: { type: String }, // Evidence file/image URL
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [
        {
            text: String,
            commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    votes: [
        {
            vote: { type: String, enum: ['yes', 'no'] },
            votedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Case', caseSchema);
