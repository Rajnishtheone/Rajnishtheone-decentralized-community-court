import express from 'express';
import {
  getCommunityStats,
  getUserActivity,
  getTopPerformers,
  getCaseSuccessRates
} from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ✅ All analytics routes require authentication
router.use(protect);

// ✅ Community statistics (public)
router.get('/community-stats', getCommunityStats);

// ✅ User activity analytics (admin/judge only)
router.get('/user-activity', authorizeRoles('admin', 'judge'), getUserActivity);

// ✅ Top performers (public)
router.get('/top-performers', getTopPerformers);

// ✅ Case success rates (admin/judge only)
router.get('/case-success-rates', authorizeRoles('admin', 'judge'), getCaseSuccessRates);

export default router; 