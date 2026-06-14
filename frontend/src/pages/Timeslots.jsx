import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, IconButton, InputAdornment, Tooltip, Chip,
  FormGroup, FormControlLabel, Checkbox, Switch, Divider, Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';
import { withUndo } from '../utils/undoToast';

const dialogPaperProps = {
  sx: {
    '& .MuiDialogTitle-root': { color: '#1976d2', fontWeight: 800, fontSize: '1.4rem' },
    '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.75)', fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
    '& .MuiOutlinedInput-input': { color: '#111' },
    '& .MuiSelect-icon': { color: '#333' },
  }
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLORS = ['#e53935', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#e53935'];

const emptyForm = { doctorId: '', startTime: '', endTime: '', daysOfWeek: [], isAvailable: true };

// Day checkboxes component (moved outside to prevent focus loss)
const DayPicker = ({ form, setForm, toggleDay }) => (
  <Box sx={{ mt: 1 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      Available Days (leave empty = all days)
    </Typography>
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
      {DAY_LABELS.map((label, idx) => {
        const selected = form.daysOfWeek.includes(idx);
        return (
          <Chip
            key={idx}
            label={label}
            size="small"
            clickable
            onClick={() => toggleDay(form, setForm, idx)}
            sx={{
              fontWeight: 600,
              bgcolor: selected ? DAY_COLORS[idx] : '#f0f0f0',
              color: selected ? '#fff' : '#555',
              '&:hover': { opacity: 0.85 },
              transition: 'all 0.15s',
            }}
          />
        );
      })}
    </Box>
  </Box>
);

// Reusable Time Field (moved outside to prevent focus loss)
const TimeField = ({ label, value, onChange, name }) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextField
      fullWidth
      margin="dense"
      label={label}
      name={name}
      type={focused || value ? 'time' : 'text'}
      value={value}
      onChange={onChange}
      required
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      InputLabelProps={{ shrink: focused || !!value }}
      inputProps={{ step: 300 }}
      sx={{
        '& input[type="time"]::-webkit-calendar-picker-indicator': {
          opacity: 1,
          cursor: 'pointer',
          width: '18px',
          height: '18px',
        },
      }}
    />
  );
};

const Timeslots = () => {
  useTitle('Manage Timeslots | Doctor App');
  const { user } = useContext(AuthContext);
  const [timeslots, setTimeslots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('all');

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const fetchAll = async () => {
    try {
      const [slotRes, docRes] = await Promise.all([
        api.get('/timeslots'),
        api.get('/doctors'),
      ]);
      setTimeslots(slotRes.data);
      setDoctors(docRes.data);
    } catch {
      toast.error('Failed to load timeslots');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Filtered list
  const filtered = timeslots.filter((t) => {
    // Role based filtering: Doctors only see their own slots
    if (user?.role === 'doctor') {
      if (t.doctorId?._id !== user?.doctorId) return false;
    }

    const docName = t.doctorId?.userId?.name?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchSearch = docName.includes(q) || t.startTime?.includes(q) || t.endTime?.includes(q);
    const matchDoctor = filterDoctor === 'all' || t.doctorId?._id === filterDoctor;
    return matchSearch && matchDoctor;
  });

  // Toggle day in form
  const toggleDay = (form, setForm, day) => {
    const days = form.daysOfWeek.includes(day)
      ? form.daysOfWeek.filter((d) => d !== day)
      : [...form.daysOfWeek, day].sort((a, b) => a - b);
    setForm({ ...form, daysOfWeek: days });
  };

  // Add
  const handleAddSubmit = async () => {
    if (!addForm.doctorId) return toast.error('Please select a doctor');
    if (!addForm.startTime || !addForm.endTime) return toast.error('Please set start and end times');
    if (addForm.startTime >= addForm.endTime) return toast.error('End time must be after start time');
    try {
      await api.post('/timeslots', addForm);
      toast.success('Timeslot added successfully');
      setAddOpen(false);
      setAddForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding timeslot');
    }
  };

  // Edit open
  const openEdit = (slot) => {
    setEditSlot(slot);
    setEditForm({
      doctorId: slot.doctorId?._id || '',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      daysOfWeek: slot.daysOfWeek || [],
      isAvailable: slot.isAvailable ?? true,
    });
    setEditOpen(true);
  };

  // Edit submit
  const handleEditSubmit = async () => {
    if (editForm.startTime >= editForm.endTime) return toast.error('End time must be after start time');
    try {
      await api.put(`/timeslots/${editSlot._id}`, editForm);
      toast.success('Timeslot updated successfully');
      setEditOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating timeslot');
    }
  };

  // Toggle availability inline
  const handleToggleAvailability = async (slot) => {
    try {
      await api.put(`/timeslots/${slot._id}`, { ...slot, doctorId: slot.doctorId?._id, isAvailable: !slot.isAvailable });
      fetchAll();
    } catch {
      toast.error('Failed to update availability');
    }
  };

  // Delete
  const handleDelete = (id, doctorName, time) => {
    withUndo(
      `Timeslot "${time}" for Dr. ${doctorName} will be deleted in 5 seconds...`,
      async () => {
        try {
          await api.delete(`/timeslots/${id}`);
          toast.success('Timeslot deleted', { autoClose: 2000 });
          fetchAll();
        } catch {
          toast.error('Failed to delete timeslot');
        }
      }
    );
  };


  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Timeslot Management</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            ADD TIMESLOT
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Search by doctor name or time..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
        />
        {(user?.role === 'admin' || !user?.doctorId) && (
          <TextField
            select size="small" label="Filter by Doctor" value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Doctors</MenuItem>
            {doctors.map((d) => (
              <MenuItem key={d._id} value={d._id}>{d.userId?.name} ({d.specialization})</MenuItem>
            ))}
          </TextField>
        )}
        {(search || filterDoctor !== 'all') && (
          <Button size="small" onClick={() => { setSearch(''); setFilterDoctor('all'); }} sx={{ color: '#888' }}>
            Clear
          </Button>
        )}
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Available</TableCell>
              {user?.role === 'admin' && <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((slot) => {
              const docName = slot.doctorId?.userId?.name || 'N/A';
              const spec = slot.doctorId?.specialization || '';
              // Calculate duration in minutes
              const [sh, sm] = slot.startTime?.split(':').map(Number) || [0, 0];
              const [eh, em] = slot.endTime?.split(':').map(Number) || [0, 0];
              const durationMins = (eh * 60 + em) - (sh * 60 + sm);

              return (
                <TableRow key={slot._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: 14 }}>
                        {docName?.[0]?.toUpperCase() || 'D'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500} fontSize="0.9rem">{docName}</Typography>
                        {spec && <Typography variant="caption" color="text.secondary">{spec}</Typography>}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography fontWeight={500}>{slot.startTime}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography fontWeight={500}>{slot.endTime}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={durationMins > 0 ? `${durationMins} min` : '—'}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {slot.daysOfWeek && slot.daysOfWeek.length > 0
                        ? slot.daysOfWeek.map((d) => (
                          <Chip
                            key={d} label={DAY_LABELS[d]} size="small"
                            sx={{ bgcolor: DAY_COLORS[d], color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        ))
                        : <Typography variant="caption" color="text.secondary">All days</Typography>
                      }
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={slot.isAvailable}
                      onChange={() => handleToggleAvailability(slot)}
                      color="success"
                      size="small"
                      disabled={user?.role !== 'admin'}
                    />
                  </TableCell>
                  {user?.role === 'admin' && (
                    <TableCell align="center">
                      <Tooltip title="Edit Timeslot">
                        <IconButton color="primary" size="small" onClick={() => openEdit(slot)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Timeslot">
                        <IconButton color="error" size="small"
                          onClick={() => handleDelete(slot._id, docName, `${slot.startTime}–${slot.endTime}`)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {search || filterDoctor !== 'all'
                    ? 'No timeslots match your filters.'
                    : 'No timeslots found. Click "ADD TIMESLOT" to create one.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── ADD TIMESLOT DIALOG ─── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Add New Timeslot</DialogTitle>
        <DialogContent dividers>
          <TextField
            select fullWidth margin="dense" label="Doctor *"
            value={addForm.doctorId}
            onChange={(e) => setAddForm({ ...addForm, doctorId: e.target.value })}
          >
            {doctors.map((d) => (
              <MenuItem key={d._id} value={d._id} sx={{ color: '#111' }}>
                {d.userId?.name} — {d.specialization}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TimeField
              label="Start Time *"
              value={addForm.startTime}
              onChange={(e) => setAddForm({ ...addForm, startTime: e.target.value })}
            />
            <TimeField
              label="End Time *"
              value={addForm.endTime}
              onChange={(e) => setAddForm({ ...addForm, endTime: e.target.value })}
            />
          </Box>

          <DayPicker form={addForm} setForm={setAddForm} toggleDay={toggleDay} />

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={addForm.isAvailable}
              onChange={(e) => setAddForm({ ...addForm, isAvailable: e.target.checked })}
              color="success"
            />
            <Typography variant="body2" color="#111">Available for booking</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit} sx={{ fontWeight: 700 }}>Add Timeslot</Button>
        </DialogActions>
      </Dialog>

      {/* ─── EDIT TIMESLOT DIALOG ─── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Edit Timeslot</DialogTitle>
        <DialogContent dividers>
          <TextField
            select fullWidth margin="dense" label="Doctor *"
            value={editForm.doctorId}
            onChange={(e) => setEditForm({ ...editForm, doctorId: e.target.value })}
          >
            {doctors.map((d) => (
              <MenuItem key={d._id} value={d._id} sx={{ color: '#111' }}>
                {d.userId?.name} — {d.specialization}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TimeField
              label="Start Time *"
              value={editForm.startTime}
              onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
            />
            <TimeField
              label="End Time *"
              value={editForm.endTime}
              onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
            />
          </Box>

          <DayPicker form={editForm} setForm={setEditForm} toggleDay={toggleDay} />

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={editForm.isAvailable}
              onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
              color="success"
            />
            <Typography variant="body2" color="#111">Available for booking</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit} sx={{ fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timeslots;
