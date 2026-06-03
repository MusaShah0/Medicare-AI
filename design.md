# MediCare AI — Page Fields Reference

---

## 1. Doctor Login `/login`

- Email Address
- Password
- Sign In (button)
- Forgot password? (link)
- Register here (link)

---

## 2. Doctor Register `/doctor/signup`

- Profile Picture (file upload)
- First Name
- Last Name
- Email Address
- Phone Number
- Speciality
- Qualifications / Degrees (tag input)
- Password
- Complete Registration (button)
- Sign in to Dashboard (link)

---

## 3. Patient Register `/patient/signup`

- First Name
- Last Name
- Email Address
- Age
- Gender
- Password
- Sign Up (button)
- Login here (link)

---

## 4. Patient Login `/patient/login`

- Email Address
- Password
- Sign In (button)
- Forgot Password? (link)
- Create an account (link)

---

## 5. Doctor Dashboard `/doctor-dashboard`

- Doctor Name
- Logout (button)
- Greeting message
- Current date
- View Calendar (link → /doctor/appointments)
- Add Slots (link → /doctor/schedule/create)
- Manage Slots (link → /doctor/schedule)

---

## 6. Patient Dashboard `/patient/dashboard`

- Patient First Name
- Book Appointment (button → /doctors)
- Logout (button)
- Start Chat (button → /ai-chat)
- Search Doctors (link → /doctors)
- Navigation: Dashboard, My Appointments, Find Doctor, AI Symptom Chat

---

## 7. Schedule Generator `/doctor/schedule/create`

- Start Time
- End Time
- Slot Duration
- Consultation Fee
- Date picker (calendar — select multiple dates)
- Generate Slots (button)
- Remove (per slot — button)
- Confirm & Save Schedule (button)

---

## 8. My Schedule `/doctor/schedule`

- Date (per day button in sidebar)
- Time Range (per slot)
- Fee
- Slot Duration
- Status badge (available / booked / ongoing / completed / cancelled)
- Delete (button — available slots only)
- Create Schedule (link)

---

## 9. Doctor Appointments `/doctor/appointments`

- Patient Name
- Patient Avatar (initial)
- Status badge
- Appointment Date
- Appointment Time Range
- Appointment ID
- Start Consult (button → /room/:meetingId)
- Reschedule (button)

### Reschedule Confirmation Modal
- Patient Name
- Appointment Date
- Appointment Time
- Cancel (button)
- Confirm Reschedule (button)

---

## 10. My Appointments `/my-appointments` (Patient)

- Doctor Name
- Doctor Avatar (initial)
- Speciality
- Status badge
- Appointment Date
- Appointment Time
- Appointment ID
- Join Call (button → /room/:meetingId)
- Leave a Review (button)
- Rebook Free (button)
- Book New (button → /doctors)

### Review Modal
- Star Rating (1–5)
- Review Text (optional textarea)
- Skip (button)
- Submit Review (button)

### Rebook Free Modal
- Doctor Name
- Available Slots (date accordion + time slot buttons)
- Selected Date
- Selected Time
- Fee (shown as FREE)
- Close (button)
- Confirm Rebook (button)

---

## 11. Find Doctors `/doctors`

- Search (text input — name or speciality)
- Doctor Profile Photo
- Doctor Full Name
- Speciality
- Degrees
- Book Appointment (button → /book-appointment/:doctorId)

---

## 12. Book Appointment `/book-appointment/:doctorId`

- Doctor Profile Photo
- Doctor Full Name
- Speciality
- Completed Appointments (count)
- Average Rating
- Total Reviews (count)
- Patient Reviews (reviewer name, star rating, review text, date)
- Available Slots (date accordion + time slot buttons)
- Selected Slot (date, time, fee)
- Back to List (link)

### Booking Confirmation Modal
- Doctor Name
- Appointment Date
- Appointment Time
- Fee
- Cancel (button)
- Confirm Booking (button)

---

## 13. AI Symptom Chat `/ai-chat`

- Message Input (text)
- Send (button)
- Chat Messages (patient + AI bubbles)
- Medical Sources (per AI message)
- Exit (button → /patient/dashboard)

---

## 14. Video Call Room `/room/:roomId`

- Countdown Timer
- VideoSDK embedded video UI (camera, mic, participants)

### End Session Overlay (Patient)
- Doctor Name
- Star Rating (1–5)
- Review Text (optional textarea)
- Skip (button)
- Submit Review (button)
