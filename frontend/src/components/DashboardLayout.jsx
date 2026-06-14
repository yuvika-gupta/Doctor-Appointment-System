import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';

import dashBG from '../assets/wallpapers/Dashboard.png';
import patientBG from '../assets/wallpapers/Patient.png';
import appointmentBG from '../assets/wallpapers/Appointment.png';
import calendarBG from '../assets/wallpapers/Calender.png';
import profileBG from '../assets/wallpapers/Profile.png';
import timeslotBG from '../assets/wallpapers/Timeslot.png';

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const handleToggle = () => {
    setOpen(!open);
  };

  // Dynamic Wallpaper Logic
  const getWallpaper = () => {
    const path = location.pathname;
    if (path === '/') return dashBG;
    if (path.includes('/patients')) return patientBG;
    if (path.includes('/appointments')) return appointmentBG;
    if (path.includes('/calendar')) return calendarBG;
    if (path.includes('/profile')) return profileBG;
    if (path.includes('/timeslots')) return timeslotBG;
    return dashBG; // Fallback
  };

  const bgWallpaper = getWallpaper();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <CssBaseline />
      <Box sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${bgWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.6, // High visibility confirmed
        zIndex: 0, 
        pointerEvents: 'none',
        transition: 'background-image 0.5s ease-in-out' // Smooth transition between wallpapers
      }} />
      
      <Topbar open={open} onToggle={handleToggle} />
      <Sidebar open={open} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 4, 
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'transparent',
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> 
        <Box sx={{ maxWidth: '1400px', mx: 'auto', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
