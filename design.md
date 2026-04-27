# MediCare AI — UI Design Reference

> This document describes every page: its purpose, layout, all input fields, buttons, and the data it displays. Intended as a reference for generating UI designs in Stitch AI or similar tools.

---

## Design System

- **Primary color:** Teal (#0d9488)
- **Background:** Light gray (slate-50)
- **Cards:** White with subtle border and shadow, rounded corners
- **Font:** Sans-serif, clean and modern
- **Auth pages layout:** Two-column split (left branding panel + right form)
- **Dashboard layout:** Sidebar or top navbar + content area

---

## 1. Doctor Login `/login`

**Layout:** Two-column split. Left = teal branding panel. Right = login form card.

### Left Panel
- Heading: "Welcome Back."
- Subtext about managing appointments and schedules
- Decorative blurred circles

### Right Form Card
- Heading: "Doctor Sign In"
- Subtext: "Enter your credentials to access your account."

**Input Fields:**
- Email Address (email input) — placeholder: doctor@hospital.com
- Password (password input) — placeholder: ••••••••

**Buttons:**
- Sign In — full-width teal, shows spinner + "Verifying..." on submit

**Links:**
- Forgot password? (inline next to password label)
- "Don't have an account? Register here" → /doctor/signup

**Feedback:**
- Green success banner on login
- Red error banner on wrong credentials

---

## 2. Doctor Register `/doctor/signup`

**Layout:** Two-column split. Left = teal branding. Right = scrollable form card.

### Left Panel
- Heading: "Join Our Network"
- Subtext about connecting with patients

### Right Form Card
- Heading: "Create Doctor Profile"

**Input Fields (top to bottom):**
- Profile Picture — circular upload area, click to select JPG/PNG, shows preview
- First Name (text) — placeholder: e.g. John
- Last Name (text) — placeholder: e.g. Doe
- Email Address (email) — placeholder: doctor@hospital.com
- Phone Number (tel) — placeholder: +1 234 567 890
- Speciality (dropdown) — options: Cardiologist, Dermatologist, Neurologist, Pediatrician, General Surgeon, Psychiatrist, Orthopedic
- Qualifications/Degrees (tag input) — type degree and press Enter or click Add; degrees appear as removable chips (e.g. MBBS, MD)
- Password (password) — placeholder: Create a secure password

**Buttons:**
- Add — inline inside degrees field
- Complete Registration — full-width teal submit, shows spinner on submit

**Links:**
- "Already registered? Sign in to Dashboard" → /login

---

## 3. Patient Register `/patient/signup`

**Layout:** Two-column split. Left = teal/emerald gradient branding. Right = form.

### Left Panel
- Heading: "Join Medicare AI"
- Trust badges: "Secure Data Encryption", "Verified Doctors Only"

### Right Form
- Heading: "Create Account"

**Input Fields:**
- First Name (text) — placeholder: John
- Last Name (text) — placeholder: Doe
- Email Address (email) — placeholder: john.doe@example.com
- Age (number, min 0 max 120)
- Gender (dropdown) — options: Male, Female, Other
- Password (password) — hint text: "Must be at least 8 characters"

**Buttons:**
- Sign Up — full-width teal gradient, shows spinner on submit

**Links:**
- "Already have an account? Login here" → /patient/login

---

## 4. Patient Login `/patient/login`

**Layout:** Two-column split. Left = teal/emerald gradient branding. Right = form.

### Left Panel
- Stethoscope emoji icon
- Heading: "Welcome Back to Medicare AI"
- Subtext about health assistant

### Right Form
- Heading: "Sign In"

**Input Fields:**
- Email Address (email) — placeholder: name@example.com
- Password (password) — placeholder: ••••••••

**Buttons:**
- Sign In — full-width teal, shows spinner + "Signing In..." on submit

**Links:**
- Forgot Password? (inline)
- "New to Medicare AI? Create an account" → /patient/signup

---

## 5. Doctor Dashboard `/doctor-dashboard`

**Layout:** Sticky top navbar + full-width content area.

### Top Navbar
**Displays:**
- MediCare.AI logo with teal icon + "DOCTOR PORTAL" label
- Doctor name: Dr. [Name]
- Role: General Practitioner

**Buttons:**
- Logout — top right, pill-shaped, red on hover

### Main Content
**Displays:**
- Greeting: "Good Morning, Dr. [Name] 👋"
- Subtext: "Manage your practice and appointments efficiently."
- Current date (top right, e.g. Monday, July 14, 2025)
- "System Status: Online"

### Quick Actions Grid (3 cards)

**Card 1 — Appointments**
- Blue icon (calendar)
- Title: Appointments
- Description: "View your upcoming booked sessions, patient details, and join video consultations directly."
- Link: "View Calendar →" → /doctor/appointments

**Card 2 — Create Schedule**
- Green icon (plus)
- Title: Create Schedule
- Description: "Set your weekly availability. Add new time slots so patients can book appointments with you."
- Link: "Add Slots →" → /doctor/schedule/create

**Card 3 — My Schedule**
- Purple icon (clipboard)
- Title: My Schedule
- Description: "Review your existing schedule, check booked slots, and manage your working hours."
- Link: "Manage Slots →" → /doctor/schedule

---

## 6. Patient Dashboard `/patient/dashboard`

**Layout:** Fixed left sidebar + main content area.

### Left Sidebar
**Displays:** MediCare logo

**Navigation Links:**
- Dashboard (active = teal highlight)
- My Appointments
- Find Doctor
- AI Symptom Chat

**Bottom:**
- Logout button (red text)

### Main Content
**Displays:**
- Greeting: "Welcome back, [First Name] 👋"
- Subtext: "Here is your health overview for today."
- Patient avatar (first letter in teal circle, top right)

**Buttons:**
- Book Appointment — dark button top right → /doctors

### Feature Cards (2 cards)

**Card 1 — AI Symptom Checker**
- Teal gradient background
- "New Feature" badge
- Title: AI Symptom Checker
- Description: "Not feeling well? Chat with our advanced AI to understand your symptoms before seeing a doctor."
- Button: Start Chat → /ai-chat

**Card 2 — Find a Specialist**
- White card
- Doctor emoji icon
- Title: Find a Specialist
- Description: "Browse top-rated doctors, read reviews, and book appointments instantly."
- Link: "Search Doctors →" → /doctors

---

## 7. Schedule Generator `/doctor/schedule/create`

**Layout:** Back link + page heading + two-panel grid (left config, right preview).

### Page Header
- Back link: "← Back to Dashboard"
- Heading: "Schedule Manager"
- Subtext: "Pick specific dates and define your consultation slots."

### Left Panel — Configuration

**Time Configuration Card:**
- Start Time (time picker) — default 09:00
- End Time (time picker) — default 17:00
- Slot Duration (dropdown) — 15 min / 30 min / 45 min / 60 min
- Consultation Fee $ (number input)

**Select Dates Card — Inline Calendar:**
- Month/year header with left/right arrow navigation
- Day-of-week row: Su Mo Tu We Th Fr Sa
- Date grid — past dates greyed out and disabled, today has teal ring, selected dates filled teal
- Footer: "X date(s) selected" + "Clear all" link

**Buttons:**
- Generate Slots — full-width dark button with arrow icon

### Right Panel — Preview

**Displays:**
- Header: "Preview Slots" + slot count badge (e.g. "8 Slots")
- Empty state: illustration + "Ready to Plan? Select dates and configure times on the left, then click Generate."
- When slots generated:
  - Selected date chips shown as tags (e.g. "Mon, Jul 14")
  - Grid of slot cards showing time range (e.g. "09:00 – 09:30") — hover shows red "Remove" overlay, click to remove
  - Footer summary: "These X slot(s) will be created for each of the Y selected date(s) — Z total entries."

**Buttons:**
- Confirm & Save Schedule — full-width teal button at bottom of preview panel, shows spinner on save

**Feedback banners (shown above panels):**
- Green success: "Schedule added successfully (X slots created)"
- Red error: generic error message
- Amber warning: lists past dates that were rejected
- Rose conflict: lists slots that already exist and were skipped

---

## 8. My Schedule `/doctor/schedule`

**Layout:** Back link + heading + two-panel layout (left date sidebar + right slots panel).

### Page Header
- Back link: "← Back to Dashboard"
- Heading: "My Schedule"
- Subtext: "Manage your upcoming availability."
- Total Slots count badge (top right)

### Left — Date Sidebar
**Displays:** List of date buttons, one per day that has slots.

Each date button shows:
- Short date (e.g. "Jul 14")
- Day of week + slot count (e.g. "Mon · 4 slots")
- Active date = dark background, inactive = white with hover teal

### Right — Slots Panel
**Header bar (dark background):**
- Full date label (e.g. "Monday, July 14, 2025")
- Slot count badge

**Each slot row displays:**
- Time range (e.g. "09:00 – 09:30") — bold
- Fee and duration (e.g. "$50 · 30 min") — small text below
- Status badge — color coded:
  - available = teal
  - booked = blue
  - ongoing = amber
  - completed = grey
  - cancelled = red
- Delete icon (trash) — only shown for available slots, click to delete

**Empty state:**
- Calendar illustration + "No Upcoming Schedule" + "Create Schedule →" link

---

## 9. Doctor Appointments `/doctor/appointments`

**Layout:** Back link + heading + appointment cards grid.

### Page Header
- Back link: "← Back to Dashboard"
- Heading: "My Appointments"
- Subtext: "Manage your upcoming consultations."
- Appointment count badge (top right)

### Appointment Cards Grid (2–3 columns)

Each card displays:
- Patient avatar (first letter of name in teal circle)
- Patient full name
- Status badge — booked (green) / ongoing (blue)
- Date (e.g. "Mon, Jul 14, 2025")
- Time range (e.g. "9:00 AM – 9:30 AM")
- Appointment ID (last 6 chars, bottom left)

**Card footer actions:**
- If appointment is booked AND it is currently within the slot time window:
  - "Start Consult" button (teal) → /room/[meetingId]
  - "Reschedule" button (amber) — opens confirmation modal
- If booked but not yet time:
  - "Starts at [time]" text (no button)
  - "Reschedule" button (amber)

### Reschedule Confirmation Modal
**Displays:**
- Warning icon (amber)
- Heading: "Reschedule Appointment?"
- Explanation: "This will cancel the appointment and give the patient a free rebook token so they can pick another one of your available slots at no charge."
- Summary card showing: Patient name, Date, Time
- Success/error message banner

**Buttons:**
- Cancel — outlined grey
- Confirm Reschedule — amber filled, shows spinner on submit

---

## 10. My Appointments `/my-appointments` (Patient)

**Layout:** Sticky top header + appointment cards grid.

### Top Header
- Heading: "My Appointments"
- Button: "Book New" → /doctors (top right)

### Appointment Cards Grid (2–3 columns)

Each card displays:
- Doctor avatar (first letter in grey square)
- Status badge — booked (green) / ongoing (blue) / cancelled (rose) / completed (grey)
- Doctor full name (e.g. "Dr. John Doe")
- Speciality (e.g. "Cardiologist")
- Info box:
  - Date (e.g. "Mon, Jul 14, 2025")
  - Time (e.g. "9:00 AM")
- Appointment ID (last 6 chars, bottom left)

**Card footer actions (based on status):**
- booked/ongoing + within time window: "Join Call" button (red) → /room/[meetingId]
- booked/ongoing + not yet time: "Starts at [time]" text
- completed + not reviewed: "Leave a Review" button (teal star icon)
- completed + already reviewed: "Reviewed" badge (amber star)
- cancelled + has rebook token: "Rebook Free" button (teal) — opens slot picker modal
- cancelled (no token): "cancelled" text label

### Review Modal (shown after completed appointment)
**Displays:**
- Heading: "Rate your consultation"
- Doctor name subtitle
- 5-star rating selector (click to rate, hover highlights)
- Rating label (Poor / Fair / Good / Very Good / Excellent)
- Text area: "Share your experience (optional)..." (max 1000 chars)
- Character counter

**Buttons:**
- Skip — outlined grey
- Submit Review — teal filled, disabled until star selected

### Rebook Free Modal (shown for cancelled appointments with token)
**Displays:**
- Gift icon
- Heading: "Rebook for Free"
- Explanation: "Your doctor rescheduled your appointment. Pick any available slot from Dr. [Name] — no payment needed."
- Slot picker (accordion by date, same as BookAppointment page)
- Selected slot summary card showing: Date, Time, Fee = FREE

**Buttons:**
- Close — outlined grey
- Confirm Rebook — teal filled, shows spinner on submit

---

## 11. Find Doctors `/doctors`

**Layout:** Full-width teal header banner with search + doctor cards grid below.

### Header Banner (teal background)
- Heading: "Find Your Specialist"
- Subtext: "Browse our list of top-rated doctors, view their profiles, and book an appointment in seconds."
- Search bar (white, full-width, centered):
  - Placeholder: "Search by name or speciality (e.g. Cardiologist)..."
  - Search icon on left

### Doctor Cards Grid (2–4 columns, responsive)

Each card displays:
- Teal/blue gradient banner at top of card
- Doctor profile photo (circular, overlapping banner)
- Doctor full name: "Dr. [First] [Last]"
- Speciality (teal, uppercase, small)
- Degrees/qualifications pill (e.g. "MBBS, MD")

**Card footer:**
- "Book Appointment →" button — white outlined, turns teal on hover

**Empty state:**
- Search icon + "No doctors found" + "Try adjusting your search terms."

**Loading state:**
- Skeleton cards (grey animated pulse placeholders)

---

## 12. Book Appointment `/book-appointment/:doctorId`

**Layout:** Teal header banner + two-panel grid (left doctor card + right slots panel).

### Header Banner (teal)
- Back button: "← Back to List"

### Left Panel — Doctor Info Card

**Displays:**
- Doctor profile photo (circular, overlapping banner)
- Doctor full name: "Dr. [First] [Last]"
- Speciality (teal, uppercase)

**Stats row (3 columns):**
- Completed (number of completed appointments)
- Avg Rating (e.g. 4.5)
- Reviews (total review count)

**Info rows:**
- Speciality label + value
- Available Dates count

**Reviews section (below doctor card):**
- Heading: "Patient Reviews" with star icon
- Each review shows:
  - Patient name
  - Star rating (5 stars, amber filled)
  - Review text (if provided)
  - Date posted

**Empty reviews state:**
- "No reviews yet for this doctor."

### Right Panel — Available Slots

- Heading: "Available Slots"
- Subtext: "Select a date, then pick a time slot."

**Slot accordion (one row per date):**
- Date header (e.g. "Monday, July 14, 2025") + slot count + fee
- Expand/collapse arrow
- When expanded: grid of time slot buttons (e.g. "9:00 AM", "9:30 AM")
- Selected slot highlighted in teal

**Empty state:**
- Calendar icon + "No slots available right now."

### Booking Confirmation Modal
**Displays:**
- Calendar emoji icon
- Heading: "Confirm Booking"
- Summary card:
  - Doctor name
  - Date
  - Time
  - Fee ($)

**Buttons:**
- Cancel — text button
- Confirm Booking — teal gradient button

**Error states in modal:**
- Conflict: "You already have an appointment that overlaps with this time slot..."
- Unavailable: "This slot was just taken. Please select another available time."
- Generic error

---

## 13. AI Symptom Chat `/ai-chat`

**Layout:** Full-height chat interface. Sticky header + scrollable message area + fixed input bar at bottom.

### Header (sticky, frosted glass)
**Displays:**
- MediCare AI logo (teal icon with stethoscope emoji)
- "MediCare AI" title
- "Symptom Checker Active" with green pulsing dot

**Buttons:**
- Exit — top right, navigates back to patient dashboard

### Chat Message Area (scrollable)
**Displays:**
- "Session Started" timestamp label at top
- Messages in chat bubble format:
  - Patient messages: teal gradient bubble, right-aligned
  - AI messages: white bubble with border, left-aligned, with robot emoji avatar
  - AI responses rendered as formatted markdown (headings, bullet lists, bold text)
  - Medical sources footnote below AI responses (if available)
- Typing indicator: three bouncing dots with robot avatar (shown while AI is responding)

### Input Bar (fixed bottom)
- Text input: placeholder "Type your symptoms here..."
- Send button (teal, arrow icon) — disabled when input is empty or loading, shows spinner when sending
- Disclaimer text: "AI can make mistakes. Please consult a real doctor for emergencies."

---

## 14. Video Call Room `/room/:roomId`

**Layout:** Full-screen video call. VideoSDK renders the full viewport. Our UI floats on top.

### Floating Timer Pill (top-left corner, always visible)
**Displays:**
- Countdown timer (MM:SS format, e.g. "09:50")
- Normal state: dark semi-transparent pill
- Under 2 minutes: red pulsing pill

### End Session Overlay (shown when time runs out or user leaves)
**Full-screen dark overlay (covers VideoSDK's own UI):**

**For Patients:**
- Video icon
- Heading: "Session Ended"
- Subtext: "Your consultation with Dr. [Name] has ended."
- Review form:
  - "How was your consultation with Dr. [Name]?"
  - 5-star rating (click stars, hover highlights)
  - Text area: "Share your experience (optional)..." (max 1000 chars)
  - Skip button (grey)
  - Submit Review button (teal)
- After submit: checkmark + "Review submitted! Redirecting you now…" → navigates to /my-appointments

**For Doctors:**
- No overlay shown — automatically redirected to /doctor/appointments immediately when session ends
