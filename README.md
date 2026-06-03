# MediCare AI

A full-stack telemedicine platform where patients can check symptoms with an AI assistant, find doctors, book appointments, and attend video consultations. Doctors manage their schedules and appointments through a dedicated portal.

---

## Architecture

```
MediCare AI
├── FrontEnd/   → React 19 + Vite + TailwindCSS        (port 5173)
├── BackEnd/    → Node.js + Express 5 + MongoDB         (port 4000)
└── AI/         → Python FastAPI + LangChain RAG        (port 8000)
```

The three services communicate as follows:

- **FrontEnd → BackEnd:** All REST API calls go to `http://localhost:4000`
- **BackEnd → AI:** When a patient sends a chat message, the backend proxies it to `http://127.0.0.1:8000/chat`
- **BackEnd → VideoSDK:** When a patient books an appointment, the backend calls the VideoSDK REST API to create a video room

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Axios, TailwindCSS v4, Vite |
| Backend | Node.js, Express 5, Mongoose 9, bcrypt, jsonwebtoken, multer, moment, cookie-parser, cors |
| Database | MongoDB (local) — database name: `MediCare` |
| AI Service | Python, FastAPI, LangChain 0.3, langchain-groq, langchain-huggingface, FAISS-cpu, sentence-transformers, PyPDF |
| Video Calls | VideoSDK.live Prebuilt SDK (CDN) + VideoSDK REST API |
| Auth | JWT stored in httpOnly cookies |

---

## Project Structure

```
/
├── FrontEnd/
│   └── src/
│       ├── pages/          All page components
│       ├── hooks/          useAuth.js — cookie-based auth verification
│       └── App.jsx         Route definitions + protected route wrappers
│
├── BackEnd/
│   ├── Models/             Mongoose schemas
│   ├── Controlers/         Route handler functions
│   ├── Routes/             Express routers
│   ├── MiddleWare/         JWT auth middleware (Doctor, Patient, AnyUser)
│   ├── utils/
│   │   ├── autoCancel.js   Stale appointment/schedule cleanup + auto-complete timer
│   │   └── videoSDK.js     VideoSDK token generation
│   └── index.js            Express app entry point
│
└── AI/
    ├── API/
    │   ├── main.py         FastAPI app + /chat endpoint
    │   ├── rag_engine.py   LangChain RAG chain setup
    │   └── schemas.py      Pydantic request/response models
    ├── data/               Medical PDF source documents
    ├── vectorstore/        FAISS index (pre-built from PDFs)
    ├── create_memory_for_llm.py   Builds the FAISS vector store
    └── medibot.py          Standalone Streamlit chat UI (dev/testing)
```

---

## Database Collections

### Patient
```
first_Name, last_Name, email (unique), password (bcrypt), age, gender (Male/Female/Other)
```

### Doctor
```
first_Name, last_Name, ph, email (unique), password (bcrypt),
speciality, degrees[], profile_Picture, completed_appointments (counter)
```
Profile pictures are stored at `BackEnd/public/pictures/` and served at `/pictures/:filename`.

### Schedule
```
doctor (ref), startTime ("HH:mm"), endTime ("HH:mm"), date (Date),
clinic_fee, slotDuration (minutes),
status: available | booked | ongoing | completed | cancelled
```
Unique compound index on `{ doctor, date, startTime }` — prevents duplicate slots.

### Appointment
```
patient_id (ref), doctor_id (ref), sechdule_Id (ref),
status: booked | ongoing | completed | cancelled,
meeting_id (VideoSDK roomId),
is_rescheduled_token (boolean),
rescheduled_from (ref Appointment)
```

### Chat
```
patient_Id (ref),
messages[]: { sender: 'patient'|'ai', text, sources[], timestamp }
```
One document per chat session. Messages are pushed into the array.

### Review
```
doctor_id (ref), patient_id (ref), appointment_id (ref, unique),
rating (1–5), review (text, max 1000 chars)
```

---

## Authentication

Two completely separate JWT auth flows, both using an httpOnly cookie named `token`.

| Role | Secret Env Var | Middleware | Sets on req |
|------|---------------|------------|-------------|
| Doctor | `SecretKey` | `Doctor.middleware.js` | `req.doctorId` |
| Patient | `P_SecretKey` | `Patient.middleware.js` | `req.PatientId` |

The video call route uses `AnyUser.middleware.js` which tries both secrets and sets `req.userRole` to `'doctor'` or `'patient'`.

