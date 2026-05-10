# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MediCare AI** is a telemedicine platform with three services:
- **Frontend** — React 19 + Vite + TailwindCSS v4 (port 5173)
- **Backend** — Express 5 + Mongoose + MongoDB (port 4000)
- **AI Service** — FastAPI + LangChain RAG + Groq LLM (port 8000)

## Commands

### Frontend
```bash
cd FrontEnd
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
```

### Backend
```bash
cd BackEnd
npm install
node index.js      # Start server
```

### Tests (Backend)
```bash
cd BackEnd
npm test           # Run all Jest tests
```
Test files live in `tests/` at the repo root — unit, integration, boundary value, equivalence partitioning, stress, and performance tests using Jest.

### AI Service
```bash
cd AI
# One-time: build FAISS vector store from PDFs in data/
python create_memory_for_llm.py

uv run uvicorn API.main:app --reload   # Start API server
streamlit run medibot.py               # Standalone chat UI (dev/testing)
```

## Environment Variables

### Backend (`.env`)
| Var | Purpose |
|---|---|
| `SecretKey` | JWT secret for doctor tokens |
| `P_SecretKey` | JWT secret for patient tokens |
| `ADMIN_JWT_SECRET` | JWT secret for admin tokens |
| `ExpireIn` | JWT expiry (e.g. `7d`) |
| `VIDEOSDK_API_KEY` | VideoSDK API key |
| `VIDEOSDK_SECRET_KEY` | VideoSDK secret for JWT generation |
| `WEBHOOK_BASE_URL` | Public URL for VideoSDK webhooks; if localhost, polling fallback is used for notes |
| `NODE_ENV` | Affects cookie `secure` flag |
| `DB_URL` | MongoDB connection string (local dev) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login credentials |

### AI Service
| Var | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq LLM API key |
| `HF_TOKEN` | HuggingFace token for sentence-transformer embeddings |

> Note: the `.env.example` is missing several of these vars — refer to this table when setting up.

## Architecture

### Auth Flow
Three separate JWT flows using httpOnly cookies:
- **Doctors:** `SecretKey` → `doctorToken` cookie
- **Patients:** `P_SecretKey` → `patientToken` cookie
- **Admin:** `ADMIN_JWT_SECRET` → `adminToken` cookie

Middleware in `BackEnd/MiddleWare/`: `Doctor.middleware.js`, `Patient.middleware.js`, `AnyUser.middleware.js`, `Admin.middleware.js`. Verified tokens attach `req.DoctorId` / `req.PatientId` / `req.userRole` respectively.

Auth routes are rate-limited: 10 attempts per 15 minutes via `express-rate-limit`.

### Doctor Approval Flow
New doctors register with `isApproved: null` (pending). Admin reviews and approves/rejects via `Admin.route.js`. Approved doctors have `isApproved: true`.

### Appointment Status Lifecycle
`Booked` → `Ongoing` (participant joins) → `Completed` (auto at slot end or manual end)
or `Booked` → `Cancelled`

Rescheduling: sets `is_rescheduled_token: true` on cancelled appointment and creates a new one linked via `rescheduled_from`.

### Backend Route Files
All in `BackEnd/Routes/`:
- `Doctor.route.js` — auth, profile, schedules
- `Patient.route.js` — auth, profile
- `Appoitment.route.js` — book, cancel, join/end meeting
- `Sechdule.Route.js` — create/view/delete slots
- `Chat.route.js` — AI symptom chat proxy
- `Notes.route.js` — status, PDF download, audio upload
- `Notification.route.js`, `Prescription.route.js`, `Review.route.js`
- `Webhook.route.js` — VideoSDK recording webhook (no auth)
- `Admin.route.js` — admin login, verify, stats

> Intentional typos in folder/file names (`Controlers/`, `Appoitment`, `Sechdule`) must not be "fixed" — they would break imports.

### Data Flow

