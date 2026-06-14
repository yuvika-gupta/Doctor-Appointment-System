import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, InputAdornment, Tooltip, Avatar, Chip, Divider, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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
    '& .MuiMenuItem-root': { color: '#111', fontWeight: 500 },
  }
};

const emptyForm = { name: '', age: '', gender: 'Male', email: '', phone: '', medicalHistory: '' };

// Reusable Form Fields component (moved outside to prevent focus loss)
const FormFields = ({ form, setForm }) => (
  <>
    <TextField fullWidth margin="dense" label="Full Name *" name="name" value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })} required />
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, my: 1 }}>
      <TextField fullWidth label="Age" name="age" type="number" value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })} />
      <TextField select fullWidth label="Gender" name="gender" value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}>
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1 }}>
      <TextField fullWidth label="Email" name="email" type="email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <TextField fullWidth label="Phone *" name="phone" value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
    </Box>
    <TextField fullWidth margin="dense" label="Medical History" name="medicalHistory" multiline rows={3}
      value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
  </>
);

const Patients = () => {
  useTitle('Manage Patients | Doctor App');
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  // Add Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  // Edit Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  // View Details Dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch {
      toast.error('Failed to fetch patients');
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  // Filtered List
  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  // Action Handlers
  const handleAddSubmit = async () => {
    try {
      await api.post('/patients', addForm);
      toast.success('Patient added successfully');
      setAddOpen(false);
      setAddForm(emptyForm);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding patient');
    }
  };

  const openEdit = (pat) => {
    setEditPatient(pat);
    setEditForm({
      name: pat.name || '',
      age: pat.age || '',
      gender: pat.gender || 'Male',
      email: pat.email || '',
      phone: pat.phone || '',
      medicalHistory: pat.medicalHistory || ''
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/patients/${editPatient._id}`, editForm);
      toast.success('Patient updated successfully');
      setEditOpen(false);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating patient');
    }
  };

  const openView = (pat) => { setViewPatient(pat); setViewOpen(true); };

  const handleDelete = (id, name) => {
    withUndo(`Patient "${name}" will be permanently deleted in 5 seconds...`, async () => {
      try {
        await api.delete(`/patients/${id}`);
        toast.success('Patient deleted', { autoClose: 2000 });
        fetchPatients();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete patient');
      }
    });
  };


  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Patients Management</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setAddOpen(true)} sx={{ fontWeight: 700 }}>
          ADD PATIENT
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth size="small" placeholder="Search by name, email, or phone..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age/Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((pat) => (
              <TableRow key={pat._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34, fontSize: 14 }}>
                      {pat.name?.[0]?.toUpperCase() || 'P'}
                    </Avatar>
                    <Typography fontWeight={500}>{pat.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {pat.age ? `${pat.age} yrs` : 'N/A'}{' '}
                  <Typography component="span" color="text.secondary" fontSize="0.85em">
                    • {pat.gender || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>{pat.phone}</TableCell>
                <TableCell>{pat.email || '—'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View Profile">
                    <IconButton color="info" size="small" onClick={() => openView(pat)}><VisibilityIcon /></IconButton>
                  </Tooltip>
                  {user?.role === 'admin' && (
                    <>
                      <Tooltip title="Edit Patient">
                        <IconButton color="primary" size="small" onClick={() => openEdit(pat)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Patient">
                        <IconButton color="error" size="small" onClick={() => handleDelete(pat._id, pat.name)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {search ? 'No patients match your search.' : 'No patients found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── ADD PATIENT DIALOG ─── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Add New Patient</DialogTitle>
        <DialogContent dividers>
          <FormFields form={addForm} setForm={setAddForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit} sx={{ fontWeight: 700 }}>Add Patient</Button>
        </DialogActions>
      </Dialog>

      {/* ─── EDIT PATIENT DIALOG ─── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Edit Patient</DialogTitle>
        <DialogContent dividers>
          <FormFields form={editForm} setForm={setEditForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit} sx={{ fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ─── VIEW PATIENT DIALOG ─── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Patient Profile</DialogTitle>
        <DialogContent dividers>
          {viewPatient && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', fontSize: 26 }}>
                  {viewPatient.name?.[0]?.toUpperCase() || 'P'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#111">{viewPatient.name}</Typography>
                  <Chip label={viewPatient.gender || 'Unknown'} size="small" variant="outlined" />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1.5}>
                {[
                  { label: 'Age', value: viewPatient.age ? `${viewPatient.age} years` : '—' },
                  { label: 'Phone', value: viewPatient.phone || '—' },
                  { label: 'Email', value: viewPatient.email || '—' },
                  { label: 'Registered', value: viewPatient.createdAt ? new Date(viewPatient.createdAt).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      {label}
                    </Typography>
                    <Typography color="#111" fontWeight={500}>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                  Medical History
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', minHeight: 80 }}>
                  <Typography variant="body2" color="#333" sx={{ whiteSpace: 'pre-wrap' }}>
                    {viewPatient.medicalHistory || 'No medical history provided.'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {user?.role === 'admin' && viewPatient && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setViewOpen(false); openEdit(viewPatient); }}>
              Edit
            </Button>
          )}
          <Button variant="contained" onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Patients;
