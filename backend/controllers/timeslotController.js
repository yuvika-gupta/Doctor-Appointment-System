const Timeslot = require('../models/Timeslot');

const getTimeslots = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query.doctorId = req.user.doctorId || req.query.doctorId;
    } else {
      if (req.query.doctorId) query.doctorId = req.query.doctorId;
    }

    const timeslots = await Timeslot.find(query).populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });
    res.json(timeslots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTimeslot = async (req, res) => {
  try {
    const { doctorId, startTime, endTime, daysOfWeek } = req.body;
    let docId = req.user.role === 'doctor' ? req.user.doctorId : doctorId;

    if (!docId) return res.status(400).json({ message: 'Doctor ID is required' });

    const timeslot = new Timeslot({
      doctorId: docId,
      startTime,
      endTime,
      daysOfWeek
    });
    await timeslot.save();
    res.status(201).json(timeslot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTimeslot = async (req, res) => {
  try {
    const timeslot = await Timeslot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!timeslot) return res.status(404).json({ message: 'Timeslot not found' });
    res.json(timeslot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTimeslot = async (req, res) => {
  try {
    const timeslot = await Timeslot.findByIdAndDelete(req.params.id);
    if (!timeslot) return res.status(404).json({ message: 'Timeslot not found' });
    res.json({ message: 'Timeslot deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTimeslots, createTimeslot, updateTimeslot, deleteTimeslot };
