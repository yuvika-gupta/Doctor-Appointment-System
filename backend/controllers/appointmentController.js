const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor) query.doctorId = doctor._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('timeslotId', 'startTime endTime')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('timeslotId');
      
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, timeslotId, date, notes } = req.body;
    const appointment = new Appointment({
      doctorId,
      patientId,
      timeslotId,
      date,
      notes,
      createdBy: req.user.id
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, timeslotId, date, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { doctorId, patientId, timeslotId, date, notes },
      { new: true }
    )
      .populate('patientId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('timeslotId', 'startTime endTime');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment };

