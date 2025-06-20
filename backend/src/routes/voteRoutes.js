// backend/src/routes/voteRoutes.js

import express from 'express';
import { castVote, getVotes } from '../controllers/voteController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ✅ Only 'judge' can vote
router.post('/:caseId', protect, authorizeRoles('judge'), castVote);

// ✅ Anyone can view votes
router.get('/:caseId', getVotes);

export default router;
