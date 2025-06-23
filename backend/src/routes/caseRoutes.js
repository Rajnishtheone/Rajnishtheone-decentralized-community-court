import express from 'express';
import { 
    createCase, 
    getAllCases, 
    getCaseById, 
    updateCaseVerdict, 
    updateCaseStatus 
} from '../controllers/caseController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ✅ Any authenticated user can create cases
router.post('/', protect, createCase);

// ✅ Anyone can view approved cases
router.get('/', getAllCases);
router.get('/:id', getCaseById);

// ✅ Only 'judge' and 'admin' can update verdict
router.put('/:id/verdict', protect, authorizeRoles('judge', 'admin'), updateCaseVerdict);

// ✅ Only 'judge' and 'admin' can update case status
router.put('/:id/status', protect, authorizeRoles('judge', 'admin'), updateCaseStatus);

export default router;
