const Doctor = require('../models/Doctor');
const User = require('../models/User');

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email phone profilePhoto role');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone profilePhoto role');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { specialization, bio, experience, status, name, phone } = req.body;
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.specialization = specialization || doctor.specialization;
    doctor.bio = bio || doctor.bio;
    doctor.experience = experience || doctor.experience;
    doctor.status = status || doctor.status;
    await doctor.save();

    if (name || phone) {
      await User.findByIdAndUpdate(doctor.userId, { name, phone });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDoctors, getDoctorById, updateDoctor, deleteDoctor };
