// backend/src/routes/caseRoutes.js

import express from 'express';
import { createCase, getAllCases, getSingleCase } from '../controllers/caseController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// ✅ Only 'judge' and 'admin' can create cases
router.post('/', protect, authorizeRoles('judge', 'admin'), createCase);

// ✅ Anyone can view cases
router.get('/', getAllCases);
router.get('/:id', getSingleCase);

export default router;
