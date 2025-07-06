import express from 'express';
import { castVote, getVotes } from '../controllers/voteController.js';
import {
    createCase,
    getAllCases,
    getCaseById,
    updateCaseVerdict,
    updateCaseStatus,
    commentOnCase,
    suggestVerdict,
    verifyCase,
    submitTargetResponse,
    getPendingVerifications
} from '../controllers/caseController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { caseCreationLimiter } from '../middlewares/rateLimitMiddleware.js';
import cloudinaryUpload from '../middlewares/cloudinaryUpload.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { createCaseSchema } from '../validators/caseValidators.js';

const router = express.Router();

// ✅ Create case with flexible filing and evidence upload
router.post('/', 
    protect, 
    caseCreationLimiter, 
    cloudinaryUpload.single('evidence'), 
    validateBody(createCaseSchema),
    createCase
);

// ✅ View cases (public)
router.get('/', getAllCases);
router.get('/:id', getCaseById);

// ✅ Verification routes (judge/admin only)
router.get('/verifications/pending', protect, authorizeRoles('judge', 'admin'), getPendingVerifications);
router.post('/:caseId/verify', protect, authorizeRoles('judge', 'admin'), verifyCase);

// ✅ Target response route
router.post('/:caseId/respond', protect, submitTargetResponse);

// ✅ Update verdict or status (judge/admin only)
router.put('/:id/verdict', protect, authorizeRoles('judge', 'admin'), updateCaseVerdict);
router.put('/:id/status', protect, authorizeRoles('judge', 'admin'), updateCaseStatus);

// ✅ Vote on a case
router.post('/:caseId/vote', protect, castVote);
router.get('/:caseId/votes', protect, getVotes);

// ✅ Comment on a case
router.post('/:caseId/comment', protect, commentOnCase);

// ✅ AI Verdict Suggestion
router.get('/:caseId/ai-verdict', protect, suggestVerdict);

export default router;
