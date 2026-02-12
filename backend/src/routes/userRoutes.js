import express from 'express';
import {
  getUserProfile,
  getCurrentUserProfile,
  updateUserRole,
  updateUserProfile,
  changePassword,
  getUserDashboard,
  contactUs,
  requestJudgeRole,
  getPendingJudgeRequests,
  reviewJudgeRequest,
  getAllUsers,
  getUsersForVerification,
  cancelJudgeRequest,
  deleteUser
} from '../controllers/userController.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { upload, handleUploadError } from '../middlewares/uploadMiddleware.js';
import { downloadCaseAsPDF } from '../controllers/caseController.js';

const router = express.Router();

// ✅ Forgot Password (delegated to auth controller)
router.post('/forgot-password', forgotPassword);

// ✅ Reset Password (delegated to auth controller)
router.post('/reset-password', resetPassword);

// ✅ Profile update (with picture)
router.put('/update/me', protect, upload.single('profilePic'), handleUploadError, updateUserProfile);

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

// ✅ Get users list for verification (judge/admin)
router.get('/', protect, authorizeRoles('judge', 'admin'), getUsersForVerification);

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

// ✅ Cancel judge request
router.post('/judge-requests/cancel', protect, cancelJudgeRequest);

// ✅ Contact us
router.post('/contact', contactUs);

// ✅ Download case as PDF
router.get('/cases/:id/pdf', protect, downloadCaseAsPDF);

export default router;
