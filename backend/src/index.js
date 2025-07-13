import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';


dotenv.config();

const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // For profile & pdf access
app.use('/api/auth', authRoutes); // ✅ Mount auth routes

// =====================
// ROUTES
// =====================
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/analytics', analyticsRoutes);

// =====================
// ROOT ROUTE
// =====================
app.get('/', (req, res) => {
  res.send('📡 DCC Backend API is running...');
});

// =====================
// DB + SERVER START
// =====================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully'); // ✅ Add this log
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err.message);
  });
