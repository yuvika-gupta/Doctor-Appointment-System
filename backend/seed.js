require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Timeslot = require('./models/Timeslot');
const Appointment = require('./models/Appointment');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    // Clean database
    await User.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Timeslot.deleteMany();
    await Appointment.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('123456', salt); // Consistent password for all

    // 1 Admin
    const adminUser = new User({ name: 'Admin One', email: 'admin@test.com', passwordHash: passHash, role: 'admin' });
    await adminUser.save();

    console.log('Admin created.');

    // 6 Doctors with diverse specializations
    const doctorSpecs = [
      { name: 'Dr. John Smith', email: 'smith@test.com', spec: 'Cardiology', exp: 12, phone: '9998887771' },
      { name: 'Dr. Jane Doe', email: 'jane@test.com', spec: 'Neurology', exp: 8, phone: '9998887772' },
      { name: 'Dr. Robert Brown', email: 'brown@test.com', spec: 'Dermatology', exp: 15, phone: '9998887773' },
      { name: 'Dr. Emily White', email: 'emily@test.com', spec: 'Pediatrics', exp: 6, phone: '9998887774' },
      { name: 'Dr. Michael Green', email: 'michael@test.com', spec: 'Orthopedics', exp: 20, phone: '9998887775' },
      { name: 'Dr. Sarah Wilson', email: 'sarah@test.com', spec: 'Gynecology', exp: 11, phone: '9998887776' },
    ];

    const doctors = [];
    for (const d of doctorSpecs) {
      const u = new User({ name: d.name, email: d.email, passwordHash: passHash, role: 'doctor', phone: d.phone });
      await u.save();
      const doc = new Doctor({ userId: u._id, specialization: d.spec, experience: d.exp, bio: `Expert in ${d.spec} with ${d.exp} years of experience.` });
      await doc.save();
      doctors.push(doc);
    }
    console.log(`${doctors.length} Doctors created.`);

    // 15 Patients (mix of genders)
    const patientData = [
      { name: 'Rahul Sharma', age: 34, gender: 'Male', phone: '9876543210' },
      { name: 'Priya Patel', age: 28, gender: 'Female', phone: '9876543211' },
      { name: 'Amit Singh', age: 45, gender: 'Male', phone: '9876543212' },
      { name: 'Sonia Gupta', age: 31, gender: 'Female', phone: '9876543213' },
      { name: 'Vikram Malhotra', age: 52, gender: 'Male', phone: '9876543214' },
      { name: 'Anjali Desai', age: 24, gender: 'Female', phone: '9876543215' },
      { name: 'Rajesh Kumar', age: 60, gender: 'Male', phone: '9876543216' },
      { name: 'Meera Reddy', age: 37, gender: 'Female', phone: '9876543217' },
      { name: 'Arjun Verma', age: 29, gender: 'Male', phone: '9876543218' },
      { name: 'Tanvi Shah', age: 42, gender: 'Female', phone: '9876543219' },
      { name: 'Karan Mehra', age: 33, gender: 'Male', phone: '9876543220' },
      { name: 'Nisha Chopra', age: 27, gender: 'Female', phone: '9876543221' },
      { name: 'Sunil Gavaskar', age: 72, gender: 'Male', phone: '9876543222' },
      { name: 'Indira Nair', age: 55, gender: 'Female', phone: '9876543223' },
      { name: 'Manish Pandey', age: 30, gender: 'Male', phone: '9876543224' },
    ];

    const patients = [];
    for (const p of patientData) {
      const patient = new Patient({ 
        name: p.name, 
        age: p.age, 
        gender: p.gender, 
        phone: p.phone, 
        medicalHistory: 'None reported.', 
        createdBy: adminUser._id 
      });
      await patient.save();
      patients.push(patient);
    }
    console.log(`${patients.length} Patients created.`);

    // 12 Timeslots (2 per doctor)
    const timeslots = [];
    const times = [
      { start: '09:00', end: '09:30' },
      { start: '10:00', end: '10:30' },
      { start: '11:00', end: '11:30' },
      { start: '14:00', end: '14:30' },
      { start: '15:00', end: '15:30' },
      { start: '16:00', end: '16:30' },
    ];

    for (let i = 0; i < doctors.length; i++) {
      const t1 = new Timeslot({ 
        doctorId: doctors[i]._id, 
        startTime: times[i % times.length].start, 
        endTime: times[i % times.length].end, 
        daysOfWeek: [1, 2, 3, 4, 5] 
      });
      await t1.save();
      timeslots.push(t1);

      const t2 = new Timeslot({ 
        doctorId: doctors[i]._id, 
        startTime: times[(i + 1) % times.length].start, 
        endTime: times[(i + 1) % times.length].end, 
        daysOfWeek: [1, 2, 3, 4, 5] 
      });
      await t2.save();
      timeslots.push(t2);
    }
    console.log(`${timeslots.length} Timeslots created.`);

    // 20 Appointments (various statuses and dates)
    const statuses = ['pending', 'approved', 'rejected'];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(today.getDate() + (i % 7)); // Spread over next 7 days
      
      const appt = new Appointment({
        patientId: patients[i % patients.length]._id,
        doctorId: doctors[i % doctors.length]._id,
        timeslotId: timeslots[i % timeslots.length]._id,
        date: date,
        status: i < 5 ? 'pending' : (i < 15 ? 'approved' : 'rejected'),
        notes: `Sample appointment ${i + 1} for ${patients[i % patients.length].name}`
      });
      await appt.save();
    }
    console.log('20 Appointments created.');

    console.log('\nDatabase seeded with rich sample data successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
