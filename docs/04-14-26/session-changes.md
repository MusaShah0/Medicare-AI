# MediCare AI — Session Changes & Fixes (April 14, 2026)

---

## 1. Steering File Created

**File:** `.kiro/steering/project-context.md`

Created a comprehensive steering file documenting the full project architecture, all models, API endpoints, auth flows, business logic flows, frontend routes, known filename typos, environment variables, and unimplemented features. Updated throughout the session as changes were made.

---

## 2. Schedule System — Day-based → Date-based Migration

### Backend

**`BackEnd/Models/sechdule.model.js`**
- Removed `day` field (enum Mon–Sun)
- Added `date: { type: Date, required: true }`
- Added compound unique index: `{ doctor, date, startTime }` to prevent duplicate slots

**`BackEnd/Controlers/Sechdule.contoller.js`** — full rewrite
- `Add_Sechdule`: body changed from `{ days[], slots[] }` to `{ dates[], slots[] }` (ISO date strings)
- `Show_Doctor_Sechdule`: removed day-of-week auto-cancel, replaced with date-boundary auto-cancel, results sorted by `date` then `startTime`
- `Show_Doctor_Sechdule_Day`: `:id` param now a `YYYY-MM-DD` date string instead of a day name

**`BackEnd/Controlers/Appoitment.controller.js`**
- `Show_Appoitment_Sechdule`: returns slots grouped by date `{ "2025-07-14": [...] }` instead of flat list
- `Book_Appointment`: conflict check now uses same-date + time overlap instead of day-of-week comparison
- `My_Appointments` / `Doctor_Appointments`: replaced week-day auto-cancel with calendar date comparison
- `Validate_And_Join_Meeting`: replaced day-of-week check with `schedule.date === today` check

**`BackEnd/utils/autoCancel.js`** — new utility
- Shared helper used by both appointment and schedule controllers
- Cancels/completes stale documents based on calendar date boundary

### Frontend

**`FrontEnd/src/pages/ScheduleGenerator.jsx`**
- Replaced day-of-week checkboxes with an inline multi-select calendar component (built from scratch, no new dependencies)
- Calendar supports month navigation, past dates greyed out, today highlighted with ring, multi-select with clear all
- Payload changed from `days[]` to `dates[]`

**`FrontEnd/src/pages/MySchedule.jsx`**
- Replaced day-grouped cards with a date sidebar + slot panel layout
- Clicking a date shows its slots; delete button added for available slots
- Groups and sorts by `slot.date` instead of `slot.day`

**`FrontEnd/src/pages/BookAppointment.jsx`**
- Replaced flat/day-grouped slot list with date-grouped accordion
- Each date is an expandable row showing its time slots
- Confirmation modal now shows the actual calendar date
- On successful booking navigates to `/my-appointments` after 1.5s

---

## 3. Conflict Validation

### Backend

**`BackEnd/Controlers/Sechdule.contoller.js` — `Add_Sechdule`**
- Step 1: Collects ALL past dates before returning — returns `400` with `invalidDates[]`
- Step 2: Checks ALL date×slot combos against DB (`status: $in ['available','booked','ongoing']`) before any insert
- If any conflict found → `409` with full `conflicts[]` array, zero inserts (atomic reject)
- Step 3: Clean batch → bulk insert, `201` with `count`

**`BackEnd/Controlers/Appoitment.controller.js` — `Book_Appointment`**
- Separate `404` (slot not found) from `400` (slot not available)
- Fetches all patient `booked/ongoing` appointments, uses `moment` for date comparison and `toMinutes()` for overlap: `!(end <= existingStart || start >= existingEnd)`
- Conflict → `409 { success: false, message: "..." }`, no VideoSDK room created

### Frontend

**`FrontEnd/src/pages/ScheduleGenerator.jsx`**
- `message` state restructured to `null | { type, ... }`
- `409` renders a rose panel listing each conflict as "Month D, YYYY — HH:MM AM/PM"
- `400` with `invalidDates` renders an amber panel listing past dates
- Form selections preserved on both error types — only cleared on `201` success

**`FrontEnd/src/pages/BookAppointment.jsx`**
- `bookingError` state tracks conflict type per attempted slot
- `409` → inline red error in modal, "Choose a Different Time" button, Confirm disabled
- `400` → "slot just taken" message, auto-refreshes slot list, closes modal

