import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './routes/PrivateRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import CreateCase from './pages/CreateCase'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Verifications from './pages/Verifications'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="cases" element={
            <PrivateRoute>
              <Cases />
            </PrivateRoute>
          } />
          <Route path="cases/:id" element={
            <PrivateRoute>
              <CaseDetail />
            </PrivateRoute>
          } />
          <Route path="create-case" element={
            <PrivateRoute>
              <CreateCase />
            </PrivateRoute>
          } />
          <Route path="analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Judge/Admin Routes */}
          <Route path="verifications" element={
            <PrivateRoute requiredRole={['judge', 'admin']}>
              <Verifications />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
