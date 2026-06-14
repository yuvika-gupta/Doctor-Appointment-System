import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

const Topbar = ({ open, onToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        color: '#111',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onToggle}
          edge="start"
          sx={{ mr: 2, color: 'primary.main' }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 800, 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}
        >
          Doctor Appointment System
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" fontWeight={700} color="#333" sx={{ lineHeight: 1 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role} Account
            </Typography>
          </Box>

          <Tooltip title="My Profile">
            <IconButton
              size="small"
              onClick={() => navigate('/profile')}
              sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.15)' } 
              }}
            >
              <AccountCircleIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <Button
              size="small"
              onClick={handleLogout}
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              sx={{ 
                borderRadius: '8px',
                px: 2,
                fontWeight: 600,
                textTransform: 'none',
                ml: 1
              }}
            >
              Logout
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
