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

// ✅ Community statistics (public - accessible without auth for first user check)
router.get('/community-stats', getCommunityStats);

// ✅ All other analytics routes require authentication
router.use(protect);

// ✅ User activity analytics (admin/judge only)
router.get('/user-activity', authorizeRoles('admin', 'judge'), getUserActivity);

// ✅ Top performers (public)
router.get('/top-performers', getTopPerformers);

// ✅ Case success rates (admin/judge only)
router.get('/case-success-rates', authorizeRoles('admin', 'judge'), getCaseSuccessRates);

export default router; 