const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Timeslot = require('../models/Timeslot');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:doctorId', authMiddleware, async (req, res) => {
  try {
    const { view, date } = req.query; // view = 'month', 'week', 'day'
    let doctorId = req.params.doctorId;
    
    // If no doctor ID is provided, but the logged-in user is a doctor
    if (!doctorId && req.user.role === 'doctor') {
      doctorId = req.user.doctorId; 
    }

    let query = {};
    if (doctorId) query.doctorId = doctorId;

    // Filter by date if view and date are provided
    if (view && date) {
      const targetDate = new Date(date);
      if (view === 'month') {
        const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        query.date = { $gte: start, $lte: end };
      } else if (view === 'day') {
        const start = new Date(targetDate.setHours(0,0,0,0));
        const end = new Date(targetDate.setHours(23,59,59,999));
        query.date = { $gte: start, $lte: end };
      }
      // Implementation for week can be added here
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name')
      .populate('timeslotId', 'startTime endTime');
      
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
