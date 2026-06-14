import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Divider, TextField, Button, Alert,
  Avatar, Chip, Grid, Tab, Tabs, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

const dialogSx = {
  '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)', fontWeight: 500 },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
  '& .MuiOutlinedInput-input': { color: '#111' },
};

const Profile = () => {
  useTitle('My Profile | Doctor App');
  const { user: authUser } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfileData(res.data);
        const u = res.data.user;
        const d = res.data.doctorProfile;
        setFormData({
          name: u.name || '',
          phone: u.phone || '',
          specialization: d?.specialization || '',
          bio: d?.bio || '',
          experience: d?.experience || '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      // Refresh profile
      const res = await api.get('/auth/profile');
      setProfileData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('New passwords do not match');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('Password must be at least 6 characters');
    }
    try {
      await api.post('/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      });
      setPwSuccess('Password changed successfully!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  const u = profileData?.user;
  const d = profileData?.doctorProfile;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      {/* Profile Header Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
          {u?.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} color="#111">{u?.name}</Typography>
          <Typography variant="body1" color="text.secondary">{u?.email}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip
              label={u?.role === 'admin' ? 'Administrator' : 'Doctor'}
              color={u?.role === 'admin' ? 'error' : 'primary'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {d?.specialization && (
              <Chip label={d.specialization} variant="outlined" size="small" />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile Info" />
          <Tab icon={<LockIcon />} iconPosition="start" label="Change Password" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 1: Profile Info */}
          {tab === 0 && (
            <Box sx={dialogSx}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#111">Personal Information</Typography>
                {!editing ? (
                  <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="inherit" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editing} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" value={u?.email} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Role" value={u?.role} disabled />
                </Grid>

                {/* Doctor-only fields */}
                {u?.role === 'doctor' && (
                  <>
                    <Grid item xs={12}><Divider><Typography variant="caption" color="text.secondary">Doctor Details</Typography></Divider></Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Specialization" value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        disabled={!editing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Experience (Years)" type="number" value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        disabled={!editing} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Bio / About" multiline rows={3} value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!editing} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}

          {/* Tab 2: Change Password */}
          {tab === 1 && (
            <Box component="form" onSubmit={handleChangePassword} sx={{ maxWidth: 440, ...dialogSx }}>
              <Typography variant="h6" fontWeight={600} color="#111" sx={{ mb: 2 }}>Change Password</Typography>
              {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
              {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
              <TextField fullWidth label="Current Password" type={showOldPass ? 'text' : 'password'} value={pwForm.oldPassword}
                onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                required sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowOldPass(!showOldPass)} edge="end">
                          {showOldPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }} />
              <TextField fullWidth label="New Password" type={showNewPass ? 'text' : 'password'} value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                          {showNewPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }} />
              <TextField fullWidth label="Confirm New Password" type={showConfPass ? 'text' : 'password'} value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required sx={{ mb: 3 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfPass(!showConfPass)} edge="end">
                          {showConfPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }} />
              <Button fullWidth variant="contained" size="large" type="submit"
                sx={{ py: 1.4, fontWeight: 700, borderRadius: 2 }}>
                Update Password
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
