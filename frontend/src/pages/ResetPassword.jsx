import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button, Alert,
  Paper, Link as MuiLink, InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../api/axios';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

import bgWallpaper from '../assets/wallpapers/Login.png';

const ResetPassword = () => {
  useTitle('Reset Password | Doctor App');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, password, token });
      toast.success('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">Invalid or expired reset link. Please request a new one.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      position: 'relative',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
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
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ width: 56, height: 56, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <LockResetIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#111" textAlign="center">Reset Password</Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
              Set a new password for <b>{email}</b>
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="New Password" type={showPass ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: 'rgba(0,0,0,0.7)', fontWeight: 500 } }}
              inputProps={{ style: { color: '#111' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <TextField
              fullWidth label="Confirm New Password" type={showConf ? 'text' : 'password'}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required sx={{ mb: 3 }}
              InputLabelProps={{ style: { color: 'rgba(0,0,0,0.7)', fontWeight: 500 } }}
              inputProps={{ style: { color: '#111' } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConf(!showConf)} edge="end">
                        {showConf ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}
              sx={{ py: 1.4, fontWeight: 700, borderRadius: 2 }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <MuiLink component={Link} to="/login" variant="body2" fontWeight={600}>
              ← Back to Login
            </MuiLink>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
