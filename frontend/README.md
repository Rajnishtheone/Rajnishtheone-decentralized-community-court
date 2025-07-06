# 🎨 DCC Frontend Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

## 🔧 Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── Navbar.jsx      # Top navigation bar
│   └── Sidebar.jsx     # Side navigation for authenticated users
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication state management
├── lib/                # Utility libraries
│   └── api.js         # Axios configuration
├── pages/              # Page components
│   ├── Home.jsx       # Landing page
│   ├── Login.jsx      # Login form
│   ├── Register.jsx   # Registration form
│   ├── Dashboard.jsx  # User dashboard
│   ├── Cases.jsx      # Cases listing
│   ├── CaseDetail.jsx # Individual case view
│   ├── CreateCase.jsx # Case creation form
│   ├── Analytics.jsx  # Analytics dashboard
│   └── Profile.jsx    # User profile
├── routes/             # Routing components
│   └── PrivateRoute.jsx # Protected route wrapper
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## 🎯 Features Implemented

### ✅ Authentication
- User registration and login
- JWT token management
- Protected routes
- Role-based access control

### ✅ User Interface
- Responsive design with Tailwind CSS
- Modern UI components
- Loading states and error handling
- Toast notifications

### ✅ Case Management
- View all cases
- Create new cases
- Case details with voting
- File upload support

### ✅ Dashboard
- User statistics
- Recent activity
- Quick actions
- Role-based navigation

### ✅ Analytics
- Community statistics
- Voting distribution
- Category analysis
- User activity tracking

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=DCC
```

### API Configuration
The frontend is configured to proxy API requests to the backend at `http://localhost:5000`. This is set up in `vite.config.js`.

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- **Custom CSS** for component styles
- **Responsive design** for mobile and desktop

## 🔌 State Management

- **React Query** for server state management
- **React Context** for authentication state
- **React Hook Form** for form handling

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- JWT token authentication
- Protected routes
- Role-based access control
- Input validation
- XSS protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

## 🔧 Development Tips

1. **Hot Reload**: The development server supports hot reload for instant updates
2. **API Proxy**: API requests are automatically proxied to the backend
3. **Error Handling**: All API errors are handled with toast notifications
4. **Loading States**: All async operations show loading indicators
5. **Form Validation**: All forms use React Hook Form with validation

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend is running on port 5000
   - Check CORS configuration in backend

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for missing dependencies

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check if PostCSS is working correctly

## 📚 Next Steps

1. **Add Real-time Features**: Implement Socket.IO for live updates
2. **Enhanced Analytics**: Add charts and graphs
3. **Mobile App**: Create React Native version
4. **Testing**: Add unit and integration tests
5. **Performance**: Implement code splitting and lazy loading 