# MediCare AI — Full Project Context

## Architecture

```
MediCare AI
├── FrontEnd/   React 19 + Vite + TailwindCSS     port 5173
├── BackEnd/    Node.js + Express 5 + MongoDB      port 4000
└── AI/         Python FastAPI + LangChain RAG     port 8000
```

Start commands:
- BackEnd:  `cd BackEnd && nodemon index.js`
- AI:       `cd AI && uvicorn API.main:app --reload`
- FrontEnd: `cd FrontEnd && npm run dev`

---

## Known Codebase Typos — DO NOT RENAME

| In code | Correct |
|---------|---------|
| `Appoitment` | Appointment |
| `Sechdule` | Schedule |
| `Dooctor.model.js` | Doctor.model.js |
| `Rewiew.model.js` | Review.model.js |
| `Controlers/` | Controllers/ |

---

## Auth System

Two separate JWT flows, both use httpOnly cookie named `token`.

| Role | Secret | Middleware | Sets on req |
|------|--------|------------|-------------|
| Doctor | `SecretKey` | `Doctor.middleware.js` | `req.doctorId` |
| Patient | `P_SecretKey` | `Patient.middleware.js` | `req.PatientId` |
| Either | both | `AnyUser.middleware.js` | `req.userRole` + `req.doctorId` or `req.PatientId` |

---

## Database: MongoDB — `MediCare`

### Collections

**Patient** — `Patient.model.js`
- `first_Name`, `last_Name`, `email`, `password` (bcrypt), `age`, `gender`

**Doctor** — `Dooctor.model.js`
- `first_Name`, `last_Name`, `email`, `password`, `speciality`, `degrees[]`, `profile_Picture`, `completed_appointments`

**Schedule** — `sechdule.model.js`
- `doctor` (ref), `startTime` (HH:mm), `endTime` (HH:mm), `date` (Date), `clinic_fee`, `slotDuration`, `status`: available/booked/ongoing/completed/cancelled

**Appointment** — `Appoitment.model.js`
- `patient_id`, `doctor_id`, `sechdule_Id`, `status`: booked/ongoing/completed/cancelled
- `meeting_id` (VideoSDK roomId)
- `is_rescheduled_token` (bool), `rescheduled_from` (ref)
- `meeting_note_id` (ref MeetingNote) ← added for AI notes feature

**Chat** — `Chat.model.js`
- `patient_Id`, `messages[]`: `{ sender: 'patient'|'ai', text, sources[], timestamp }`

**Review** — `Rewiew.model.js`
- `doctor_id`, `patient_id`, `appointment_id` (unique), `rating` (1-5), `review`

**MeetingNote** — `MeetingNote.model.js` ← NEW
- `appointment_id` (unique), `status`: processing/complete/failed
- `recording_url`, `audio_path`, `transcript`, `summary`, `pdf_path`, `error_message`, `created_at`

---

## API Endpoints

### Doctor
- `POST /D_SignUp` — register (multipart with profile_Picture)
- `POST /D_Login` — login, sets cookie
- `GET /View_Doctor` — list all doctors (public)
- `GET /Doctor_Logout` — clear cookie

### Patient
- `POST /P_SignUp` — register
- `POST /P_Login` — login, sets cookie
- `GET /logout` — clear cookie

### Schedule (Doctor auth)
- `POST /Add_Sechdule`
- `GET /Show_Doctor_Sechdule`
- `GET /Show_Doctor_Sechdule/:date`
- `DELETE /Delete_Sechdule/:id`
- `GET /Show_Sechdule_Status/:status`

### Appointments
- `GET /Show_Appoitment_Sechdule/:doctorId` — available slots (public)
- `POST /Book_Appointment/:scheduleId` — Patient auth
- `GET /My_Appointments` — Patient auth — returns booked/ongoing/completed/cancelled-with-token
- `GET /Doctor_Appointments` — Doctor auth
- `GET /get-video-token` — public
- `GET /join-meeting/:roomId` — AnyUser auth — validates time window, returns token + remainingTime
- `POST /Reschedule_Appointment/:appointmentId` — Doctor auth
- `POST /Redeem_Reschedule/:appointmentId/:scheduleId` — Patient auth
- `POST /end-meeting/:appointmentId` — AnyUser auth ← NEW — called when meeting ends early

### Chat (Patient auth)
- `POST /startNewChat`
- `POST /SendMessage`

### Reviews
- `POST /review` — Patient auth
- `GET /review/check/:appointmentId` — Patient auth
- `GET /review/doctor/:doctorId` — public
- `GET /doctor/profile/:doctorId` — public

### Meeting Notes (Patient auth) ← NEW
- `GET /appointments/:appointmentId/notes` — check status
- `GET /notes/:noteId/download` — stream PDF

### Webhook (no auth) ← NEW
- `POST /webhook/videosdk` — VideoSDK calls this when recording is ready

