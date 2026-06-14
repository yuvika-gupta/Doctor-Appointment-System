# Doctor Appointment System

A premium, state-of-the-art **MERN Stack** (MongoDB, Express, React, Node.js) application designed with a focus on modern aesthetics and high-density usability. This system provides a robust platform for **Admins** and **Doctors** to manage healthcare workflows with professional-grade visual feedback.

---

## ✨ Premium Features

- 🏗️ **Modern Centered Layout**: A balanced, centered UI designed for maximum readability and visual hierarchy.
- 🖼️ **Dynamic Route-Based Wallpapers**: High-quality vector backgrounds that automatically switch based on the current page (Patients, Profile, Dashboard, etc.).
- 🏢 **Glassmorphic Navigation**: A translucent Topbar with luxury backdrop blur effect for a professional feel.
- 🔍 **Password Visibility**: Integrated "Eye" icon toggle for all secure fields across the application.
- 📧 **Automated Password Reset**: Fully functional "Forgot Password" flow with mock email integration for secure account recovery.
- ✅ **Optimistic Undo System**: Smart "Recall" window for critical actions like deletions and status changes.

---

## 💻 Setup Instructions

### 1. Database & Environment

Ensure you have MongoDB running locally at `mongodb://127.0.0.1:27017` or update the `.env` appropriately. 

Backend Environment (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/doctor_appointment
JWT_SECRET=your_jwt_secret_key
```

### 2. Backend Setup

```bash
cd backend
npm install
node seed.js    # Seed database with sample Admins, Doctors, and Patients
node server.js  # Start the API server
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`. 

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new doctor
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send Mock Ethereal email for reset

### Doctors
- `GET /api/doctors` - List all doctors
- `PUT /api/doctors/:id` - Edit doctor profile
- `DELETE /api/doctors/:id` - Delete doctor (Admin only)

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id/status` - Approve/Reject

### Timeslots
- `GET /api/timeslots` - List timeslots
- `POST /api/timeslots` - Create new timeslot

---

## Documentation Artifacts (SRS)

All generated documentation for the SRS submission (JSON schema and diagram references) can be found in the `srs_documentation/` directory.

Models: User, Doctor, Patient, Timeslot, Appointment.
