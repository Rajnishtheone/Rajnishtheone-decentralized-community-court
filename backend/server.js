// ==============================
// DCC Backend Final Server Setup
// ==============================

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import caseRoutes from './src/routes/caseRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import voteRoutes from './src/routes/voteRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import { errorHandler } from './src/middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // ✅ change to frontend prod URL
    credentials: true,
  }
});

// Attach socket.io to app so controllers can access
app.set('io', io);

// ====================
// Security Middlewares 🔐
// ====================
app.disable('x-powered-by');
app.use(helmet());
// Temporarily disable mongoSanitize due to compatibility issue
// app.use(mongoSanitize());
// Temporarily disable xss-clean due to Express 5 compatibility issue
// app.use(xss());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());

// ====================
// Body Parser + Static Uploads
// ====================
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====================
// Rate Limiting for Auth APIs
// ====================
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: '⚠️ Too many requests from this IP, please try again later.'
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);

// ====================
// Routes
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/analytics', analyticsRoutes);

// ====================
// Root Route
// ====================
app.get('/', (req, res) => {
  res.send('✅ DCC Backend API is running...');
});

// ====================
// Global Error Handler
// ====================
app.use(errorHandler);

// ====================
// Socket.IO Events
// ====================
io.on('connection', (socket) => {
  console.log('📡 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ====================
// Connect to DB and Start Server
// ====================
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});
