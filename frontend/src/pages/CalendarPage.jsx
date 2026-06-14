import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const statusColors = {
  pending: '#ff9800',
  approved: '#4caf50',
  rejected: '#f44336',
};

/* Inject global CSS for calendar cells and popup */
const calendarStyles = `
  /* Calendar fills its container without spilling */
  .rbc-calendar {
    overflow: hidden;
  }
  /* Constrain month grid rows */
  .rbc-month-view {
    overflow: hidden;
  }
  /* Event pills */
  .rbc-event {
    padding: 2px 5px !important;
    font-size: 11px !important;
    border-radius: 4px !important;
    border: none !important;
    font-weight: 500 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  /* "+N more" link — bold and blue */
  .rbc-show-more {
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #1976d2 !important;
    padding: 1px 4px !important;
    background: #e3f2fd !important;
    border-radius: 3px !important;
    cursor: pointer !important;
  }
  /* Popup overlay card — constrained width */
  .rbc-overlay {
    border-radius: 10px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
    border: 1px solid #e0e0e0 !important;
    width: 220px !important;
    max-width: 220px !important;
    padding: 8px 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    z-index: 9999 !important;
  }
  .rbc-overlay-header {
    font-weight: 700 !important;
    font-size: 13px !important;
    padding: 6px 12px 8px !important;
    border-bottom: 1px solid #eee !important;
    color: #333 !important;
  }
  /* Event pills inside popup — fit the popup width */
  .rbc-overlay .rbc-event {
    margin: 4px 8px !important;
    font-size: 12px !important;
    padding: 5px 8px !important;
    border-radius: 5px !important;
    width: calc(100% - 16px) !important;
    max-width: calc(100% - 16px) !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: block !important;
  }
  /* Today cell highlight */
  .rbc-today {
    background-color: #e8f4fd !important;
  }
  /* Toolbar buttons */
  .rbc-toolbar button {
    font-size: 13px !important;
    border-radius: 6px !important;
  }
  .rbc-toolbar button.rbc-active {
    background-color: #1976d2 !important;
    color: #fff !important;
    border-color: #1976d2 !important;
  }
`;

const CalendarPage = () => {
  useTitle('Calendar | Doctor App');
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/appointments');
        const formatted = res.data
          .filter(a => a.date && a.timeslotId)
          .map(a => {
            const d = new Date(a.date);
            const [startH, startM] = (a.timeslotId?.startTime || '09:00').split(':').map(Number);
            const [endH, endM] = (a.timeslotId?.endTime || '09:30').split(':').map(Number);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startH, startM);
            const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endH, endM);
            return {
              id: a._id,
              title: `${a.patientId?.name || 'Patient'} — ${a.doctorId?.userId?.name || 'Doctor'}`,
              start,
              end,
              status: a.status,
            };
          });
        setEvents(formatted);
      } catch (err) {
        toast.error('Failed to load calendar events');
      }
    };
    fetchEvents();
  }, [user]);

  const handleSelectEvent = (event) => {
    navigate(`/appointments?highlight=${event.id}`);
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: statusColors[event.status] || '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontSize: '11px',
      cursor: 'pointer',
      fontWeight: 500,
    },
  });

  return (
    <Box>
      {/* Inject calendar CSS overrides */}
      <style>{calendarStyles}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Calendar</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {['pending', 'approved', 'rejected'].map(s => (
            <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: statusColors[s] }} />
              <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{s}</Typography>
            </Box>
          ))}
          <Typography variant="caption" color="textSecondary" sx={{ ml: 1, fontStyle: 'italic' }}>
            Click an event to view · Click +more to see all
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 1.5, height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={(v) => setView(v)}
          onNavigate={(newDate) => setDate(newDate)}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          style={{ height: '100%' }}
          popup
          popupOffset={{ x: 0, y: 8 }}
          messages={{
            showMore: (count) => `+${count} more`,
            agenda: 'Agenda',
          }}
          tooltipAccessor={(e) => `${e.title} — Status: ${e.status}`}
        />
      </Paper>
    </Box>
  );
};

export default CalendarPage;
