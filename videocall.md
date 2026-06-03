# MediCare AI — Video Call Functionality

This document describes the complete video call flow end-to-end: how a room is created, how both participants join, how the session is timed and auto-closed, and how the third-party SDK (VideoSDK.live) is integrated.

---

## Third-Party SDK: VideoSDK.live (Prebuilt)

**SDK:** `@videosdk.live/rtc-js-prebuilt` v0.3.20
**Integration method:** CDN script tag loaded dynamically at runtime
**Script URL:** `https://sdk.videosdk.live/rtc-js-prebuilt/0.3.20/rtc-js-prebuilt.js`
**Global object exposed:** `window.VideoSDKMeeting`

### What VideoSDK Provides
- Full WebRTC video/audio call infrastructure (no self-hosted media server needed)
- Prebuilt UI rendered directly into the browser viewport — camera feed, mic controls, chat panel, screen share button, participant list, leave button
- Room management via REST API (`POST https://api.videosdk.live/v2/rooms`) — creates a unique `roomId`
- JWT-based authentication — every API call and SDK init requires a signed token

### VideoSDK Credentials (stored in `BackEnd/utils/videoSDK.js`)
```
API_KEY:    459d9d71-647a-4c6e-a2c2-b50e0a856c9f
SECRET_KEY: 5144cb66d6122755f853ec9338177530758ab24fff2a9523e42910e0c22f62ec
```
> Note: These are currently hardcoded. Should be moved to `.env` variables.

### Token Generation (`generateToken`)
- Algorithm: HS256
- Expiry: 120 minutes
- Payload: `{ apikey, permissions: ["allow_join", "allow_mod"] }`
- Used for: creating rooms (REST API call) and initializing the SDK on the frontend

---

## Data Model: Appointment

The `Appointment` document is the central record that ties everything together.

```
patient_id       → ref Patient
doctor_id        → ref Doctor
sechdule_Id      → ref Schedule (holds date, startTime, endTime)
status           → 'booked' | 'ongoing' | 'completed' | 'cancelled'
meeting_id       → VideoSDK roomId (string, e.g. "fqr7-zdez-u0dn")
is_rescheduled_token → boolean (free rebook token for patient)
rescheduled_from → ref Appointment (original cancelled appointment)
```

The `meeting_id` is the VideoSDK `roomId`. It is created once at booking time and never changes for that appointment.

---

## Complete Flow

### Phase 1 — Room Creation (at Booking Time)

When a patient books an appointment (`POST /Book_Appointment/:scheduleId`):

1. Backend generates a VideoSDK JWT token via `generateToken()`
2. Backend calls `POST https://api.videosdk.live/v2/rooms` with the token in the Authorization header
3. VideoSDK returns a unique `roomId` (e.g. `"fqr7-zdez-u0dn"`)
4. The `roomId` is saved as `meeting_id` on the Appointment document
5. Schedule slot status is set to `booked`

The room URL becomes: `/room/fqr7-zdez-u0dn`

This room is pre-created and waiting — it does not expire until the appointment is completed or cancelled.

---

### Phase 2 — Joining the Room (at Appointment Time)

Both doctor and patient navigate to `/room/:roomId` from their respective appointments pages.

#### Step 1: Auth Middleware (`AnyUser_Check`)

The route `GET /join-meeting/:roomId` is protected by `AnyUser_Check` middleware.

This middleware:
- Reads the `token` cookie from the request
- Tries to verify it against the Doctor JWT secret (`SecretKey`)
- If that fails, tries the Patient JWT secret (`P_SecretKey`)
- Sets `req.userRole` to either `'doctor'` or `'patient'`
- Sets `req.doctorId` or `req.PatientId` accordingly
- Returns 401 if neither secret matches

This is how the backend knows who is joining without requiring separate login endpoints.

#### Step 2: Server-Side Validation (`Validate_And_Join_Meeting`)

The backend performs these checks in order:

| Check | Condition | Response |
|-------|-----------|----------|
| Room exists | `meeting_id` matches an appointment | 404 if not found |
| Not already ended | status is not `completed` or `cancelled` | 403 "This meeting has already ended." |
| Correct day | Schedule date matches today | 403 "This meeting is scheduled for [date], not today." |
| Not too early | Current time >= startTime minus 5 minutes | 403 "Meeting has not started yet. Starts at [time]." |
| Not too late | Current time < endTime | 403 "This meeting has ended." (also marks completed) |

If all checks pass:
- If appointment status is `booked` → sets both appointment and schedule to `ongoing`
- Calculates `remainingMs` = endTime - now (in milliseconds)
- Calls `scheduleAutoComplete(appointmentId, doctorId, remainingMs)` — registers the server-side auto-complete timer
- Generates a fresh VideoSDK JWT token
- Returns the join payload to the frontend

#### Step 3: Join Response Payload