### AI Service (port 8000)
- `POST /chat` — RAG chat
- `DELETE /chat/:session_id` — clear history
- `POST /transcribe` — multipart audio → transcript ← NEW
- `POST /summarize` — transcript → summary ← NEW

---

## Video Call Flow (Full)

1. Patient/Doctor hits `/room/:roomId`
2. Frontend calls `GET /join-meeting/:roomId`
3. Backend validates: appointment exists, correct day, within time window (5-min early buffer)
4. **First join** (status = booked → ongoing):
   - Marks appointment + schedule as `ongoing`
   - Calls `startRoomRecording(meeting_id, appointment._id)` — fire-and-forget
   - Registers `scheduleAutoComplete` timer (idempotent, only one per appointment)
5. Returns: `{ token, participantName, doctorName, patientName, userRole, appointmentId, remainingTime }`
6. Frontend starts countdown from `remainingTime`
7. VideoSDK SDK initializes with `onMeetingLeft: endSession`

### Meeting End — Two Paths

**Path A: Timer hits 0 (scheduled end)**
- Frontend `timeLeft` reaches 0
- `endSession()` fires → calls `POST /end-meeting/:appointmentId`
- Backend: marks completed, cancels timer, stops recording
- `scheduleAutoComplete` also fires at same time — checks `apt.status === 'ongoing'` before acting (idempotent)

**Path B: User clicks Leave early**
- VideoSDK fires `onMeetingLeft` → `endSession()` fires
- Same flow as Path A

**Backend `scheduleAutoComplete` (safety net):**
- Fires at slot end time regardless
- Checks `apt.status === 'ongoing'` — if already completed by Path A/B, does nothing
- Stops recording (404 is silently ignored if already stopped)

---

## AI Meeting Notes Flow (NEW)

Full end-to-end after meeting ends:

1. `stopRoomRecording` called → VideoSDK stops recording
2. VideoSDK processes recording (1-3 min)
3. VideoSDK POSTs to `POST /webhook/videosdk` with `{ event: 'session.recording.ready', data: { meetingId, fileUrl } }`
4. Backend responds 200 immediately, then async:
   - Creates `MeetingNote` (status: processing) — unique index blocks duplicates
   - Links `appointment.meeting_note_id = note._id`
   - Downloads MP4 from `fileUrl`
   - Calls `POST http://127.0.0.1:8000/transcribe` (multipart/form-data)
   - Calls `POST http://127.0.0.1:8000/summarize` (JSON)
   - Generates PDF via `pdfkit` → saves to `BackEnd/uploads/notes/`
   - Deletes audio file (in `finally` block)
   - Sets `note.status = 'complete'`
5. Patient polls `GET /appointments/:id/notes` → gets `{ status, download_url }`
6. Patient downloads PDF via `GET /notes/:noteId/download`

### Edge Cases Handled
- Transcript < 50 words → default "no-show" message, still generates PDF
- Duplicate webhooks → E11000 unique index blocks second create
- Server restart mid-processing → 1-hour timeout marks note as failed
- Recording 404 on stop → silently ignored (no active recording)
- Audio file always deleted in `finally` block

---

## Key Files

### BackEnd
```
index.js                          — Express app, route registration
Models/
  Appoitment.model.js             — has meeting_note_id field
  MeetingNote.model.js            — NEW: notes schema
Controlers/
  Appoitment.controller.js        — includes End_Meeting_Early
  Notes.controller.js             — NEW: getNoteStatus, downloadPDF
  Webhook.controller.js           — NEW: handleVideoSDKWebhook
Routes/
  Appoitment.route.js             — includes /end-meeting route
  Notes.route.js                  — NEW
  Webhook.route.js                — NEW (registered BEFORE express.json())
utils/
  autoCancel.js                   — scheduleAutoComplete, cancelAutoComplete
  recordingSDK.js                 — startRoomRecording, stopRoomRecording
  notesProcessor.js               — NEW: full pipeline
  generateNotesPDF.js             — NEW: pdfkit PDF generation
  videoSDK.js                     — generateToken()
```

### AI Service
```
API/
  main.py                         — /chat, /transcribe, /summarize endpoints
  schemas.py                      — ChatRequest/Response, TranscribeResponse, SummarizeRequest/Response
  rag_engine.py                   — DO NOT MODIFY
  notes_engine.py                 — NEW: transcribe_audio, summarize_transcript
```

### FrontEnd
```
src/pages/
  VideoCall.jsx                   — uses meetingDataRef to avoid stale closures
  MyAppointments.jsx              — shows completed appointments + notes download
```

---

## Environment Variables

### BackEnd/.env
```
DB_URL=mongodb://localhost:27017/MediCare
PORT=4000
SecretKey=MediCare
P_SecretKey=Patient
ExpireIn=6h
WEBHOOK_BASE_URL=https://<ngrok-url>.ngrok-free.app   ← must be public for VideoSDK
```

