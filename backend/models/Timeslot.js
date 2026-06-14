const mongoose = require('mongoose');

const timeslotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  startTime: { type: String, required: true }, // Format HH:mm
  endTime: { type: String, required: true }, // Format HH:mm
  daysOfWeek: [{ type: Number }], // 0 (Sun) to 6 (Sat)
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Timeslot', timeslotSchema);
