// backend/src/routes/userRoutes.js

import express from 'express';
import { getUserProfile, updateUserRole } from '../controllers/userController.js';

const router = express.Router();

router.get('/:id', getUserProfile);
router.put('/:id/role', updateUserRole);

export default router;