---

## 4. Appointment Date Display Fix

**`FrontEnd/src/pages/MyAppointments.jsx`**
**`FrontEnd/src/pages/DoctorAppointments.jsx`**
- Both pages were reading `slot.day` (removed field) — replaced with `slot.date` formatted via `toLocaleDateString`

---

## 5. Private Routing — JWT Cookie-based Auth

**`FrontEnd/src/hooks/useAuth.js`** — new hook
- Calls `/doctor/verify` or `/patient/verify` with `withCredentials: true`
- Returns `'loading' | 'authenticated' | 'unauthenticated'`
- Supports `role: 'any'` using `Promise.any()` for routes accessible by either role

**`FrontEnd/src/App.jsx`** — full rewrite
- `DoctorRoute` — verifies doctor cookie, spinner while loading, redirects to `/login`
- `PatientRoute` — verifies patient cookie, redirects to `/patient/login`
- `GuestRoute` — wraps login/signup; bounces already-authenticated users to their dashboard
- `AnyRoute` — used for `/room/:roomId`; accepts either doctor or patient cookie
- Removed unused `role` state

**`BackEnd/Routes/Doctor.route.js`**
- Added `GET /doctor/verify` protected by `Doctor_Check` middleware

**`BackEnd/Routes/Patient.route.js`**
- Added `GET /patient/verify` protected by `Patient_Check` middleware

**`BackEnd/Controlers/Patient.controller.js`**
- Added `verifyPatient` controller

**`FrontEnd/src/pages/DoctorLogin.jsx`** / **`DoctorSignup.jsx`**
- Removed `setRole` prop — auth now driven by cookie verification, not app state
- `localStorage` kept only for display purposes (doctor name in dashboard header)

---

## 6. Video Call Flow — Status Management & Participant Names

**`BackEnd/MiddleWare/AnyUser.middleware.js`** — new middleware
- Tries doctor JWT secret first, then patient secret
- Sets `req.userRole`, `req.doctorId` / `req.PatientId`

**`BackEnd/Routes/Appoitment.route.js`**
- `/join-meeting/:roomId` now uses `AnyUser_Check` middleware