On login, the backend sets the httpOnly cookie. The frontend also stores minimal data in `localStorage` (name, speciality) purely for route guard checks — not for auth.

Token expiry: **6 hours**. No refresh token mechanism — users must re-login after expiry.

---

## Environment Variables

### BackEnd/.env
```env
DB_URL=mongodb://localhost:27017/MediCare
PORT=4000
SecretKey=MediCare
P_SecretKey=Patient
ExpireIn=6h
```

### AI/.env
```env
GROQ_API_KEY=<your_groq_api_key>
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017
- Python 3.9+ with `uv` or `pip`

---

### 1. Backend

```bash
cd BackEnd
npm install
node index.js
```

Server starts on `http://localhost:4000`. Connects to MongoDB at `mongodb://localhost:27017/MediCare`.

---

### 2. Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

App starts on `http://localhost:5173`.

---

### 3. AI Service

**First time only — build the FAISS vector store from the medical PDFs:**

```bash
cd AI
python create_memory_for_llm.py
```

This loads PDFs from `AI/data/`, splits them into chunks, embeds them using `sentence-transformers/all-MiniLM-L6-v2`, and saves the FAISS index to `AI/vectorstore/db_faiss/`.

**Start the API server:**

```bash
cd AI
uv run uvicorn API.main:app --reload
# or without uv:
uvicorn API.main:app --reload
```

AI service starts on `http://localhost:8000`.

---

## Complete User Flows

### Doctor Flow

#### 1. Registration
- Doctor visits `/doctor/signup`
- Fills in: first name, last name, email, phone, speciality, qualifications (tag input), password, profile picture
- On submit: `POST /D_SignUp` (multipart/form-data) — profile picture saved to `BackEnd/public/pictures/`, JWT cookie set, redirected to `/doctor-dashboard`

#### 2. Login
- Doctor visits `/login`
- Fills in email + password
- On submit: `POST /D_Login` — JWT cookie set, redirected to `/doctor-dashboard`

#### 3. Dashboard
- Shows three action cards: Appointments, Create Schedule, My Schedule
- Logout button clears the cookie and redirects to `/login`

#### 4. Creating a Schedule
- Doctor visits `/doctor/schedule/create`
- Configures: start time, end time, slot duration (15/30/45/60 min), consultation fee
- Selects specific calendar dates using the inline date picker (past dates disabled)
- Clicks **Generate Slots** — frontend calculates time slots from start to end based on duration
- Preview panel shows all generated slots; individual slots can be removed by clicking them
- Clicks **Confirm & Save Schedule** → `POST /Add_Sechdule`
  - Backend rejects past dates (400)
  - Backend rejects duplicate date×startTime combinations (409)
  - On success: one Schedule document created per date×slot combination

#### 5. Viewing Schedule
- Doctor visits `/doctor/schedule`
- Left sidebar shows dates; clicking a date shows all slots for that day
- Each slot shows: time range, fee, duration, status badge (available/booked/ongoing/completed/cancelled)
- Available slots have a delete button → `DELETE /Delete_Sechdule/:id`

#### 6. Managing Appointments
- Doctor visits `/doctor/appointments`
- Shows all active (booked/ongoing) appointments with patient name, date, time
- **Join Call:** shown when current time is within the slot window → navigates to `/room/:meetingId`
- **Reschedule:** amber button on booked appointments → opens confirmation modal
  - On confirm: `POST /Reschedule_Appointment/:appointmentId`
  - Appointment marked `cancelled`, `is_rescheduled_token: true`
  - Patient receives a free rebook token
  - Original schedule slot stays locked (not available to others)

---

### Patient Flow

#### 1. Registration
- Patient visits `/patient/signup`
- Fills in: first name, last name, email, age, gender, password
- On submit: `POST /P_SignUp` — redirected to `/patient/login`

#### 2. Login
- Patient visits `/patient/login`
- Fills in email + password
- On submit: `POST /P_Login` — JWT cookie set, redirected to `/patient/dashboard`

#### 3. Dashboard
- Shows two feature cards: AI Symptom Checker and Find a Specialist
- Left sidebar navigation: Dashboard, My Appointments, Find Doctor, AI Symptom Chat
- Logout clears cookie and redirects to `/patient/login`

