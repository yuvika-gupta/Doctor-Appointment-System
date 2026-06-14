import React, { useContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, ListItemButton, Divider, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 260;
const collapsedWidth = 72;

const Sidebar = ({ open }) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const navItemSx = {
    minHeight: 48,
    justifyContent: open ? 'initial' : 'center',
    px: 2.5,
    mx: 1,
    borderRadius: '12px',
    mb: 0.5,
    '&.active': {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
      color: 'primary.main',
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
      },
    },
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    }
  };

  const baseItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Appointments', icon: <EventIcon />, path: '/appointments' },
    { text: 'Timeslots', icon: <AccessTimeIcon />, path: '/timeslots' },
    { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  ];

  const adminItems = [
    { text: 'Doctors', icon: <LocalHospitalIcon />, path: '/doctors' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
  ];

  const profileItem = { text: 'My Profile', icon: <AccountCircleIcon />, path: '/profile' };

  const menuItems = [
    ...baseItems,
    ...(user?.role === 'admin' ? adminItems : []),
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          borderRight: 'none',
          boxShadow: 'none',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ 
        overflowY: 'auto', 
        overflowX: 'hidden',
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        py: 2,
        // Hide scrollbar but keep functionality
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <List sx={{ flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                end={item.path === '/'}
                sx={navItemSx}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.9rem' }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 1 }} />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={profileItem.path}
              sx={navItemSx}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {profileItem.icon}
              </ListItemIcon>
              <ListItemText 
                primary={profileItem.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.9rem' }
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