```json
{
  "status": 1,
  "token": "<VideoSDK JWT>",
  "participantName": "Dr. John Doe" or "Jane Smith",
  "doctorName": "Dr. John Doe",
  "patientName": "Jane Smith",
  "userRole": "doctor" or "patient",
  "appointmentId": "<MongoDB ObjectId>",
  "validUntil": "<ISO timestamp of slot end>",
  "remainingTime": 847
}
```

`remainingTime` is in seconds — this is what drives the frontend countdown timer.

---

### Phase 3 — Frontend Initialization

The `VideoCall` React component runs these steps in sequence:

#### Step 1: Load VideoSDK Script
- Checks if `window.VideoSDKMeeting` already exists (cached from previous visit)
- If not, dynamically injects a `<script>` tag pointing to the CDN URL
- Polls every 100ms until `window.VideoSDKMeeting` is available
- Sets `scriptLoaded = true` when ready

#### Step 2: Validate and Fetch Token
- Calls `GET /join-meeting/:roomId` with `withCredentials: true` (sends the auth cookie)
- On success: stores `meetingData` (token, names, role, appointmentId, remainingTime) in state
- On failure: shows the error screen with the server's error message

#### Step 3: Start Countdown Timer
- Once `remainingTime` arrives from the server, starts a `setInterval` that ticks every 1 second
- Uses a `countdownStarted` ref guard — the interval is only ever created once, even if the component re-renders
- The interval decrements `timeLeft` via a functional updater
- When `timeLeft` reaches 0, the interval clears itself and returns 0
- A separate `useEffect` watches for `timeLeft === 0` and calls `endSession()`

#### Step 4: Initialize VideoSDK Meeting
- Waits for both `meetingData` and `scriptLoaded` to be true
- Uses a `meetingInitedRef` guard to prevent double-initialization
- Creates `new window.VideoSDKMeeting()` and calls `.init()` with:

```js
meeting.init({
  name: meetingData.participantName,   // "Dr. John Doe" or "Jane Smith"
  meetingId: roomId,                   // from URL params
  token: meetingData.token,            // fresh VideoSDK JWT from server
  containerId: null,                   // full-page mode — SDK takes over entire viewport
  micEnabled: true,
  webcamEnabled: true,
  participantCanToggleSelfWebcam: true,
  participantCanToggleSelfMic: true,
  chatEnabled: true,
  screenShareEnabled: true,
  onMeetingLeft: endSession,           // intercept SDK's own Leave button
})
```

`containerId: null` means VideoSDK renders its full prebuilt UI across the entire browser window — camera feeds, controls bar, chat panel, participant list are all managed by the SDK.

---

### Phase 4 — Active Call

While the call is running:

**VideoSDK handles:**
- Camera and microphone streams (WebRTC)
- Participant video tiles
- Mute/unmute controls
- Camera on/off toggle
- In-call text chat
- Screen sharing
- Leave button (triggers `onMeetingLeft` callback)

**Our code handles:**
- Floating countdown timer pill (top-left corner, `z-index: 9998`)
  - Normal state: dark semi-transparent pill showing `MM:SS`
  - Under 2 minutes: red pulsing pill (visual warning)
- The timer runs entirely in the frontend — it counts down from `remainingTime` received at join

**Server-side (running in background):**
- `scheduleAutoComplete` has registered a `setTimeout` for `remainingMs` milliseconds
- This timer is stored in an in-memory `Map` keyed by `appointmentId`
- Only one timer exists per appointment — duplicate join calls (doctor + patient both joining) are silently ignored by the Map check
- When the timer fires: appointment → `completed`, schedule → `completed`, doctor's `completed_appointments` counter incremented by 1

---

### Phase 5 — Session End

A session can end in three ways:

#### Way 1: Countdown reaches zero (time-based end)
- Frontend `timeLeft` hits 0
- `endSession()` is called
- `sessionEnded` state set to `true`
- Server-side `scheduleAutoComplete` timer also fires at the same moment (independently)

#### Way 2: User clicks Leave inside VideoSDK UI
- VideoSDK fires the `onMeetingLeft` callback
- This is wired directly to `endSession()`
- Same result as Way 1

#### Way 3: User clicks the X button in our floating timer area
- (Previously existed, currently removed — only the timer pill is shown)
- Would call `endSession()` directly

#### What `endSession()` does:
1. Clears the countdown interval (`clearInterval`)
2. Sets `sessionEnded = true`

---

### Phase 6 — Post-Session Behavior

#### For Patients:
- `sessionEnded = true` renders the `EndOverlay` component
- `EndOverlay` is `fixed inset-0 z-[9999]` — full-screen dark overlay that completely covers VideoSDK's own "Rejoin" screen
- Shows: "Session Ended" heading + "Your consultation with Dr. [Name] has ended."
- Shows the `ReviewForm`:
  - 5-star rating selector (required)
  - Optional text area for written review (max 1000 chars)
  - Skip button — navigates to `/my-appointments` without submitting
  - Submit Review button — calls `POST /review` with `{ appointment_id, rating, review }`
  - On success: shows checkmark + "Review submitted! Redirecting you now…" → navigates to `/my-appointments` after 1.8 seconds