**`BackEnd/Controlers/Appoitment.controller.js` — `Validate_And_Join_Meeting`** — rewritten
- Populates both `patient_id` and `doctor_id` names
- Blocks re-join if appointment is already `completed` or `cancelled`
- If `now > endTime` → immediately marks both appointment and schedule as `completed`, returns `403`
- On first join (`booked` → `ongoing`): marks **both** appointment and schedule as `ongoing`
- `setTimeout` at slot end: marks **both** as `completed`
- Returns `participantName` (caller's real name), `doctorName`, `patientName`, `userRole`, `remainingTime`

**`FrontEnd/src/pages/VideoCall.jsx`** — full rewrite
- Calls `/join-meeting` with `withCredentials: true`
- Uses `meetingData.participantName` as VideoSDK display name — both sides see real names
- Top bar: "In call with [other person's name]", live countdown, red ✕ leave button
- Countdown turns red in last 2 minutes
- `hardLeave()` clears interval ref and navigates to correct appointments page per role
- `onMeetingLeft` and auto-end both call `hardLeave()`
- Fixed broken countdown `useEffect` dependency (was `[timeLeft !== null]` — a boolean that never changes)

**`FrontEnd/src/pages/MyAppointments.jsx`** / **`DoctorAppointments.jsx`**
- `isJoinable(slot)` helper: Join button only shown when slot is today AND within `[startTime-5min, endTime)`
- `now` state with 30-second tick so `isJoinable` stays accurate without stale `new Date()`
- `window.focus` event re-fetches appointments when user returns from video call

---

## 7. Auto-Cancel / Auto-Complete Fix

**`BackEnd/utils/autoCancel.js`** — updated
- Was only setting `cancelled` for everything
- Now: `ongoing` past end → `completed`, `booked` past end → `cancelled`
- Also saves the linked schedule document in the same pass

**`BackEnd/Controlers/Appoitment.controller.js`**
- `My_Appointments` and `Doctor_Appointments` now sweep `{ $in: ['booked', 'ongoing'] }` instead of only `booked`
- Ensures stuck `ongoing` appointments get resolved to `completed` on next page load

---

## 8. Review System

### Backend

**`BackEnd/Models/Rewiew.model.js`** — updated
- Added `rating: Number` (required, min 1, max 5)
- Added `appointment_id: ObjectId` (unique — one review per appointment)
- Made `doctor_id` and `patient_id` required

**`BackEnd/Controlers/Rewiew.controller.js`** — new file
- `Submit_Review` (`POST /review`): validates appointment is `completed` and belongs to patient, blocks duplicates, saves review
- `Check_Review` (`GET /review/check/:appointmentId`): returns `{ reviewed: true/false }`
- `Get_Doctor_Reviews` (`GET /review/doctor/:doctorId`): public, returns all reviews for a doctor

**`BackEnd/Routes/Rewiew.route.js`** — new file
- `POST /review` — `Patient_Check` protected
- `GET /review/check/:appointmentId` — `Patient_Check` protected
- `GET /review/doctor/:doctorId` — public

**`BackEnd/index.js`**
- `ReviewRoutes` imported and registered

### Frontend

**`FrontEnd/src/pages/MyAppointments.jsx`** — updated
- On mount, fires parallel `GET /review/check/:id` for all `completed` appointments, builds `reviewedIds` Set
- `completed` appointment footer:
  - "Leave a Review" button → opens `ReviewModal`
  - "⭐ Reviewed" badge if already submitted
- `ReviewModal` component (inline):
  - `StarRating` sub-component (1–5 stars with labels)
  - Optional text area (1000 char limit with counter)
  - Submit / Skip buttons with loading state and inline error
  - On success: modal closes, card immediately shows "Reviewed" badge without page reload

---

## Summary of New Files

| File | Type |
|------|------|
| `.kiro/steering/project-context.md` | Steering / docs |
| `BackEnd/utils/autoCancel.js` | Backend utility |
| `BackEnd/MiddleWare/AnyUser.middleware.js` | Backend middleware |
| `BackEnd/Controlers/Rewiew.controller.js` | Backend controller |
| `BackEnd/Routes/Rewiew.route.js` | Backend route |
| `FrontEnd/src/hooks/useAuth.js` | Frontend hook |

## Summary of Modified Files

| File | What Changed |
|------|-------------|
| `BackEnd/Models/sechdule.model.js` | `day` → `date`, compound index |
| `BackEnd/Models/Rewiew.model.js` | Added `rating`, `appointment_id`, required fields |
| `BackEnd/Controlers/Sechdule.contoller.js` | Full date-based rewrite + conflict validation |
| `BackEnd/Controlers/Appoitment.controller.js` | Date migration, conflict check, video flow, auto-complete |
| `BackEnd/Routes/Appoitment.route.js` | Added `AnyUser_Check` to join-meeting |
| `BackEnd/Routes/Doctor.route.js` | Added `/doctor/verify` |
| `BackEnd/Routes/Patient.route.js` | Added `/patient/verify` |
| `BackEnd/Controlers/Patient.controller.js` | Added `verifyPatient` |
| `BackEnd/index.js` | Registered `ReviewRoutes` |
| `FrontEnd/src/App.jsx` | Full routing rewrite with cookie-based guards |
| `FrontEnd/src/hooks/useAuth.js` | Added `'any'` role support |
| `FrontEnd/src/pages/ScheduleGenerator.jsx` | Calendar picker, date-based payload, conflict error UI |
| `FrontEnd/src/pages/MySchedule.jsx` | Date sidebar layout |
| `FrontEnd/src/pages/BookAppointment.jsx` | Date accordion, conflict error UI, navigate on success |
| `FrontEnd/src/pages/MyAppointments.jsx` | Date display fix, live clock, review modal |
| `FrontEnd/src/pages/DoctorAppointments.jsx` | Date display fix, live clock, focus re-fetch |
| `FrontEnd/src/pages/VideoCall.jsx` | Full rewrite — names, countdown, hardLeave, status flow |
| `FrontEnd/src/pages/DoctorLogin.jsx` | Removed `setRole` prop |
| `FrontEnd/src/pages/DoctorSignup.jsx` | Removed `setRole` prop |
