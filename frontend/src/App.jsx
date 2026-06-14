import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout + protected pages
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import CalendarPage from './pages/CalendarPage';
import Profile from './pages/Profile';
import Timeslots from './pages/Timeslots';

// Simple 404 page
const NotFound = () => (
  <div style={{ textAlign: 'center', paddingTop: '80px' }}>
    <h1 style={{ fontSize: '6rem', color: '#1976d2', margin: 0 }}>404</h1>
    <h2 style={{ color: '#555' }}>Page Not Found</h2>
    <p style={{ color: '#888' }}>The page you are looking for does not exist.</p>
    <a href="/" style={{ color: '#1976d2', fontWeight: 600 }}>← Back to Dashboard</a>
  </div>
);

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f4f6f8' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" newestOnTop draggable={false} />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected dashboard routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="patients" element={<Patients />} />
              <Route path="profile" element={<Profile />} />
              <Route path="timeslots" element={<Timeslots />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
