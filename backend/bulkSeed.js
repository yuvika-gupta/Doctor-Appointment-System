require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Timeslot = require('./models/Timeslot');
const Appointment = require('./models/Appointment');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Bulk Seeding'))
  .catch(err => console.error(err));

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'ENT', 'Gynecology', 'Oncology', 'Radiology'];
const genders = ['Male', 'Female', 'Other'];
const statuses = ['pending', 'approved', 'rejected'];
const daysOfWeek = [[1,2,3,4,5], [1,3,5], [2,4], [0,6], [1,2,3,4,5,6]];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const doctorNames = [
  'Dr. James Wilson', 'Dr. Lisa Park', 'Dr. Robert Chen', 'Dr. Maria Santos',
  'Dr. Ahmed Khan', 'Dr. Priya Sharma', 'Dr. David Miller', 'Dr. Sarah Johnson',
  'Dr. Carlos Rivera', 'Dr. Emily Wang'
];

const patientNames = [
  'Aarav Gupta', 'Priya Mehta', 'Rohan Verma', 'Sneha Joshi', 'Amit Patel',
  'Kavya Nair', 'Vikram Singh', 'Pooja Rao', 'Rahul Kumar', 'Ananya Devi',
  'Sanjay Reddy', 'Divya Pillai', 'Arjun Bose', 'Meera Iyer', 'Karan Malhotra',
  'Simran Kaur', 'Nikhil Desai', 'Tanvi Chavan', 'Harish Pande', 'Ritu Saxena',
  'Deepak Mishra', 'Swati Agarwal', 'Rohit Bansal', 'Lakshmi Narayanan', 'Mohan Das'
];

const bulkSeed = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('password123', salt);

    // Keep existing admin
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({ name: 'Admin One', email: 'admin@test.com', passwordHash: passHash, role: 'admin' });
      await adminUser.save();
      console.log('Admin created');
    }

    // Add 10 doctors
    const createdDoctors = [];
    for (let i = 0; i < 10; i++) {
      const spec = specializations[i];
      const nameStr = doctorNames[i];
      const email = `doctor${i + 1}@test.com`;
      let existing = await User.findOne({ email });
      if (!existing) {
        const docUser = new User({ name: nameStr, email, passwordHash: passHash, role: 'doctor', phone: `98765${i}${i}${i}${i}${i}` });
        await docUser.save();
        const doc = new Doctor({ userId: docUser._id, specialization: spec, bio: `Expert in ${spec} with ${5 + i} years of experience.`, experience: 5 + i, status: 'active' });
        await doc.save();
        // Add a timeslot for each doctor
        const slotHour = 9 + (i % 8);
        const slot = new Timeslot({ doctorId: doc._id, startTime: `${String(slotHour).padStart(2,'0')}:00`, endTime: `${String(slotHour).padStart(2,'0')}:30`, daysOfWeek: randomItem(daysOfWeek) });
        await slot.save();
        createdDoctors.push({ doc, slot });
        console.log(`Doctor ${i + 1} created: ${nameStr}`);
      } else {
        const doc = await Doctor.findOne({ userId: existing._id });
        const slot = await Timeslot.findOne({ doctorId: doc?._id });
        if (doc && slot) createdDoctors.push({ doc, slot });
        console.log(`Doctor ${i + 1} already exists: ${nameStr}`);
      }
    }

    // Add 25 patients
    const createdPatients = [];
    for (let i = 0; i < 25; i++) {
      const nameStr = patientNames[i];
      const phone = `77788${i}${i}${i}${i}${i}`;
      let existing = await Patient.findOne({ phone });
      if (!existing) {
        const pat = new Patient({
          name: nameStr,
          age: randomInt(18, 65),
          gender: randomItem(genders),
          email: `patient${i + 1}@test.com`,
          phone,
          medicalHistory: `Patient has history of regular checkups. Condition: ${randomItem(['Stable', 'Recovering', 'Under observation', 'Healthy'])}`,
          createdBy: adminUser._id
        });
        await pat.save();
        createdPatients.push(pat);
        console.log(`Patient ${i + 1} created: ${nameStr}`);
      } else {
        createdPatients.push(existing);
        console.log(`Patient ${i + 1} already exists: ${nameStr}`);
      }
    }

    // Create 20 appointments if we have enough doctors and patients
    if (createdDoctors.length > 0 && createdPatients.length > 0) {
      const existingCount = await Appointment.countDocuments();
      const needed = Math.max(0, 20 - existingCount);
      console.log(`Creating ${needed} new appointments (${existingCount} already exist)...`);

      for (let i = 0; i < needed; i++) {
        const { doc, slot } = randomItem(createdDoctors);
        const patient = randomItem(createdPatients);
        const daysAhead = randomInt(-10, 30);
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + daysAhead);

        const appt = new Appointment({
          doctorId: doc._id,
          patientId: patient._id,
          timeslotId: slot._id,
          date: apptDate,
          status: randomItem(statuses),
          notes: `Appointment #${existingCount + i + 1} - ${randomItem(['Follow up visit', 'Routine checkup', 'Consultation', 'Test results review', 'First visit'])}`,
          createdBy: adminUser._id
        });
        await appt.save();
        console.log(`Appointment ${existingCount + i + 1} created`);
      }
    }

    console.log('\n✅ Bulk seeding complete!');
    console.log(`  Doctors: ${createdDoctors.length}`);
    console.log(`  Patients: ${createdPatients.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

bulkSeed();
