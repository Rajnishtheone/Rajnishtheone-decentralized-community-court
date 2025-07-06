import express from 'express';
import {
  getUserProfile,
  getCurrentUserProfile,
  updateUserRole,
  updateUserProfile,
  getUserDashboard,
  forgotPassword,
  contactUs,
  requestJudgeRole,
  getPendingJudgeRequests,
  reviewJudgeRequest
} from '../controllers/userController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { downloadCaseAsPDF } from '../controllers/caseController.js';

const router = express.Router();

// ✅ Register - handled by auth routes

// ✅ Login - handled by auth routes

// ✅ Forgot Password
router.post('/forgot-password', forgotPassword);

// ✅ Contact Us
router.post('/contact', contactUs);

// ✅ Profile update (with picture)
router.put('/update/me', protect, upload.single('profilePicture'), updateUserProfile);

// ✅ Dashboard
router.get('/dashboard/me', protect, getUserDashboard);

// ✅ Download case as PDF
router.get('/:id/download', protect, downloadCaseAsPDF);

// ✅ Get current user profile
router.get('/profile/me', protect, getCurrentUserProfile);

// ✅ Get user profile by ID
router.get('/:id', protect, getUserProfile);

// ✅ Update role (admin only)
router.put('/:id/role', protect, authorizeRoles('admin'), updateUserRole);
import cloudinaryUpload from '../middlewares/cloudinaryUpload.js';

router.put('/update/me', protect, cloudinaryUpload.single('profilePicture'), updateUserProfile);

// Judge request routes
router.post('/request-judge', protect, requestJudgeRole);
router.get('/pending-judge-requests', protect, authorizeRoles('admin'), getPendingJudgeRequests);
router.post('/review-judge-request', protect, authorizeRoles('admin'), reviewJudgeRequest);

export default router;
