import express from 'express';
import { getUserProfile, updateUserRole, updateUserProfile, getUserDashboard } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { downloadCaseAsPDF } from '../controllers/caseController.js';
import { forgotPassword } from '../controllers/userController.js';


const router = express.Router();


// ✅ Download case as PDF
router.get('/:id/download', protect, downloadCaseAsPDF);

router.get('/:id', protect, getUserProfile);
router.put('/:id/role', protect, authorizeRoles('admin'), updateUserRole);

// ✅ Profile update (with picture)
router.put('/update/me', protect, upload.single('profilePicture'), updateUserProfile);

// ✅ Dashboard
router.get('/dashboard/me', protect, getUserDashboard);

// Forgot Password
router.post('/forgot-password', forgotPassword);

router.post('/contact', contactUs);


export default router;
