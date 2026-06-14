import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Chip, IconButton, InputAdornment, Tooltip,
  Select, FormControl, InputLabel, Divider, Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { withUndo } from '../utils/undoToast';
import useTitle from '../hooks/useTitle';

const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

const dialogPaperProps = {
  sx: {
    '& .MuiDialogTitle-root': { color: '#1976d2', fontWeight: 800, fontSize: '1.4rem' },
    '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.75)', fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
    '& .MuiOutlinedInput-input': { color: '#111' },
    '& .MuiSelect-icon': { color: '#333' },
  }
};

const emptyForm = { doctorId: '', patientId: '', timeslotId: '', date: '', notes: '' };

const DateField = ({ value, onChange, name }) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextField
      fullWidth margin="dense" label="Appointment Date" name={name}
      type={focused || value ? 'date' : 'text'}
      value={value} onChange={onChange} required
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      InputLabelProps={{ shrink: focused || !!value }}
      sx={{
        '& input[type="date"]::-webkit-calendar-picker-indicator': {
          opacity: 1, cursor: 'pointer', width: '18px', height: '18px',
        },
      }}
    />
  );
};

// Shared select fields (moved outside to prevent focus loss)
const SelectFields = ({ form, setForm, doctors, patients, timeslots }) => (
  <>
    <TextField select fullWidth margin="dense" label="Doctor *" value={form.doctorId}
      onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required>
      {doctors.map((d) => (
        <MenuItem key={d._id} value={d._id} sx={{ color: '#111' }}>
          {d.userId?.name} ({d.specialization})
        </MenuItem>
      ))}
    </TextField>
    <TextField select fullWidth margin="dense" label="Patient *" value={form.patientId}
      onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
      {patients.map((p) => (
        <MenuItem key={p._id} value={p._id} sx={{ color: '#111' }}>{p.name}</MenuItem>
      ))}
    </TextField>
    <TextField select fullWidth margin="dense" label="Timeslot *" value={form.timeslotId}
      onChange={(e) => setForm({ ...form, timeslotId: e.target.value })} required>
      {timeslots.map((t) => (
        <MenuItem key={t._id} value={t._id} sx={{ color: '#111' }}>{t.startTime} – {t.endTime}</MenuItem>
      ))}
    </TextField>
    <DateField name="date" value={form.date}
      onChange={(e) => setForm({ ...form, date: e.target.value })} />
    <TextField fullWidth margin="dense" label="Notes" multiline rows={2} value={form.notes}
      onChange={(e) => setForm({ ...form, notes: e.target.value })}
      InputProps={{ sx: { color: '#111' } }} />
  </>
);

