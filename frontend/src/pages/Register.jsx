import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button, Alert,
  Paper, Link as MuiLink
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import api from '../api/axios';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import bgWallpaper from '../assets/wallpapers/Login.png';

const Register = () => {
  useTitle('Register | Doctor App');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    bio: '',
    availability: 'Monday-Friday',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', { ...formData, role: 'doctor' });
      setSuccess('Registration successful! Please wait for admin approval.');
      toast.success('Registration successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const dialogSx = {
    '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)', fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
    '& .MuiOutlinedInput-input': { color: '#111' },
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      position: 'relative',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 4,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${bgWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.6,
        zIndex: 0,
      }
    }}>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ width: 56, height: 56, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <LocalHospitalIcon sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#111" textAlign="center">Doctor Registration</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">Register your doctor account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={dialogSx}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField fullWidth label="Full Name *" name="name" value={formData.name} onChange={handleChange} required />
              <TextField fullWidth label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </Box>

            <TextField
              fullWidth label="Password *" name="password" sx={{ mt: 2 }}
              type={showPass ? 'text' : 'password'}
              value={formData.password} onChange={handleChange} required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)}>
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <TextField fullWidth label="Specialization *" name="specialization" value={formData.specialization} onChange={handleChange} required />
              <TextField fullWidth label="Experience (Years) *" name="experience" type="number" value={formData.experience} onChange={handleChange} required />
            </Box>

            <TextField fullWidth label="Availability *" name="availability" sx={{ mt: 2 }} value={formData.availability} onChange={handleChange} required />
            <TextField fullWidth label="Bio" name="bio" multiline rows={3} sx={{ mt: 2 }} value={formData.bio} onChange={handleChange} />

            <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading}
              sx={{ mt: 3, py: 1.4, fontWeight: 700, borderRadius: 2 }}>
              {loading ? 'Registering...' : 'Register as Doctor'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" fontWeight={600} color="primary">
                Login here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