#### 4. Finding a Doctor
- Patient visits `/doctors`
- `GET /View_Doctor` fetches all doctors
- Search bar filters by name or speciality in real time
- Each doctor card shows: photo, name, speciality, degrees
- Clicking **Book Appointment** navigates to `/book-appointment/:doctorId`

#### 5. Booking an Appointment
- Page calls `GET /Show_Appoitment_Sechdule/:doctorId` — returns available slots grouped by date
- Left panel shows doctor info + stats (completed appointments, avg rating, total reviews) + last 5 patient reviews
- Right panel shows accordion date list; expanding a date shows time slot buttons
- Patient selects a slot → confirmation modal shows doctor, date, time, fee
- On confirm: `POST /Book_Appointment/:scheduleId`
  - Backend checks for time conflicts with existing appointments on the same day
  - Backend calls VideoSDK REST API to create a video room → gets `roomId`
  - Appointment saved with `meeting_id = roomId`, schedule marked `booked`
  - Patient redirected to `/my-appointments`

#### 6. My Appointments
- `GET /My_Appointments` returns active appointments (booked/ongoing) + cancelled appointments with rebook tokens
- Each card shows: doctor name, speciality, date, time, status
- **Join Call:** shown when within the slot time window → `/room/:meetingId`
- **Leave a Review:** shown for completed appointments not yet reviewed
- **Rebook Free:** shown for cancelled appointments with `is_rescheduled_token: true`
  - Opens slot picker modal showing the same doctor's available slots
  - Patient picks a new slot → `POST /Redeem_Reschedule/:appointmentId/:scheduleId`
  - New appointment created at no charge, original locked slot freed back to available, token consumed

#### 7. AI Symptom Chat
- Patient visits `/ai-chat`
- `POST /startNewChat` creates a new chat session → returns `sessionId`
- Patient types symptoms in the input bar
- Each message: `POST /SendMessage` with `{ question, session_id }`
  - Backend proxies to FastAPI at `http://127.0.0.1:8000/chat`
  - FastAPI runs the RAG pipeline: retrieves relevant passages from FAISS → Groq LLaMA 3.1 8B generates a structured medical response
  - Response saved to the Chat document, returned to frontend
- AI responses rendered as formatted markdown with sections: Understanding Symptoms, Possible Conditions, Treatment Approaches, Medications, Precautions, When to Seek Care, Next Steps
- Medical source references shown below each AI response

---

### Video Call Flow

#### Joining
1. Patient or doctor navigates to `/room/:roomId`
2. Frontend calls `GET /join-meeting/:roomId` (with auth cookie)
3. `AnyUser_Check` middleware identifies the caller as doctor or patient
4. Backend validates:
   - Room exists (appointment with this `meeting_id`)
   - Appointment not already completed or cancelled
   - Correct calendar day
   - Current time is within the slot window (5-minute early buffer allowed)
5. On first join: appointment and schedule both set to `ongoing`
6. Backend registers a server-side auto-complete timer (`scheduleAutoComplete`) — idempotent, only one timer per appointment regardless of how many times join is called
7. Backend returns: VideoSDK JWT token, participant name, doctor/patient names, user role, appointment ID, `remainingTime` (seconds until slot end)

#### During the Call
- VideoSDK Prebuilt SDK renders the full-page video UI (camera feeds, mic/camera controls, chat, screen share, leave button)
- A floating countdown timer pill (top-left corner) shows remaining time
- Timer turns red and pulses when under 2 minutes

#### Session End
The session ends in one of three ways:
- **Countdown reaches zero** — frontend `timeLeft` hits 0, `endSession()` called
- **User clicks Leave** inside VideoSDK UI — `onMeetingLeft` callback fires `endSession()`
- **Server timer fires** — `scheduleAutoComplete` setTimeout fires at slot end time

**For patients:** Full-screen end overlay appears with a review form (5-star rating + optional text). After submit or skip → navigated to `/my-appointments`.

**For doctors:** Immediately redirected to `/doctor/appointments` — no review form.

**Server-side (regardless of frontend):** At slot end time, the server marks appointment → `completed`, schedule → `completed`, and increments `doctor.completed_appointments` by 1.

---

## API Reference

### Doctor
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/D_SignUp` | — | Register (multipart/form-data with profile_Picture) |
| POST | `/D_Login` | — | Login, sets httpOnly cookie |
| GET | `/View_Doctor` | — | List all doctors (public) |
| GET | `/Doctor_Logout` | — | Clear cookie |

### Patient
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/P_SignUp` | — | Register |
| POST | `/P_Login` | — | Login, sets httpOnly cookie |
| GET | `/logout` | — | Clear cookie |

