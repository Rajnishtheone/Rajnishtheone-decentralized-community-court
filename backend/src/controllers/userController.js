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

    user.phone = req.body.phone || user.phone;
    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;

    await user.save();
    res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 4. GET USER DASHBOARD (Protected)
// =======================
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Filed cases
    const filedCases = await Case.find({ createdBy: userId }).sort({ createdAt: -1 });

    // Case quota (4 per month)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyCount = await Case.countDocuments({
      createdBy: userId,
      createdAt: { $gte: monthStart }
    });

    // Activity: votes by user
    const votedCases = await Case.find({ 'votes.votedBy': userId })
      .select('title _id votes')
      .lean();

    const voteActivity = votedCases.map((c) => {
      const voteObj = c.votes.find((v) => v.votedBy.toString() === userId);
      return {
        caseId: c._id,
        title: c.title,
        vote: voteObj?.vote,
      };
    });

    // Activity: comments by user
    const commentedCases = await Case.find({ 'comments.commentedBy': userId })
      .select('title _id comments')
      .lean();

    const commentActivity = [];

    commentedCases.forEach((c) => {
      c.comments.forEach((comment) => {
        if (comment.commentedBy.toString() === userId) {
          commentActivity.push({
            caseId: c._id,
            title: c.title,
            comment: comment.text,
            commentedAt: comment.createdAt,
          });
        }
      });
    });

    res.status(200).json({
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone,
      profilePic: req.user.profilePic,
      caseQuotaRemaining: Math.max(0, 4 - monthlyCount),
      filedCases,
      voteActivity,
      commentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// =======================
// 5. FORGOT PASSWORD - Send Reset Email
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
      html: forgotPasswordTemplate(user.username, resetLink)
    });

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 6. RESET PASSWORD - Accept Token
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
// 7. CONTACT US / FEEDBACK EMAIL
// =======================
const contactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const html = `
      <h3>📨 New Contact / Feedback Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    await sendEmail({
      to: 'xavierone0@gmail.com', // ✅  admin email
      subject: '📝 New Contact/Feedback from DCC',
      html,
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Contact Email Error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


// Request Judge Role
const requestJudgeRole = async (req, res) => {
  try {
    const { reason } = req.body
    const userId = req.user.id

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required for judge request' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user already has a pending request
    if (user.judgeRequestStatus === 'pending') {
      return res.status(400).json({ message: 'You already have a pending judge request' })
    }

    // Check if user is already a judge
    if (user.role === 'judge') {
      return res.status(400).json({ message: 'You are already a judge' })
    }

    user.judgeRequestStatus = 'pending'
    user.judgeRequestReason = reason
    user.judgeRequestDate = new Date()
    await user.save()

    // Notify admins about the request
    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: 'New Judge Role Request',
        template: 'judgeRequest',
        context: {
          adminName: admin.name,
          requesterName: user.name,
          requesterEmail: user.email,
          reason
        }
      })
    }

    res.json({ 
      message: 'Judge request submitted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        judgeRequestStatus: user.judgeRequestStatus,
        judgeRequestReason: user.judgeRequestReason,
        judgeRequestDate: user.judgeRequestDate
      }
    })
  } catch (error) {
    console.error('Judge request error:', error)
    res.status(500).json({ message: 'Error submitting judge request' })
  }
}

// Review Judge Request (Admin only)
const reviewJudgeRequest = async (req, res) => {
  try {
    const { userId, status, adminComment } = req.body
    const adminId = req.user.id

    if (!userId || !status) {
      return res.status(400).json({ message: 'User ID and status are required' })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either approved or rejected' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.judgeRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'User does not have a pending judge request' })
    }

    user.judgeRequestStatus = status
    if (status === 'approved') {
      user.role = 'judge'
    }
    user.judgeRequestDate = new Date()
    await user.save()

    // Send email notification to user
    await sendEmail({
      to: user.email,
      subject: `Judge Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      template: 'judgeRequestResponse',
      context: {
        name: user.name,
        status,
        adminComment: adminComment || 'No comment provided'
      }
    })

    res.json({ 
      message: `Judge request ${status} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        judgeRequestStatus: user.judgeRequestStatus
      }
    })
  } catch (error) {
    console.error('Review judge request error:', error)
    res.status(500).json({ message: 'Error reviewing judge request' })
  }
}

// Get Pending Judge Requests (Admin only)
const getPendingJudgeRequests = async (req, res) => {
  try {
    const requests = await User.find({ 
      judgeRequestStatus: 'pending' 
    }).select('name email judgeRequestReason judgeRequestDate')

    res.json({ requests })
  } catch (error) {
    console.error('Get pending judge requests error:', error)
    res.status(500).json({ message: 'Error fetching pending judge requests' })
  }
}

export {
  getUserProfile,
  getCurrentUserProfile,
  updateUserRole,
  updateUserProfile,
  getUserDashboard,
  forgotPassword,
  resetPassword,
  contactUs,
  requestJudgeRole,
  reviewJudgeRequest,
  getPendingJudgeRequests
}

