// backend/src/routes/authRoutes.js

import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profilePic'), registerUser);
router.post('/login', loginUser);

// Forgot Password
router.post('/forgot-password', forgotPassword)

// Reset Password
router.post('/reset-password', resetPassword)

export default router;