### Schedule (Doctor protected)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/Add_Sechdule` | Doctor | Bulk create slots for selected dates |
| GET | `/Show_Doctor_Sechdule` | Doctor | All upcoming slots (auto-cancels stale) |
| GET | `/Show_Doctor_Sechdule/:date` | Doctor | Slots for a specific date |
| DELETE | `/Delete_Sechdule/:id` | Doctor | Delete an available slot |
| GET | `/Show_Sechdule_Status/:status` | Doctor | Filter slots by status |

### Appointments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/Show_Appoitment_Sechdule/:doctorId` | — | Available slots for a doctor |
| POST | `/Book_Appointment/:scheduleId` | Patient | Book a slot, creates VideoSDK room |
| GET | `/My_Appointments` | Patient | Patient's active appointments |
| GET | `/Doctor_Appointments` | Doctor | Doctor's active appointments |
| GET | `/get-video-token` | — | Get a VideoSDK JWT token |
| GET | `/join-meeting/:roomId` | Doctor or Patient | Validate time window, return token + remainingTime |
| POST | `/Reschedule_Appointment/:appointmentId` | Doctor | Cancel appointment, issue free rebook token to patient |
| POST | `/Redeem_Reschedule/:appointmentId/:scheduleId` | Patient | Use rebook token to book a new slot for free |

### Chat (Patient protected)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/startNewChat` | Patient | Create new chat session |
| POST | `/SendMessage` | Patient | Send message, proxied to AI service |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/review` | Patient | Submit a review for a completed appointment |
| GET | `/review/check/:appointmentId` | Patient | Check if appointment already reviewed |
| GET | `/review/doctor/:doctorId` | — | Get all reviews for a doctor |
| GET | `/doctor/profile/:doctorId` | — | Get completed count + avg rating + last 5 reviews |

---

## Frontend Routes

```
/                          → Home (public)
/login                     → Doctor login
/doctor/signup             → Doctor registration
/patient/signup            → Patient registration
/patient/login             → Patient login

/doctor-dashboard          → Doctor home          [Doctor auth]
/doctor/schedule/create    → Create schedule       [Doctor auth]
/doctor/schedule           → View/manage schedule  [Doctor auth]
/doctor/appointments       → Appointments + video  [Doctor auth]

/patient/dashboard         → Patient home          [Patient auth]
/doctors                   → Browse doctors        [Patient auth]
/book-appointment/:id      → Book a slot           [Patient auth]
/my-appointments           → My appointments       [Patient auth]
/ai-chat                   → AI symptom chat       [Patient auth]

/room/:roomId              → Video call room       [Doctor or Patient auth, validated server-side]
```

---

## AI Service Details

**Model:** Groq `llama-3.1-8b-instant`
**Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` (runs locally)
**Vector store:** FAISS, pre-built from 5 medical PDFs in `AI/data/`

**Medical PDFs included:**
- Harrison's Manual of Medicine (17th Edition)
- Hutchison's Clinical Methods
- Nelson Essentials of Pediatrics
- Robbins Pathology (7th Edition)
- The Gale Encyclopedia of Medicine (2nd Edition)

**RAG Pipeline:**
1. Patient question → history-aware retriever (uses last 10 messages for context)
2. Retriever searches FAISS index for relevant passages (top-k chunks)
3. Retrieved passages + question assembled into a structured prompt
4. Groq LLaMA generates a response in structured markdown format
5. Response + source references returned to backend → saved to Chat document → returned to frontend

**Session history:** Stored in-memory per `session_id`. Last 10 messages kept per session. Sessions are lost on server restart.

---

## Auto-Cancellation Logic

`BackEnd/utils/autoCancel.js` handles stale appointments and schedules automatically.

A slot or appointment is considered stale if:
- Its date is before today (midnight boundary), OR
- Its date is today AND its `endTime` has already passed

