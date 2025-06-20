// backend/src/routes/commentRoutes.js

import express from 'express';
import { addComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Any logged-in user can add comments
router.post('/:caseId', protect, addComment);

// ✅ Anyone can view comments
router.get('/:caseId', getComments);

export default router;
