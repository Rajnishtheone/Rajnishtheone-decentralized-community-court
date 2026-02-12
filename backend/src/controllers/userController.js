// =======================
// IMPORTS
// =======================
import mongoose from 'mongoose';
import User from '../models/User.js';
import Case from '../models/Case.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/emailService.js';

// =======================
// 1. GET USER PROFILE BY ID (Protected)
// =======================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password blockedUsers');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const viewer = await User.findById(req.user.id).select('blockedUsers');
    const viewerBlocked = (viewer?.blockedUsers || []).some((id) => `${id}` === `${user._id}`);
    const userBlocked = (user?.blockedUsers || []).some((id) => `${id}` === `${viewer._id}`);
    if (viewerBlocked || userBlocked) {
      return res.status(403).json({ message: 'Profile not accessible' });
    }

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
      { $match: { 'votes.votedBy': new mongoose.Types.ObjectId(userId) } },
      { $count: 'totalVotes' }
    ]);
    const totalVotes = userVotes.length > 0 ? userVotes[0].totalVotes : 0;

    // Calculate win rate (cases where user's vote matched final verdict)
    const resolvedCases = userCases.filter(case_ => case_.status === 'Verdict Reached' || case_.status === 'Closed');
    const wins = resolvedCases.filter(case_ => {
      const userVote = case_.votes.find(vote => vote.votedBy.toString() === userId);
      if (!userVote || !case_.verdict) return false;
      if (!['yes', 'no'].includes(case_.verdict)) return false;
      return userVote.vote === case_.verdict;
    }).length;
    const winRate = resolvedCases.length > 0 ? Math.round((wins / resolvedCases.length) * 100) : 0;

    // Calculate reputation (based on activity and accuracy)
    const reputation = Math.round((totalVotes * 10) + (winRate * 2));

    // Comment activity count (for dashboard)
    const commentCountAgg = await Case.aggregate([
      { $unwind: '$comments' },
      { $match: { 'comments.commentedBy': new mongoose.Types.ObjectId(userId) } },
      { $count: 'totalComments' }
    ]);
    const commentCount = commentCountAgg.length > 0 ? commentCountAgg[0].totalComments : 0;

    // Get published cases for community voting (excluding user's own cases)
    const publishedCases = await Case.find({
      status: 'Published for Voting',
      filedBy: { $ne: userId } // Exclude user's own cases
    })
      .populate('filedBy', 'username')
      .populate('votes.votedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's filed cases for the dashboard
    const userFiledCases = await Case.find({ filedBy: userId })
      .populate('votes.votedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate vote statistics for each case
    const casesWithVoteStats = publishedCases.map(caseItem => {
      const yesVotes = caseItem.votes.filter(vote => vote.vote === 'yes').length;
      const noVotes = caseItem.votes.filter(vote => vote.vote === 'no').length;
      const totalVotes = yesVotes + noVotes;

      return {
        ...caseItem.toObject(),
        yesVotes,
        noVotes,
        totalVotes
      };
    });

    const userCasesWithVoteStats = userFiledCases.map(caseItem => {
      const yesVotes = caseItem.votes.filter(vote => vote.vote === 'yes').length;
      const noVotes = caseItem.votes.filter(vote => vote.vote === 'no').length;
      const totalVotes = yesVotes + noVotes;

      return {
        ...caseItem.toObject(),
        yesVotes,
        noVotes,
        totalVotes
      };
    });

    // Community stats for sidebar
    const [totalUsers, totalCases, approvedCases] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Case.countDocuments(),
      Case.countDocuments({ status: { $in: ['Verdict Reached', 'Closed'] } })
    ]);

    res.status(200).json({
      casesFiled,
      totalVotes,
      winRate,
      reputation,
      commentCount,
      community: {
        totalUsers,
        totalCases,
        approvedCases
      },
      publishedCases: casesWithVoteStats, // Cases available for voting
      filedCases: userCasesWithVoteStats // User's own cases
    });
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

    // Update user with judge request using findByIdAndUpdate to avoid validation issues
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        judgeRequestStatus: 'pending',
        judgeRequestReason: reason,
        judgeRequestDate: new Date()
      },
      { new: true, runValidators: false } // Don't run validators for partial updates
    );

    res.status(200).json({
      message: 'Judge request submitted successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        judgeRequestStatus: updatedUser.judgeRequestStatus
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
    }).select('_id name email judgeRequestReason judgeRequestDate profilePic');

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
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

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
    } else if (action === 'member') {
      user.role = 'member';
      user.judgeRequestStatus = 'none';
      user.judgeRequestReason = '';
      user.judgeRequestDate = null;
      user.judgeRequestReviewedAt = new Date();
      user.judgeRequestReviewReason = reason || 'Set to member by admin';
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

// =======================
// 12. GET ALL USERS (Admin Only)
// =======================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 11.1 CANCEL JUDGE REQUEST (Member)
// =======================
const cancelJudgeRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.judgeRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending judge request to cancel' });
    }

    user.judgeRequestStatus = 'none';
    user.judgeRequestReason = '';
    user.judgeRequestDate = null;
    await user.save();

    res.status(200).json({ message: 'Judge request cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 12.1 GET USERS FOR VERIFICATION (Judge/Admin)
// =======================
const getUsersForVerification = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('_id username email building flat profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users for verification:', error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 13. DELETE USER (Admin Only)
// =======================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
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
  contactUs,
  requestJudgeRole,
  reviewJudgeRequest,
  getPendingJudgeRequests,
  getAllUsers,
  getUsersForVerification,
  cancelJudgeRequest,
  deleteUser
}