#### For Doctors:
- `sessionEnded = true` triggers a `useEffect` that watches `sessionEnded + userRole`
- Immediately calls `navigate('/doctor/appointments', { replace: true })`
- No overlay, no review form — instant redirect

---

### Phase 7 — Server-Side Auto-Complete (Background)

Regardless of what happens on the frontend, the server ensures the appointment is properly closed.

**`scheduleAutoComplete(appointmentId, doctorId, msUntilEnd)`** in `BackEnd/utils/autoCancel.js`:

```
1. Check if appointmentId already exists in _autoCompleteTimers Map
   → If yes: return immediately (idempotent — safe for multiple join calls)
   → If no: register a new setTimeout

2. When setTimeout fires (at slot end time):
   a. Remove appointmentId from the Map
   b. Fetch the appointment from MongoDB
   c. If status is still 'ongoing':
      - Set status → 'completed'
      - Save appointment
      - Call incrementDoctorCompletedCount(doctorId)
         → MongoDB $inc on doctor.completed_appointments
   d. Fetch the linked schedule document
   e. If schedule status is still 'ongoing':
      - Set status → 'completed'
      - Save schedule
```

This runs entirely on the Node.js server. Even if both participants close their browsers before the slot ends, the appointment will still be marked completed at the correct time.

---

## Error States

| Scenario | What the user sees |
|----------|--------------------|
| Invalid roomId (no matching appointment) | "Cannot Join Meeting" — "Invalid Meeting ID" |
| Appointment already completed or cancelled | "Cannot Join Meeting" — "This meeting has already ended." |
| Joining on wrong day | "Cannot Join Meeting" — "This meeting is scheduled for [date], not today." |
| Joining more than 5 minutes early | "Cannot Join Meeting" — "Meeting has not started yet. Starts at [time]." |
| Slot time has already passed | "Cannot Join Meeting" — "This meeting has ended." |
| Not logged in (no cookie) | 401 → "Login required" |
| Network error | "Cannot Join Meeting" — "Connection failed" |

All error states show a red icon, the error message, and a "Go Back" button.

---

## Sequence Diagram (Text)

```
Patient books appointment
        │
        ▼
Backend calls VideoSDK REST API → creates roomId
        │
        ▼
roomId saved as meeting_id on Appointment document
        │
        ▼
Appointment day arrives
        │
        ├─── Patient navigates to /room/:roomId
        │         │
        │         ▼
        │    AnyUser_Check middleware verifies cookie → userRole = 'patient'
        │         │
        │         ▼
        │    Validate_And_Join_Meeting:
        │      - checks date, time window, status
        │      - sets appointment → 'ongoing'
        │      - calls scheduleAutoComplete (registers server timer)
        │      - returns token + remainingTime
        │         │
        │         ▼
        │    Frontend loads VideoSDK CDN script
        │    Frontend starts countdown from remainingTime
        │    VideoSDK.init() → full-page video UI renders
        │
        ├─── Doctor navigates to /room/:roomId
        │         │
        │         ▼
        │    Same validation flow (userRole = 'doctor')
        │    scheduleAutoComplete called again → Map check ignores duplicate
        │    VideoSDK.init() → joins same room
        │
        │    [CALL IN PROGRESS]
        │
        ├─── Time runs out (countdown = 0)
        │         │
        │         ├── Frontend: endSession() → sessionEnded = true
        │         │     Patient: EndOverlay shown → ReviewForm
        │         │     Doctor: navigate('/doctor/appointments')
        │         │
        │         └── Server: scheduleAutoComplete fires
        │               appointment → 'completed'
        │               schedule → 'completed'
        │               doctor.completed_appointments += 1
        │
        └─── User clicks Leave (VideoSDK button)
                  │
                  ▼
             onMeetingLeft callback → endSession()
             Same post-session flow as above
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `BackEnd/utils/videoSDK.js` | VideoSDK credentials + `generateToken()` function |
| `BackEnd/utils/autoCancel.js` | `scheduleAutoComplete()` — server-side timer registry, `incrementDoctorCompletedCount()` |
| `BackEnd/Controlers/Appoitment.controller.js` | `Book_Appointment` (creates room), `Validate_And_Join_Meeting` (validates + issues token) |
| `BackEnd/MiddleWare/AnyUser.middleware.js` | Identifies caller as doctor or patient from JWT cookie |
| `BackEnd/Routes/Appoitment.route.js` | `GET /join-meeting/:roomId` route registration |
| `FrontEnd/src/pages/VideoCall.jsx` | Full frontend: script loading, validation call, countdown, SDK init, end overlay, review form |
