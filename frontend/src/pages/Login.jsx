import React, { useState, useContext, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, Divider, Link as MuiLink, Paper, InputAdornment, IconButton } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import useTitle from '../hooks/useTitle';

import bgWallpaper from '../assets/wallpapers/Login.png';

const Login = () => {
  useTitle('Login | Doctor App');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

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
        opacity: 0.6, // Higher visibility confirmed
        zIndex: 0,
      }
    }}>
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ width: 60, height: 60, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <MedicalServicesIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#111" textAlign="center">Doctor Appointment System</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}
            sx={{
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)', fontWeight: 500 },
              '& .MuiOutlinedInput-input': { color: '#111' },
            }}
          >
            <TextField
              fullWidth label="Email Address" variant="outlined" margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            />
            <TextField
              fullWidth label="Password" variant="outlined" margin="normal"
              type={showPass ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)} required
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

            <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
              <MuiLink component={Link} to="/forgot-password" variant="body2" color="primary" fontWeight={600}>
                Forgot Password?
              </MuiLink>
            </Box>

            <Button fullWidth variant="contained" color="primary" type="submit"
              disabled={loading}
              sx={{ py: 1.4, mt: 1, fontWeight: 700, fontSize: '1rem', borderRadius: 2 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary">or</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Are you a doctor?{' '}
              <MuiLink component={Link} to="/register" fontWeight={600} color="primary">
                Register here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
