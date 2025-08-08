// backend/src/routes/voteRoutes.js

import express from 'express';
import { castVote, getVotes } from '../controllers/voteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Allow all authenticated users to vote (members, judges, admins)
router.post('/:caseId', protect, castVote);

// ✅ Anyone can view votes
router.get('/:caseId', getVotes);

export default router;