1. **Appointment booking:** Patient books → Backend calls VideoSDK REST API to create room → stores `meeting_id` in Appointment document
2. **AI symptom chat:** Frontend → Backend proxy (`/chat`) → FastAPI `/chat` → LangChain RAG (FAISS + Groq llama-3.1-8b-instant) → response with source citations. Session history kept in memory (last 10 messages, 24-hour TTL, cleanup every ~50 requests). Rate limited: 20 req/session/minute.
3. **Post-call notes pipeline:** VideoSDK webhook `session.recording.ready` (or polling fallback after 90s if `WEBHOOK_BASE_URL` is localhost) → Backend downloads recording → AI Service transcribes (faster-whisper) → summarizes (Groq) → PDF generated (pdfkit) → saved as `MeetingNote`. Audio deleted after PDF generation. Transcripts under 50 words get a default summary. Processing stuck >1 hour is marked failed.
4. **Auto-cancel:** `BackEnd/utils/autoCancel.js` runs on a timer to cancel stale appointments/schedules.

### Backend Utilities (`BackEnd/utils/`)
- `videoSDK.js` — JWT generation (participant vs server tokens with different permission scopes)
- `recordingSDK.js` — VideoSDK cloud recording start/stop with 5-retry logic for "No active session" 403
- `notesProcessor.js` — orchestrates transcribe → summarize → PDF pipeline
- `generateNotesPDF.js` — pdfkit-based PDF generation; PDFs stored in `backend/uploads/`
- `autoCancel.js` — appointment/schedule auto-cancel timer

### MongoDB Collections
`Patient`, `Doctor`, `Schedule`, `Appointment`, `Chat`, `Review`, `MeetingNote`, `Notification` — all in database `MediCare`.

Key model details:
- **Doctor:** `isApproved` null=pending, true=approved. Specialties are a hardcoded enum: Cardiologist, Dermatologist, Neurologist, Pediatrician, General Surgeon, Psychiatrist, Orthopedic.
- **Schedule:** unique index on `(doctor, date, startTime)` to prevent duplicate slots.
- **Appointment:** `rescheduled_from` links to original cancelled appointment.
- **Notification:** types are `appointment_booked`, `appointment_cancelled`, `appointment_rescheduled`, `prescription_ready`.

### AI RAG Pipeline
- Source documents: 5 medical PDFs in `AI/data/`
- FAISS vector index persisted at `AI/vectorstore/db_faiss/` (rebuild with `create_memory_for_llm.py` if PDFs change)
- Embeddings: HuggingFace sentence-transformers (local)
- LLM: Groq `llama-3.1-8b-instant` via `langchain-groq`
- Session history maintained per `session_id` in `API/main.py`

AI Service endpoints:
- `POST /chat` — RAG query with session history
- `POST /transcribe` — audio transcription (faster-whisper)
- `POST /summarize` — transcript summarization
- `DELETE /chat/{session_id}` — clear session history

### Frontend
`FrontEnd/src/App.jsx` defines all routes with protected route wrappers. `useAuth.js` hook handles cookie-based auth state.

Doctor pages: `DoctorDashboard`, `DoctorAppointments`, `MySchedule`, `ScheduleGenerator`, `DoctorEditProfile`, `VideoCall`
Patient pages: `PatientDashboard`, `FindDoctors`, `BookAppointment`, `MyAppointments`, `AIChat`, `PatientEditProfile`
Shared: `VideoCall` at `room/:roomId`

### Video Calls
VideoSDK SDK is an npm dependency (`@videosdk.live/rtc-js-prebuilt`). Backend generates token + `meeting_id` at booking. Join validation happens in Backend before Frontend redirects to `VideoCall.jsx`. See `videocall.md` for the full flow.

### Other Implementation Details
- Passwords hashed with bcrypt (salt=10) on model pre-save hook; skipped if password field not modified
- File uploads via Multer to `public/pictures` and `public/degrees`, named by document ID
- moment.js used for UTC date normalization to prevent timezone shift bugs in schedule queries
- Docker Compose maps service names (`mongodb`, `ai-service`) as internal hostnames; uses named volumes for `mongo_data`, `ai_vectorstore`, etc.
