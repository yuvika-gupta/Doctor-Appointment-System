const express = require('express');
const router = express.Router();
const { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAppointments);
router.post('/', authMiddleware, createAppointment);
router.get('/:id', authMiddleware, getAppointmentById);
router.put('/:id/status', authMiddleware, updateAppointmentStatus);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

module.exports = router;
