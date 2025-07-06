# 🚀 DCC Backend Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/dcc-court

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h

# Email Configuration (Choose one: Gmail or Resend)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OR for Resend
RESEND_API_KEY=your-resend-api-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:5173
```

3. **Start Development Server**
```bash
npm run dev
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/forgot-password` - Forgot password
- `POST /api/users/reset-password` - Reset password

### Cases
- `POST /api/cases` - Create new case
- `GET /api/cases` - Get all approved cases
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id/verdict` - Update verdict (judge/admin)
- `PUT /api/cases/:id/status` - Update status (judge/admin)

### Voting
- `POST /api/votes/:caseId` - Cast vote
- `GET /api/votes/:caseId` - Get votes for case

### Comments
- `POST /api/comments/:caseId` - Add comment
- `GET /api/comments/:caseId` - Get comments

### Analytics
- `GET /api/analytics/community-stats` - Community statistics
- `GET /api/analytics/user-activity` - User activity (admin/judge)
- `GET /api/analytics/top-performers` - Top performers
- `GET /api/analytics/case-success-rates` - Success rates (admin/judge)

## 🔒 Security Features
- JWT authentication
- Role-based access control
- Rate limiting
- Input sanitization
- XSS protection
- MongoDB injection protection

## 🤖 AI Features
- Verdict suggestions
- Case summaries
- Complexity analysis
- Bias detection

## 📧 Email Features
- Welcome emails
- Case notifications
- Password reset
- Verdict delivery with PDF

## 📊 Analytics Features
- Community statistics
- User activity tracking
- Top performers
- Case success rates
- Category analysis 