### AI/.env
```
GROQ_API_KEY=<your_groq_key>
```

---

## VideoSDK Credentials (BackEnd/utils/videoSDK.js)
```
API_KEY:    459d9d71-647a-4c6e-a2c2-b50e0a856c9f
SECRET_KEY: 5144cb66d6122755f853ec9338177530758ab24fff2a9523e42910e0c22f62ec
```

---

## Dependencies

### BackEnd (npm)
- express 5, mongoose 9, bcrypt, jsonwebtoken, multer, axios, moment, cookie-parser, cors, pdfkit ← NEW, form-data

### AI (uv/pip)
- fastapi, langchain 0.3, langchain-groq, langchain-huggingface, faiss-cpu, sentence-transformers, pypdf, python-dotenv, faster-whisper==1.0.3 ← NEW

---

## Critical Bugs Fixed (this session)

1. **Stale closure in `endSession`** — `meetingDataRef` pattern used so callbacks always read latest data
2. **`endSession` called with null meetingData** — ref guard `sessionEndedRef` prevents double-fire
3. **Recording stop 404** — `stopRoomRecording` now silently ignores 400 and 404 (no active recording)
4. **Completed appointments not shown** — `My_Appointments` now includes `status: 'completed'`
5. **Empty appointments returns 404** — changed to `200 { status: 1, data: [] }`
6. **Syntax error in recordingSDK.js** — extra `}` removed
7. **`cancelAutoComplete` not exported** — added to module.exports
8. **ROOT CAUSE — Webhook body always undefined** — `WebhookRoutes` was registered BEFORE `express.json()` in `index.js`, so `req.body` was always `{}`. Fixed by moving all body parsers (`express.json`, `express.urlencoded`, `cookieParser`) BEFORE all route registrations.
9. **VideoSDK DOM bleeds onto next page** — VideoSDK `containerId:null` injects into `document.body` and never cleans up. Fixed by hiding all `[id^="videosdk"]` elements in `endSession` and fully removing + deleting `window.VideoSDKMeeting` in `handleNavigateAway`.
10. **Empty transcript crashes pipeline** — removed `ValueError` on empty transcript; `notesProcessor.js` short-transcript guard handles it gracefully.
11. **Recording start 403 Forbidden** — `generateToken()` only has `["allow_join","allow_mod"]` permissions. VideoSDK recording REST API requires `"allow_stream"`. Added `generateServerToken()` in `videoSDK.js` with all three permissions. `recordingSDK.js` now uses `generateServerToken()` for both start and stop calls.
12. **WEBHOOK_BASE_URL=localhost** — VideoSDK's servers cannot reach localhost. Added a clear warning log when localhost is detected. Must use ngrok for local dev.

## Checkpoint Logging Added

Every step of the pipeline now logs a numbered checkpoint:
- `[CHECKPOINT A]` — Recording start (join-meeting controller)
- `[CHECKPOINT 1]` — Webhook received (raw body logged)
- `[CHECKPOINT 2]` — Event/data parsed
- `[CHECKPOINT 3]` — Appointment lookup
- `[CHECKPOINT 4]` — MeetingNote created
- `[CHECKPOINT 5]` — Download pipeline started
- `[CHECKPOINT 6]` — Audio download complete
- `[CHECKPOINT 7]` — Hand-off to processor
- `[CHECKPOINT 8]` — Audio file validated
- `[CHECKPOINT 9]` — Transcription complete (preview logged)
- `[CHECKPOINT 10]` — Summary complete (preview logged)
- `[CHECKPOINT 11]` — PDF generated
- `[CHECKPOINT 12]` — Audio file deleted

---

## Local Dev ngrok Setup

VideoSDK webhooks require a public URL. For local dev:
```bash
ngrok http 4000
# Copy HTTPS URL → set WEBHOOK_BASE_URL in BackEnd/.env
# Restart backend after changing .env
```

---

## Upload Directories
```
BackEnd/uploads/audio/    ← temp MP4 files (deleted after processing)
BackEnd/uploads/notes/    ← permanent PDFs
AI/models/                ← faster-whisper model cache (gitignored)
```

---

## Frontend Routes
```
/                         Home (public)
/login                    Doctor login
/doctor/signup            Doctor register
/patient/signup           Patient register
/patient/login            Patient login
/doctor-dashboard         [Doctor]
/doctor/schedule/create   [Doctor]
/doctor/schedule          [Doctor]
/doctor/appointments      [Doctor]
/patient/dashboard        [Patient]
/doctors                  [Patient]
/book-appointment/:id     [Patient]
/my-appointments          [Patient] ← shows completed + notes download
/ai-chat                  [Patient]
/room/:roomId             Video call (validated server-side)
```
