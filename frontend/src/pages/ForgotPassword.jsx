import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button, Alert,
  Paper, Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import api from '../api/axios';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

import bgWallpaper from '../assets/wallpapers/Login.png';

const ForgotPassword = () => {
  useTitle('Forgot Password | Doctor App');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      setPreviewUrl(res.data.previewUrl || '');
      toast.success('Reset link sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

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
              <EmailIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#111" textAlign="center">Forgot Password</Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
              Enter your email address and we'll send you a reset link
            </Typography>
          </Box>

          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Reset link sent! Please check your email inbox and spam folder.
              </Typography>
              {previewUrl && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, border: '1px dashed' }}>
                  <Typography variant="caption" display="block" color="text.secondary" fontWeight={600} gutterBottom>
                    DEVELOPMENT MOCK EMAIL (ETHEREAL):
                  </Typography>
                  <MuiLink 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 700, fontSize: '0.9rem', wordBreak: 'break-all' }}
                  >
                    Open Mail Preview →
                  </MuiLink>
                </Box>
              )}
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField
                fullWidth label="Email Address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required sx={{ mb: 3 }}
                InputLabelProps={{ style: { color: 'rgba(0,0,0,0.7)', fontWeight: 500 } }}
                inputProps={{ style: { color: '#111' } }}
              />
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}
                sx={{ py: 1.4, fontWeight: 700, borderRadius: 2 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <MuiLink component={Link} to="/login" variant="body2" fontWeight={600}>
              Back to Login
            </MuiLink>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
