// backend/src/models/Case.js

import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filedAgainst: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ New field

    status: {
        type: String,
        enum: [
            'Sent',
            'Viewed',
            'Rejected',
            'Accepted',
            'Published for Voting'
        ],
        default: 'Sent'
    },
    isApproved: { type: Boolean, default: false },
    verdict: { type: String },

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
