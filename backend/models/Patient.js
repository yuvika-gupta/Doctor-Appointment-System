const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  email: { type: String },
  phone: { type: String, required: true },
  medicalHistory: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin or Doctor who added the patient
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
