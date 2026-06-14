import React, { useContext, useEffect, useState } from 'react';
import { Typography, Grid, Paper, Box, CircularProgress, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import useTitle from '../hooks/useTitle';

const StatCard = ({ label, value, icon, color, loading, small, path }) => {
  const navigate = useNavigate();
  
  return (
    <Paper
      elevation={3}
      onClick={() => path && navigate(path)}
      sx={{
        p: small ? 2 : 3,
        textAlign: 'center',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        height: '100%',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        cursor: path ? 'pointer' : 'default',
        '&:hover': path ? { 
          transform: 'translateY(-6px)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        } : {}
      }}
    >
      <Box sx={{ color: color, mb: small ? 0.5 : 1 }}>
        {React.cloneElement(icon, { sx: { fontSize: small ? 30 : 40 } })}
      </Box>
      <Typography variant={small ? 'body2' : 'h6'} color="textSecondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      {loading ? (
        <CircularProgress size={small ? 18 : 24} />
      ) : (
        <Typography variant={small ? 'h5' : 'h3'} sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      )}
    </Paper>
  );
};

const DashboardHome = () => {
  useTitle('Dashboard | Doctor App');
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [stats, setStats] = useState({ 
    appointments: 0, 
    patients: 0, 
    doctors: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [apptRes, patRes, docRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/patients'),
          api.get('/doctors'),
        ]);
        const appts = apptRes.data;
        setStats({
          appointments: appts.length,
          patients: patRes.data.length,
          doctors: docRes.data.length,
          approved: appts.filter(a => a.status === 'approved').length,
          pending: appts.filter(a => a.status === 'pending').length,
          rejected: appts.filter(a => a.status === 'rejected').length,
        });
      } catch (err) {
        console.error('Stats fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          Your healthcare dashboard is ready. Manage your schedule and patients with ease.
        </Typography>
        <Box sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto', mt: 3, borderRadius: 2 }} />
      </Box>

      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, opacity: 0.9, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.5 }}>
        Core Metrics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            label="Total Appointments" 
            value={stats.appointments} 
            icon={<EventIcon />} 
            color={theme.palette.primary.main} 
            loading={loading} 
            path="/appointments"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            label="Total Patients" 
            value={stats.patients} 
            icon={<PeopleIcon />} 
            color={theme.palette.secondary.main} 
            loading={loading} 
            path="/patients"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            label="Total Doctors" 
            value={stats.doctors} 
            icon={<LocalHospitalIcon />} 
            color={theme.palette.success.main} 
            loading={loading} 
            path="/doctors"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, opacity: 0.9, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.5 }}>
        Appointment Status
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            small 
            label="Approved" 
            value={stats.approved} 
            icon={<CheckCircleIcon />} 
            color="#2e7d32" 
            loading={loading} 
            path="/appointments?status=approved"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            small 
            label="Pending" 
            value={stats.pending} 
            icon={<PendingIcon />} 
            color="#ed6c02" 
            loading={loading} 
            path="/appointments?status=pending"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            small 
            label="Rejected" 
            value={stats.rejected} 
            icon={<CancelIcon />} 
            color="#d32f2f" 
            loading={loading} 
            path="/appointments?status=rejected"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
