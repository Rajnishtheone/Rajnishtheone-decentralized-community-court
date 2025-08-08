// backend/src/models/Case.js

import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Case title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: { 
        type: String, 
        required: [true, 'Case description is required'],
        minlength: [10, 'Description must be at least 10 characters long']
    },
    evidence: { type: String }, // Cloudinary URL for evidence files
    
    filedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },

    status: {
        type: String,
        enum: [
            'Pending Review',
            'Under Review',
            'Published for Voting',
            'Verdict Reached',
            'Closed',
            'Rejected'
        ],
        default: 'Pending Review'
    },
    
    verdict: { type: String },
    
    category: {
        type: String,
        enum: ['Civil', 'Criminal', 'Property', 'Family', 'Business', 'Noise', 'Parking', 'Maintenance', 'Security', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    tags: [String],
    
    // Anti-abuse fields
    abuseScore: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },

    // Verification fields for judges
    verifiedTargetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    verificationNotes: { type: String },
    verifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    verifiedAt: { type: Date },

    comments: [
        {
            text: { 
                type: String, 
                required: true,
                maxlength: [1000, 'Comment cannot exceed 1000 characters']
            },
            commentedBy: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User',
                required: true
            },
            isJudgeComment: { type: Boolean, default: false },
            isAdminComment: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    votes: [
        {
            vote: { 
                type: String, 
                enum: ['yes', 'no'],
                required: true
            },
            votedBy: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User',
                required: true
            },
            votedAt: { type: Date, default: Date.now }
        }
    ]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for vote counts
caseSchema.virtual('yesVotes').get(function() {
    return this.votes.filter(vote => vote.vote === 'yes').length;
});

caseSchema.virtual('noVotes').get(function() {
    return this.votes.filter(vote => vote.vote === 'no').length;
});

caseSchema.virtual('totalVotes').get(function() {
    return this.votes.length;
});

// Virtual for case age
caseSchema.virtual('caseAge').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for better performance
caseSchema.index({ filedBy: 1, createdAt: -1 });
caseSchema.index({ status: 1 });
caseSchema.index({ title: 'text', description: 'text' });
caseSchema.index({ category: 1 });
caseSchema.index({ 'votes.votedBy': 1 });

export default mongoose.model('Case', caseSchema);
