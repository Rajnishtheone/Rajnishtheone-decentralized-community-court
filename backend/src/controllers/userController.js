// backend/src/controllers/userController.js

import User from '../models/User.js';
import Case from '../models/Case.js';

// ===========================
// Get User Profile
// ===========================
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Update User Profile
// ===========================
// ===========================
// Update Logged-in User Profile
// ===========================
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (req.body.phone) user.phone = req.body.phone;
        if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ===========================
// Update User Role (Admin Only)
// ===========================
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Get User Dashboard
// ===========================
// ===========================
// Get User Dashboard
// ===========================
export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cases filed by the user
        const myCases = await Case.find({ createdBy: userId });

        // Cases filed against the user
        const casesAgainstMe = await Case.find({ filedAgainst: userId });

        // Votes by user
        const votedCases = await Case.find({ 'votes.votedBy': userId })
            .select('title votes')
            .lean();

        const myVotes = votedCases.flatMap(c => {
            return c.votes
                .filter(v => v.votedBy.toString() === userId)
                .map(v => ({ caseTitle: c.title, vote: v.vote }));
        });

        // Comments by user
        const commentedCases = await Case.find({ 'comments.commentedBy': userId })
            .select('title comments')
            .lean();

        const myComments = commentedCases.flatMap(c => {
            return c.comments
                .filter(cm => cm.commentedBy.toString() === userId)
                .map(cm => ({ caseTitle: c.title, text: cm.text, date: cm.createdAt }));
        });

        // Count filed cases this month
        const casesFiledThisMonth = myCases.filter(c => {
            const created = new Date(c.createdAt);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        const remainingCases = 4 - casesFiledThisMonth;

        res.status(200).json({
            user,
            myCases,
            casesAgainstMe,
            myVotes,
            myComments,
            remainingCasesThisMonth: remainingCases >= 0 ? remainingCases : 0
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