const Appointments = () => {
  useTitle('Manage Appointments | Doctor App');
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const highlightRef = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [timeslots, setTimeslots] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Sync status filter with URL params
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  // View details dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [viewAppt, setViewAppt] = useState(null);

  const fetchAll = async () => {
    try {
      const [apptRes, docRes, patRes, slotRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/doctors'),
        api.get('/patients'),
        api.get('/timeslots'),
      ]);
      setAppointments(apptRes.data);
      setDoctors(docRes.data);
      setPatients(patRes.data);
      setTimeslots(slotRes.data);
    } catch {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, appointments]);

  // Filtered list
  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.patientId?.name?.toLowerCase().includes(q) ||
      a.doctorId?.userId?.name?.toLowerCase().includes(q) ||
      a.notes?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Add
  const handleAddSubmit = async () => {
    try {
      await api.post('/appointments', addForm);
      toast.success('Appointment created');
      setAddOpen(false);
      setAddForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating appointment');
    }
  };

  // Edit open
  const openEdit = (appt) => {
    setEditAppt(appt);
    setEditForm({
      doctorId: appt.doctorId?._id || '',
      patientId: appt.patientId?._id || '',
      timeslotId: appt.timeslotId?._id || '',
      date: appt.date ? appt.date.substring(0, 10) : '',
      notes: appt.notes || '',
    });
    setEditOpen(true);
  };

  // Edit submit
  const handleEditSubmit = async () => {
    try {
      await api.put(`/appointments/${editAppt._id}`, editForm);
      toast.success('Appointment updated');
      setEditOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating appointment');
    }
  };

  // View
  const openView = (appt) => { setViewAppt(appt); setViewOpen(true); };

  // Status change
  const handleStatus = (id, status) => {
    withUndo(`Appointment will be marked "${status}" in 5 seconds...`, async () => {
      try {
        await api.put(`/appointments/${id}/status`, { status });
        toast.success(`Appointment ${status}`, { autoClose: 2000 });
        fetchAll();
      } catch {
        toast.error('Failed to update status');
      }
    });
  };

  // Delete
  const handleDelete = (id) => {
    withUndo('Appointment will be permanently deleted in 5 seconds...', async () => {
      try {
        await api.delete(`/appointments/${id}`);
        toast.success('Appointment deleted', { autoClose: 2000 });
        fetchAll();
      } catch {
        toast.error('Failed to delete appointment');
      }
    });
  };


  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Appointments</Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" startIcon={<EventIcon />} onClick={() => setAddOpen(true)} sx={{ fontWeight: 700 }}>
            ADD APPOINTMENT
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Search by patient, doctor, or notes..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        {(search || statusFilter !== 'all') && (
          <Button size="small" onClick={() => { setSearch(''); setStatusFilter('all'); }} sx={{ color: '#888' }}>
            Clear
          </Button>
        )}
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((appt) => {
              const isHighlighted = appt._id === highlightId;
              return (
                <TableRow
                  key={appt._id} hover
                  ref={isHighlighted ? highlightRef : null}
                  sx={{
                    transition: 'background-color 0.5s ease',
                    backgroundColor: isHighlighted ? 'rgba(25,118,210,0.12)' : 'inherit',
                    outline: isHighlighted ? '2px solid #1976d2' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  <TableCell>{appt.patientId?.name || 'N/A'}</TableCell>
                  <TableCell>{appt.doctorId?.userId?.name || 'N/A'}</TableCell>
                  <TableCell>{appt.date ? new Date(appt.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    {appt.timeslotId ? `${appt.timeslotId.startTime} - ${appt.timeslotId.endTime}` : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appt.notes || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip label={appt.status} color={statusColor[appt.status]} size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="center">
                    {/* View Details */}
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info" onClick={() => openView(appt)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Approve/Reject for pending */}
                    {(user?.role === 'doctor' || user?.role === 'admin') && appt.status === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton size="small" color="success" onClick={() => handleStatus(appt._id, 'approved')}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => handleStatus(appt._id, 'rejected')}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEdit(appt)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(appt._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {search || statusFilter !== 'all' ? 'No appointments match your filters.' : 'No appointments found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── ADD APPOINTMENT DIALOG ─── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Add New Appointment</DialogTitle>
        <DialogContent dividers>
          <SelectFields form={addForm} setForm={setAddForm} doctors={doctors} patients={patients} timeslots={timeslots} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit} sx={{ fontWeight: 700 }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ─── EDIT APPOINTMENT DIALOG ─── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Edit Appointment</DialogTitle>
        <DialogContent dividers>
          <SelectFields form={editForm} setForm={setEditForm} doctors={doctors} patients={patients} timeslots={timeslots} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit} sx={{ fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ─── VIEW APPOINTMENT DETAILS DIALOG ─── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={dialogPaperProps}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.4rem' }}>Appointment Details</DialogTitle>
        <DialogContent dividers>
          {viewAppt && (
            <Box>
              <Chip
                label={viewAppt.status}
                color={statusColor[viewAppt.status]}
                sx={{ mb: 2, fontWeight: 700, textTransform: 'capitalize', fontSize: '0.85rem' }}
              />
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1.5}>
                {[
                  { label: 'Patient', value: viewAppt.patientId?.name || 'N/A' },
                  { label: 'Doctor', value: viewAppt.doctorId?.userId?.name || 'N/A' },
                  { label: 'Specialization', value: viewAppt.doctorId?.specialization || '—' },
                  { label: 'Date', value: viewAppt.date ? new Date(viewAppt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
                  { label: 'Time', value: viewAppt.timeslotId ? `${viewAppt.timeslotId.startTime} – ${viewAppt.timeslotId.endTime}` : 'N/A' },
                  { label: 'Notes', value: viewAppt.notes || '—' },
                  { label: 'Created', value: viewAppt.createdAt ? new Date(viewAppt.createdAt).toLocaleString() : '—' },
                ].map(({ label, value }) => (
                  <Grid item xs={12} key={label}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography sx={{ width: 130, fontWeight: 600, color: '#555', flexShrink: 0 }}>{label}:</Typography>
                      <Typography color="#111">{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {user?.role === 'admin' && viewAppt && (
            <Button
              variant="outlined" startIcon={<EditIcon />}
              onClick={() => { setViewOpen(false); openEdit(viewAppt); }}
            >
              Edit
            </Button>
          )}
          <Button variant="contained" onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
