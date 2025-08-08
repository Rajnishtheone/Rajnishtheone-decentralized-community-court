// ==============================
// DCC Backend Final Server Setup
// ==============================

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
// import mongoSanitize from 'express-mongo-sanitize'; // temporarily disabled
// import xss from 'xss-clean'; // temporarily disabled
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
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'https://rajnishtheone-decentralized-communi.vercel.app', // Vercel frontend domain
      'https://rajnishtheone-decentralized-community-court.vercel.app', // add if needed
    ],
    credentials: true,
  }
});

// Attach socket.io instance to app (for controllers)
app.set('io', io);

// ====================
// Security Middlewares 🔐
// ====================
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Temporarily disabled for compatibility issues:
// app.use(mongoSanitize());
// app.use(xss());

// ====================
// Enhanced CORS configuration
// ====================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://rajnishtheone-decentralized-communi.vercel.app', // Vercel frontend domain
    'https://rajnishtheone-decentralized-community-court.vercel.app', // optional additional domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(cookieParser());

// ====================
// Body Parser + Static Uploads
// ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ====================
// Rate Limiting for Auth APIs
// ====================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: '⚠️ Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
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
  res.json({
    message: '✅ DCC Backend API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ====================
// Health Check Route
// ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'uploads')}`);
    console.log(`🌐 CORS enabled for specified domains`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
