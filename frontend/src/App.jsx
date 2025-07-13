import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Layout Components
import Layout from './components/Layout.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CompleteProfile from './pages/CompleteProfile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import Cases from './pages/Cases.jsx';
import CreateCase from './pages/CreateCase.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
import Analytics from './pages/Analytics.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Verifications from './pages/Verifications.jsx';
import AboutUs from './pages/AboutUs.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import Support from './pages/Support.jsx';

// Styles
import './index.css';

// Create a client
const queryClient = new QueryClient();

// Conditional Dashboard Component
const ConditionalDashboard = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
};

// Update document title and metadata
const updateMetadata = () => {
  document.title = "DCC Court - Decentralized Community Court";
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Community-driven dispute resolution platform for fair and transparent justice');
  }
};

function App() {
  // Update metadata on component mount
  React.useEffect(() => {
    updateMetadata();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground font-inter theme-transition">
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <ConditionalDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/admin" element={
                    <PrivateRoute requiredRole="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/cases" element={<Cases />} />
                  <Route path="/cases/:id" element={<CaseDetail />} />
                  <Route path="/create-case" element={
                    <PrivateRoute>
                      <CreateCase />
                    </PrivateRoute>
                  } />
                  <Route path="/analytics" element={
                    <PrivateRoute requiredRole="admin">
                      <Analytics />
                    </PrivateRoute>
                  } />
                  <Route path="/verifications" element={
                    <PrivateRoute requiredRole="judge">
                      <Verifications />
                    </PrivateRoute>
                  } />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/support" element={<Support />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
