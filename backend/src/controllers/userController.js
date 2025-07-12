// =======================
// IMPORTS
// =======================
import User from '../models/User.js';
import Case from '../models/Case.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';
import { forgotPasswordTemplate } from '../utils/emailTemplates.js';

// =======================
// 1. GET USER PROFILE BY ID (Protected)
// =======================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 1.1. GET CURRENT USER PROFILE (Protected)
// =======================
const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 2. UPDATE USER ROLE (Admin Only)
// =======================
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = req.body.role;
    await user.save();

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 3. UPDATE USER PROFILE (Phone, Profile Picture)
// =======================
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update all fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.building) user.building = req.body.building;
    if (req.body.flat) user.flat = req.body.flat;
    if (req.body.gender) user.gender = req.body.gender;
    
    // Update profile picture if uploaded
    if (req.file) {
      // Store the file path for local storage
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 4. CHANGE PASSWORD (Protected)
// =======================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user with password for comparison
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 5. GET USER DASHBOARD STATS
// =======================
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cases
    const userCases = await Case.find({ filedBy: userId });
    const casesFiled = userCases.length;

    // Get user's votes
    const userVotes = await Case.aggregate([
      { $unwind: '$votes' },
      { $match: { 'votes.user': userId } },
      { $count: 'totalVotes' }
    ]);
    const totalVotes = userVotes.length > 0 ? userVotes[0].totalVotes : 0;

    // Calculate win rate (cases where user's vote matched final verdict)
    const resolvedCases = userCases.filter(case_ => case_.status === 'resolved');
    const wins = resolvedCases.filter(case_ => {
      const userVote = case_.votes.find(vote => vote.user.toString() === userId);
      return userVote && userVote.vote === case_.verdict;
    }).length;
    const winRate = resolvedCases.length > 0 ? Math.round((wins / resolvedCases.length) * 100) : 0;

    // Calculate reputation (based on activity and accuracy)
    const reputation = Math.round((totalVotes * 10) + (winRate * 2));

    res.status(200).json({
      casesFiled,
      totalVotes,
      winRate,
      reputation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 6. FORGOT PASSWORD - Send Reset Email
// =======================
const passwordResetTokens = {}; // In-memory (for demo); in production, store in DB with expiry

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    passwordResetTokens[token] = { email, expires: Date.now() + 1000 * 60 * 15 }; // 15 min expiry

    // Send email
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    await sendEmail({
      to: email,
      subject: '🔐 Reset Your Password',
      html: forgotPasswordTemplate(user.name || user.username, resetLink)
    });

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 7. RESET PASSWORD - Accept Token
// =======================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const record = passwordResetTokens[token];
    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: record.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    delete passwordResetTokens[token];
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 8. CONTACT US
// =======================
const contactUs = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@dcccourt.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 9. REQUEST JUDGE ROLE
// =======================
const requestJudgeRole = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required for judge request' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'member') {
      return res.status(400).json({ message: 'Only members can request judge role' });
    }

    // Check if user already has a pending request
    if (user.judgeRequestStatus === 'pending') {
      return res.status(400).json({ message: 'Judge request already pending' });
    }

    // Check if user is already a judge
    if (user.role === 'judge') {
      return res.status(400).json({ message: 'You are already a judge' });
    }

    // Check if user was recently rejected
    if (user.judgeRequestStatus === 'rejected') {
      // Check if 30 days have passed since rejection
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (user.judgeRequestDate && user.judgeRequestDate > thirtyDaysAgo) {
        return res.status(400).json({ message: 'You can submit a new request after 30 days from rejection' });
      }
    }

    // Update user with judge request
    user.judgeRequestStatus = 'pending';
    user.judgeRequestReason = reason;
    user.judgeRequestDate = new Date();
    
    await user.save();

    res.status(200).json({ 
      message: 'Judge request submitted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        judgeRequestStatus: user.judgeRequestStatus
      }
    });
  } catch (error) {
    console.error('Judge request error:', error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 10. GET PENDING JUDGE REQUESTS (Admin Only)
// =======================
const getPendingJudgeRequests = async (req, res) => {
  try {
    const requests = await User.find({ 
      judgeRequestStatus: 'pending' 
    }).select('name email judgeRequestReason judgeRequestedAt');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 11. REVIEW JUDGE REQUEST (Admin Only)
// =======================
const reviewJudgeRequest = async (req, res) => {
  try {
    const { userId, action, reason } = req.body; // action: 'approve' or 'reject'

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.judgeRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending request found' });
    }

    if (action === 'approve') {
      user.role = 'judge';
      user.judgeRequestStatus = 'approved';
      user.judgeRequestReviewedAt = new Date();
      user.judgeRequestReviewReason = reason;
    } else if (action === 'reject') {
      user.judgeRequestStatus = 'rejected';
      user.judgeRequestRejectedAt = new Date();
      user.judgeRequestReviewReason = reason;
    }

    await user.save();

    res.status(200).json({ 
      message: `Judge request ${action}d successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        judgeRequestStatus: user.judgeRequestStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getUserProfile,
  getCurrentUserProfile,
  updateUserRole,
  updateUserProfile,
  changePassword,
  getUserDashboard,
  forgotPassword,
  resetPassword,
  contactUs,
  requestJudgeRole,
  reviewJudgeRequest,
  getPendingJudgeRequests
}

