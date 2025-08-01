# ⚖️ Decentralized Community Court (DCC)

A modern, full-stack web application that enables communities to collaboratively vote, discuss, and receive AI-assisted verdicts on ethical or legal cases. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with real-time features and comprehensive user management.

## 🚀 Live Demo

[Coming Soon - Deploy in Progress] working on features...

## ✨ Key Features

### 🔐 Authentication & Authorization

- **Multi-role User System**: Admin, Judge, and Public user roles
- **JWT-based Authentication**: Secure login with access and refresh tokens
- **Role-based Access Control**: Different permissions for different user types
- **Password Recovery**: Email-based password reset functionality

### 📋 Case Management

- **Create & Manage Cases**: Full CRUD operations for legal/ethical cases
- **Evidence Upload**: Cloudinary integration for media file uploads
- **Case Categories**: Organized case classification system
- **Status Tracking**: Real-time case status updates

### 🗳️ Voting System

- **Real-time Voting**: Socket.IO powered live voting updates
- **Vote Analytics**: Comprehensive voting statistics and insights
- **Vote History**: Track voting patterns and user participation

### 💬 Community Features

- **Comment System**: Public and judge-only commenting
- **Discussion Threads**: Organized case discussions
- **User Profiles**: Detailed user information and activity tracking

### 🤖 AI Integration

- **AI Verdict Suggestions**: OpenAI-powered intelligent case analysis
- **Smart Recommendations**: AI-assisted decision making
- **Case Analysis**: Automated case evaluation and insights

### 📊 Analytics & Reporting

- **Dashboard Analytics**: Real-time statistics and metrics
- **User Activity Tracking**: Comprehensive user engagement analytics
- **Case Performance Metrics**: Detailed case analysis and reporting

## 🛠️ Tech Stack

### Frontend

- **React.js 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI (MUI)** - React component library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **Framer Motion** - Animation library
- **React Hot Toast** - Notification system

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time bidirectional communication
- **Multer** - File upload handling
- **Cloudinary** - Cloud media storage
- **Nodemailer** - Email functionality
- **OpenAI API** - AI integration
- **PDFKit** - PDF generation
- **Joi** - Data validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
📦 dcc-court
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Business logic for all modules
│   │   ├── 📁 middlewares/     # Authentication, validation, error handling
│   │   ├── 📁 models/          # MongoDB schemas and models
│   │   ├── 📁 routes/          # API route definitions
│   │   ├── 📁 validators/      # Input validation schemas
│   │   ├── 📁 utils/           # Helper functions and utilities
│   │   ├── 📁 config/          # Configuration files
│   │   └── index.js            # Main application entry point
│   ├── 📁 uploads/             # File upload directory
│   ├── server.js               # Server entry point
│   ├── package.json            # Backend dependencies
│   └── SETUP.md                # Backend setup instructions
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 features/        # Feature-based modules
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 lib/             # API and utility functions
│   │   ├── 📁 routes/          # Routing configuration
│   │   ├── 📁 styles/          # Additional styling
│   │   ├── 📁 utils/           # Helper functions
│   │   ├── 📁 assets/          # Static assets
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── postcss.config.js       # PostCSS configuration
│
├── 📄 README.md                # Project documentation
└── 📄 .gitignore               # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Rajnishtheone/dcc-court.git
   cd dcc-court
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the backend directory:

   ```env
   # Server Configuration

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the development servers**

   **Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   **Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Case Endpoints

- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Voting Endpoints

- `POST /api/votes` - Cast vote on case
- `GET /api/votes/case/:caseId` - Get votes for case

### Comment Endpoints

- `GET /api/comments/case/:caseId` - Get comments for case
- `POST /api/comments` - Add comment to case

### Analytics Endpoints

- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/cases` - Get case analytics

## 🔧 Configuration

### Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `dcc-court`
3. Update the `MONGODB_URI` in your `.env` file

### Email Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Update the email configuration in your `.env` file

### Cloudinary Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the Cloudinary configuration in your `.env` file

### OpenAI Setup

1. Get an API key from OpenAI
2. Update the `OPENAI_API_KEY` in your `.env` file

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set up a production MongoDB instance
2. Configure environment variables for production
3. Deploy to your preferred hosting platform (Heroku, Vercel, AWS, etc.)

### Frontend Deployment

1. Build the production version:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist` folder to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rajnish** - [GitHub](https://github.com/Rajnishtheone)

## 🙏 Acknowledgments

- OpenAI for AI integration capabilities
- MongoDB for the database solution
- The React and Node.js communities for excellent documentation
- All contributors and testers who helped improve this project

## 📞 Support

If you have any questions or need support, please:

- Open an issue on GitHub
- Contact the maintainer at [rajnishkk97@gmail.com]

---

**Made with ❤️ by Rajnish**
