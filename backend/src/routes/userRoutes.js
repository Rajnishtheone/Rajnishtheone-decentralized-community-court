import express from 'express';
import {
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
  getPendingJudgeRequests,
  reviewJudgeRequest,
  getAllUsers,
  deleteUser
} from '../controllers/userController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { downloadCaseAsPDF } from '../controllers/caseController.js';

const router = express.Router();

// ✅ Forgot Password
router.post('/forgot-password', forgotPassword);

// ✅ Reset Password
router.post('/reset-password', resetPassword);

// ✅ Profile update (with picture)
router.put('/update/me', protect, upload.single('profilePic'), updateUserProfile);

// ✅ Change Password
router.put('/change-password', protect, changePassword);

// ✅ Get current user profile
router.get('/profile/me', protect, getCurrentUserProfile);

// ✅ Get user profile by ID
router.get('/profile/:id', protect, getUserProfile);

// ✅ Get user dashboard stats
router.get('/dashboard', protect, getUserDashboard);

// ✅ Get all users (admin only) - Must come before /:id routes
router.get('/all', protect, authorizeRoles('admin'), getAllUsers);

// ✅ Get pending judge requests (admin only)
router.get('/judge-requests/pending', protect, authorizeRoles('admin'), getPendingJudgeRequests);

// ✅ Update role (admin only)
router.put('/:id/role', protect, authorizeRoles('admin'), updateUserRole);

// ✅ Review judge request (admin only)
router.put('/judge-requests/:userId/review', protect, authorizeRoles('admin'), reviewJudgeRequest);

// ✅ Delete user (admin only)
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

// ✅ Request judge role
router.post('/request-judge', protect, requestJudgeRole);

// ✅ Contact us
router.post('/contact', contactUs);

// ✅ Download case as PDF
router.get('/cases/:id/pdf', protect, downloadCaseAsPDF);

export default router;
