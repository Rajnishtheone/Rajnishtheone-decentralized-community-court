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
export const updateUserProfile = async (req, res) => {
    try {
        const { username, phone, profilePic } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (profilePic) user.profilePic = profilePic;

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
export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const myCases = await Case.find({ createdBy: userId });
        const casesFiledThisMonth = myCases.filter(c => {
            const caseMonth = new Date(c.createdAt).getMonth();
            const currentMonth = new Date().getMonth();
            return caseMonth === currentMonth;
        }).length;

        const remainingCases = 4 - casesFiledThisMonth;

        res.status(200).json({
            user,
            myCases,
            remainingCasesThisMonth: remainingCases >= 0 ? remainingCases : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