Stale resolution:
- `booked` → `cancelled` (patient never joined)
- `ongoing` → `completed` (meeting ran out of time, also increments doctor's completed count)

This runs on every call to `GET /My_Appointments`, `GET /Doctor_Appointments`, and `GET /Show_Doctor_Sechdule` — so the data is always fresh when the user views it.

---

## Known Codebase Typos

These typos exist throughout the codebase. Do not rename without updating all references.

| Typo in code | Correct spelling |
|-------------|-----------------|
| `Appoitment` | Appointment |
| `Sechdule` | Schedule |
| `Dooctor.model.js` | Doctor.model.js |
| `Rewiew.model.js` | Review.model.js |
| `Controlers/` | Controllers/ |

---

## Additional Documentation

- [`design.md`](./design.md) — UI design reference: every page, all fields, buttons, and displayed data (for Stitch AI or similar design tools)
- [`videocall.md`](./videocall.md) — Complete video call flow documentation: VideoSDK integration, server-side timer, join validation, post-session behavior


---

## 🆕 AI Meeting Notes Feature

After a video consultation ends, patients can download an AI-generated PDF summary of the full consultation — including both the doctor's and patient's sides of the conversation.

### How It Works

1. **Recording starts**: When the first participant joins, VideoSDK cloud recording starts automatically (server-side)
2. **Recording runs**: Both participants are recorded for the entire session duration
3. **Recording stops**: When the appointment time ends, recording stops automatically
4. **Webhook received**: VideoSDK sends a webhook when the recording file is ready (1-3 minutes after session ends)
5. **Download + transcribe**: Backend downloads the audio and sends it to the AI service for transcription using `faster-whisper`
6. **Summarize**: The transcript is summarized by Groq `llama-3.1-8b-instant` into a patient-friendly format with 5 structured sections
7. **PDF generated**: A branded PDF is created using `pdfkit`
8. **Patient downloads**: Patient sees a "View Consultation Notes" button on their My Appointments page for completed appointments

### Setup Requirements

**Backend dependencies:**
```bash
cd BackEnd
npm install pdfkit
```

**AI Service dependencies:**
```bash
cd AI
uv add faster-whisper==1.0.3
```

**Environment variables:**
Add to `BackEnd/.env`:
```env
WEBHOOK_BASE_URL=http://localhost:4000
```

**Important:** For local testing, you must use [ngrok](https://ngrok.com) to expose port 4000 publicly so VideoSDK webhooks can reach your server:
```bash
ngrok http 4000
# Then update WEBHOOK_BASE_URL in .env with the ngrok HTTPS URL
```

### New API Endpoints

**Patient endpoints:**
- `GET /appointments/:appointmentId/notes` — Check if notes are ready
- `GET /notes/:noteId/download` — Download the PDF

**Webhook endpoint (called by VideoSDK):**
- `POST /webhook/videosdk` — Receives recording-ready notification

**AI Service endpoints:**
- `POST /transcribe` — Transcribe audio file (multipart/form-data)
- `POST /summarize` — Generate patient-friendly summary

### Database Schema

**New collection: `meetingnotes`**
```javascript
{
  appointment_id: ObjectId (unique),
  status: 'processing' | 'complete' | 'failed',
  recording_url: String,
  audio_path: String,
  transcript: String,
  summary: String,
  pdf_path: String,
  error_message: String,
  created_at: Date
}
```

**Modified collection: `appoitments`**
```javascript
{
  // ... existing fields ...
  meeting_note_id: ObjectId (ref: MeetingNote)  // NEW
}
```

### Security Features

- **PHI Authorization**: Download endpoint verifies the requesting patient owns the appointment
- **Idempotency**: MongoDB unique index prevents duplicate processing from duplicate webhooks
- **Timeout Recovery**: Notes stuck in 'processing' for >1 hour are marked as failed
- **Cleanup**: Audio files are automatically deleted after PDF generation

### Testing

See [`docs/meeting-notes-testing-checklist.md`](./docs/meeting-notes-testing-checklist.md) for a complete step-by-step testing guide.

**Quick test:**
1. Start all services (Backend, AI, Frontend) + ngrok
2. Book and join a video consultation
3. Wait for appointment to end
4. Wait 2-3 minutes for processing
5. Check "My Appointments" page for "View Consultation Notes" button
6. Download the PDF

### Additional Documentation

- [`docs/meeting-notes-setup.md`](./docs/meeting-notes-setup.md) — Complete setup guide and troubleshooting
- [`docs/meeting-notes-implementation-summary.md`](./docs/meeting-notes-implementation-summary.md) — Implementation summary with all files created/modified
- [`docs/meeting-notes-testing-checklist.md`](./docs/meeting-notes-testing-checklist.md) — Step-by-step testing checklist
