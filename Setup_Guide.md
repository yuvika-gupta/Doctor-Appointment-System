# Project Setup Guide (Doctor Appointment System)

This document provides step-by-step instructions for setting up and running the MERN-stack Doctor Appointment System on a new computer with a fresh environment.

## 💻 Prerequisites
Ensure your system has the following installed:
- **Node.js**: v16.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: Community Edition or a MongoDB Atlas URI ([Download](https://www.mongodb.com/try/download/community))
- **NPM**: Standard with Node.js

---

## 🚀 Installation & Running

### Step 1: Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` root:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/doctor_appointment
   JWT_SECRET=5000
   ```
4. **Seed the Database** (Crucial for first-time setup):
   ```bash
   node seed.js
   ```
5. **Start the Backend Server**:
   ```bash
   node server.js
   ```
   *The API will now be running on `http://localhost:5000`.*

### Step 2: Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The UI will now be running on `http://localhost:5173`.*

---

## 🔐 Default Login Credentials
Once the database is seeded, you can use these accounts to explore the system:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin Account** | `admin@test.com` | `123456` |
| **Doctor Account** | `smith@test.com` | `123456` |
| **Doctor Account** | `jane@test.com` | `123456` |
| **Doctor Account** | `brown@test.com` | `123456` |

---

## 🛠️ Common Troubleshooting
- **Port Conflict (5000/5173)**: If these ports are in use, update the `.env` for backend or `vite.config.js` for frontend.
- **MongoDB Connection Error**: Ensure the MongoDB service is running and the `MONGO_URI` in your `.env` is correct.
- **Node Modules Error**: If you encounter dependency issues, run `npm install --force`.

---

## 👨‍💻 Developed By
Part of the Software Requirement Specification (SRS) project for Heritage Institute of Technology.
