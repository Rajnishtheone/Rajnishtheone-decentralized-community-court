// backend/src/routes/userRoutes.js

import express from 'express';
import { getUserProfile, updateUserRole, updateUserProfile, getUserDashboard } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ✅ Any logged-in user can get profile
router.get('/:id', protect, getUserProfile);

// ✅ Any logged-in user can update their profile
router.put('/update/me', protect, updateUserProfile);

// ✅ Only admin can update user role
router.put('/:id/role', protect, authorizeRoles('admin'), updateUserRole);

// ✅ Dashboard (shows cases, remaining quota, etc.)
router.get('/dashboard/me', protect, getUserDashboard);

export default router;
