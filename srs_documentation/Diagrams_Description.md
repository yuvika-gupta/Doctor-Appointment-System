# Diagrams Description for SRS

Use this file as a reference to draw the finalized diagrams in StarUML or Lucidchart.

## 1. Entity Relationship Diagram (ERD)
**Entities & Relationships (Crow's Foot Notation):**
- **User (1) - (1) Doctor** : User has a 1-to-1 relationship with Doctor. (Only if role='doctor').
- **User (1) - (N) Patient** : Admin/Doctor (User) can create multiple Patients. (CreatedBy).
- **Doctor (1) - (N) Timeslot** : A single Doctor can have multiple availability timeslots.
- **Doctor (1) - (N) Appointment** : Doctor has many Appointments.
- **Patient (1) - (N) Appointment** : Patient can have many Appointments.
- **Timeslot (1) - (1) Appointment** : A specific booked appointment uses one timeslot on a specific date.

## 2. DFD Level 0 (Context Diagram)
**Process:** Doctor Appointment System (Circle)
**External Entities (Squares):**
- **Doctor**: Inputs (Login Credentials, Profile Info, Schedule/Timeslot Info, Appointment Status). Outputs (Appointments List, Schedule, Notifications, Premium Visual Dashboard).
- **Admin**: Inputs (Doctor Info, Patient Info, Appt Info). Outputs (Management Reports, User Data, Premium Visual Dashboard).
- **Patient (Implicit/Managed):** Note that Patient doesn't directly interact in this scope, but their data is managed. 

## 3. DFD Level 1
**Main Processes:**
1.0 Manage Authentication (Login, Register/Forgot Pass/Reset Pass) -> Stores to `Users` Database.
2.0 Manage Doctors -> Stores to `Doctors` and `Users` Database.
3.0 Manage Patients -> Stores to `Patients` Database.
4.0 Manage Timeslots -> Stores to `Timeslots` Database.
5.0 Manage Appointments -> Reads `Patients`, `Doctors`, `Timeslots`, writes to `Appointments`.

## 4. DFD Level 2 (Manage Appointments - Process 5.0)
5.1 Add Appointment: Receives Data (Doctor ID, Patient ID, Timeslot ID, Date). Validates availability. Writes to `Appointments` store.
5.2 View Appointment: Queries `Appointments` based on filter. Returns Appt Details.
5.3 Update Status: Receives Appt ID and new Status (Approve/Reject). Updates `Appointments`.

## 5. Use Case Diagram
**System Boundary:** Doctor Appointment System
**Actors:** Doctor, Admin
**Use Cases for Admin:**
- Login / Logout
- Manage Doctors (Add/Edit/List)
- Manage Patients (Add/Edit/List)
- Manage Appointments (Add/View/List)
- Manage Timeslots
**Use Cases for Doctor:**
- Login / Register / Logout
- Edit Profile
- Manage Own Timeslots
- View Own Appointments
- Approve/Reject Appointments

## 6. Class Diagram
**Classes:** 
- `User` (+_id, +name, +email, +passwordHash, +role, +phone)
- `Doctor` (+_id, +userId, +specialization, +bio, +status) -> inherits/associates with User.
- `Patient` (+_id, +name, +age, +gender, +email, +phone, +medicalHistory)
- `Timeslot` (+_id, +doctorId, +startTime, +endTime, +daysOfWeek, +isAvailable)
- `Appointment` (+_id, +doctorId, +patientId, +timeslotId, +date, +status, +notes)

## 7. Sequence Diagrams
### (A) Doctor Login Flow
`Doctor` -> `Frontend UI`: Enters email & pass
`Frontend UI` -> `AuthAPI`: POST /api/auth/login
`AuthAPI` -> `Database`: Find User by email & verify hash
`Database` --> `AuthAPI`: Return User
`AuthAPI` --> `Frontend UI`: Return JWT Token
`Frontend UI` -> `Dashboard`: Redirect to Doctor Dashboard

### (B) Doctor Approves Appointment
`Doctor` -> `Frontend UI`: Clicks "Approve" on Appointment
`Frontend UI` -> `AppointmentAPI`: PUT /api/appointments/:id/status { status: 'approved' }
`AppointmentAPI` -> `Database`: Update Appointment Status
`Database` --> `AppointmentAPI`: Success
`AppointmentAPI` --> `Frontend UI`: Return Updated Appointment
`Frontend UI` -> `Doctor`: Display Success Notification

## 8. Activity Diagram (Appointment Booking workflow)
1. Start
2. Admin selects "Add Appointment"
3. System shows list of Patients and Doctors
4. Admin selects Patient and Doctor
5. System fetches Timeslots for the selected Doctor
6. Admin selects Date and Timeslot
7. System verifies condition: Is Timeslot valid for DayOfWeek?
   - If NO: Return error, loop back to Step 6.
   - If YES: System verifies condition: Is Slot Free on that date?
8. System saves Appointment as "Pending"
9. Doctor logs in and views Appointment details
10. Doctor chooses Action:
    - If Approve: Status = Approved
    - If Reject: Status = Rejected
11. Save Status update.
12. End
