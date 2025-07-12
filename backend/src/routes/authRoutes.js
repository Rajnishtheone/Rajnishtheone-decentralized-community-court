// backend/src/routes/authRoutes.js

import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  completeGoogleProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// ✅ Register (with profile picture)
router.post('/register', upload.single('profilePic'), registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/google/complete-profile', completeGoogleProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
