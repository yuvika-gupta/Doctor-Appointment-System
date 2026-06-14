import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, InputAdornment, Chip, Avatar, Tooltip,
  Divider
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { withUndo } from '../utils/undoToast';
import useTitle from '../hooks/useTitle';

const dialogPaperProps = {
  sx: {
    '& .MuiDialogTitle-root': { color: '#1976d2', fontWeight: 800, fontSize: '1.4rem' },
    '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.75)', fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
    '& .MuiOutlinedInput-input': { color: '#111' },
  }
};

const emptyAdd = { name: '', email: '', password: '', phone: '', specialization: '', experience: '' };

const Doctors = () => {
  useTitle('Manage Doctors | Doctor App');
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [showPass, setShowPass] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', specialization: '', experience: '', bio: '' });

  // View dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch {
      toast.error('Failed to fetch doctors');
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  // Filtered list
  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.userId?.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.userId?.email?.toLowerCase().includes(q)
    );
  });

  // Add
  const handleAddSubmit = async () => {
    try {
      await api.post('/auth/register', addForm);
      toast.success('Doctor added successfully');
      setAddOpen(false);
      setAddForm(emptyAdd);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding doctor');
    }
  };

  // Edit open
  const openEdit = (doc) => {
    setEditDoc(doc);
    setEditForm({
      name: doc.userId?.name || '',
      phone: doc.userId?.phone || '',
      specialization: doc.specialization || '',
      experience: doc.experience || '',
      bio: doc.bio || '',
    });
    setEditOpen(true);
  };

  // Edit submit
  const handleEditSubmit = async () => {
    try {
      await api.put(`/doctors/${editDoc._id}`, editForm);
      toast.success('Doctor updated successfully');
      setEditOpen(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating doctor');
    }
  };

  // View profile
  const openView = (doc) => { setViewDoc(doc); setViewOpen(true); };

  // Delete
  const handleDelete = (id, name) => {
    withUndo(`Doctor "${name}" will be permanently deleted in 5 seconds...`, async () => {
      try {
        await api.delete(`/doctors/${id}`);
        toast.success('Doctor deleted', { autoClose: 2000 });
        fetchDoctors();
      } catch {
        toast.error('Failed to delete doctor');
      }
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Doctors Management</Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" color="primary" startIcon={<LocalHospitalIcon />}
            onClick={() => setAddOpen(true)} sx={{ fontWeight: 700 }}>
            ADD DOCTOR
          </Button>
        )}
      </Box>

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth size="small"
          placeholder="Search by name, email, or specialization..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
          }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Specialization</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Experience</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((doc) => (
              <TableRow key={doc._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: 14 }}>
                      {doc.userId?.name?.[0]?.toUpperCase() || 'D'}
                    </Avatar>
                    <Typography fontWeight={500}>{doc.userId?.name || 'N/A'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{doc.userId?.email || 'N/A'}</TableCell>
                <TableCell>
                  {doc.specialization && <Chip label={doc.specialization} size="small" color="primary" variant="outlined" />}
                </TableCell>
                <TableCell>{doc.experience ? `${doc.experience} yrs` : '—'}</TableCell>
                <TableCell>{doc.userId?.phone || '—'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View Profile"><IconButton color="info" size="small" onClick={() => openView(doc)}><VisibilityIcon /></IconButton></Tooltip>
                  {user?.role === 'admin' && (
                    <>
                      <Tooltip title="Edit Doctor"><IconButton color="primary" size="small" onClick={() => openEdit(doc)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete Doctor"><IconButton color="error" size="small" onClick={() => handleDelete(doc._id, doc.userId?.name)}><DeleteIcon /></IconButton></Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                {search ? 'No doctors match your search.' : 'No doctors found.'}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── ADD DOCTOR DIALOG ─── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Add New Doctor</DialogTitle>
        <DialogContent dividers>
          {[
            { label: 'Full Name *', name: 'name', type: 'text' },
            { label: 'Email *', name: 'email', type: 'email' },
            { label: 'Password *', name: 'password', type: showPass ? 'text' : 'password' },
            { label: 'Phone', name: 'phone', type: 'text' },
            { label: 'Specialization *', name: 'specialization', type: 'text' },
            { label: 'Experience (Years)', name: 'experience', type: 'number' },
          ].map((f) => (
            <TextField key={f.name} fullWidth margin="dense" label={f.label} name={f.name}
              type={f.type} value={addForm[f.name]}
              onChange={(e) => setAddForm({ ...addForm, [e.target.name]: e.target.value })}
              slotProps={f.name === 'password' ? {
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              } : undefined} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit} sx={{ fontWeight: 700 }}>Add Doctor</Button>
        </DialogActions>
      </Dialog>

      {/* ─── EDIT DOCTOR DIALOG ─── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Edit Doctor</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth margin="dense" label="Full Name" value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <TextField fullWidth margin="dense" label="Phone" value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <TextField fullWidth margin="dense" label="Specialization" value={editForm.specialization}
            onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} />
          <TextField fullWidth margin="dense" label="Experience (Years)" type="number" value={editForm.experience}
            onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} />
          <TextField fullWidth margin="dense" label="Bio / About" multiline rows={3} value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit} sx={{ fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ─── VIEW DOCTOR PROFILE DIALOG ─── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Doctor Profile</DialogTitle>
        <DialogContent dividers>
          {viewDoc && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 26 }}>
                  {viewDoc.userId?.name?.[0]?.toUpperCase() || 'D'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#111">{viewDoc.userId?.name}</Typography>
                  <Chip label={viewDoc.specialization || 'General'} color="primary" size="small" />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Email', value: viewDoc.userId?.email },
                { label: 'Phone', value: viewDoc.userId?.phone || '—' },
                { label: 'Specialization', value: viewDoc.specialization || '—' },
                { label: 'Experience', value: viewDoc.experience ? `${viewDoc.experience} years` : '—' },
                { label: 'Bio', value: viewDoc.bio || '—' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', mb: 1.5 }}>
                  <Typography sx={{ width: 130, fontWeight: 600, color: '#555', flexShrink: 0 }}>{label}:</Typography>
                  <Typography color="#111">{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;
