# MediCare AI — Project Documentation

## Overview

MediCare AI is a full-stack intelligent telemedicine platform designed to bridge the healthcare accessibility gap in developing regions. It combines an AI-powered symptom checker, a doctor discovery and appointment booking system, and real-time video consultations into a single cohesive web application. The platform serves two primary user types — patients seeking medical guidance and doctors managing their practice digitally.

The system is built across three independent services that communicate over HTTP:

- **FrontEnd** — React 19 + Vite + TailwindCSS (port 5173)
- **BackEnd** — Node.js + Express 5 + MongoDB/Mongoose (port 4000)
- **AI** — Python FastAPI + LangChain RAG + Groq LLaMA (port 8000)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        FrontEnd                         │
│           React 19 + Vite + TailwindCSS v4              │
│                    localhost:5173                        │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (axios)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                        BackEnd                          │
│           Node.js + Express 5 + Mongoose 9              │
│                    localhost:4000                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Doctor   │  │ Patient  │  │ Schedule │              │
│  │ Routes   │  │ Routes   │  │ Routes   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Appoint-  │  │  Chat    │  │  Notes   │              │
│  │ment      │  │ Routes   │  │ Routes   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP proxy (axios)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                       AI Service                        │
│         Python FastAPI + LangChain 0.3 + Groq           │
│                   localhost:8000                         │
│                                                         │
│  FAISS Vector Store ◄── sentence-transformers           │
│  Medical PDFs ──────► Embeddings ──► RAG Chain          │
│  Groq LLaMA 3.1 8B ◄── Retrieved Context               │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   VideoSDK.live API  │
              │  (Video Rooms + JWT) │
              └──────────────────────┘
```

---

## Technology Stack

### FrontEnd
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI framework |
| Vite | 7.2.4 | Build tool and dev server |
| TailwindCSS | 4.1.18 | Utility-first CSS styling |
| React Router DOM | 7.12.0 | Client-side routing |
| Axios | 1.13.2 | HTTP client for API calls |
| React Markdown | 10.1.0 | Renders AI responses as formatted markdown |
| VideoSDK RTC Prebuilt | 0.3.43 | Embedded video consultation UI |

### BackEnd
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.2.1 | REST API server |
| Mongoose | 9.1.1 | MongoDB ODM |
| MongoDB | 7.0.0 | Primary database |
| bcrypt | 6.0.0 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT auth tokens |
| multer | 2.0.2 | File uploads (profile pictures, audio) |
| axios | 1.13.2 | Proxy calls to AI service |
| moment | 2.30.1 | Date/time arithmetic for scheduling |
| pdfkit | 0.15.2 | PDF generation for meeting notes |
| cookie-parser | 1.4.7 | httpOnly cookie handling |

### AI Service
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | latest | Python API framework |
| LangChain | 0.3.26 | RAG orchestration |
| langchain-groq | 0.3.5 | Groq LLM integration |
| langchain-huggingface | 0.3.0 | HuggingFace embeddings |
| FAISS-cpu | 1.11.0 | Vector similarity search |
| sentence-transformers | 5.0.0 | Text embedding model |
| PyPDF | 5.7.0 | Medical PDF ingestion |
| faster-whisper | 1.0.3 | Audio transcription |
| Groq LLaMA 3.1 8B | instant | Language model for responses |

---

## Database Design

**Database:** MongoDB — `MediCare` (local: `mongodb://localhost:27017/MediCare`)

### Patient Collection
```
Patient {
  first_Name: String (required)
  last_Name:  String (required)
  email:      String (unique, required)
  password:   String (bcrypt hashed)
  age:        Number
  gender:     Enum ['Male', 'Female', 'Other']
}
Methods:
  Generate_Token()     → JWT signed with P_SecretKey (6h expiry)
  Check_Password(pass) → bcrypt.compare
```

### Doctor Collection
```
Doctor {
  first_Name:      String (required)
  last_Name:       String (required)
  ph:              String (phone)
  email:           String (unique, required)
  password:        String (bcrypt hashed)
  speciality:      String
  degrees:         [String]
  profile_Picture: String (filename stored in /public/pictures/)
}
Methods:
  Generate_Token()      → JWT signed with SecretKey (6h expiry)
  Password_Check(pass)  → bcrypt.compare
```

### Schedule Collection
```
Sechdule {
  doctor:       ObjectId (ref: Doctor)
  startTime:    String  (e.g. "14:30")
  endTime:      String  (e.g. "14:45")
  date:         Date    (specific calendar date)
  clinic_fee:   Number
  slotDuration: Number  (minutes)
  status:       Enum ['available', 'booked', 'completed', 'cancelled', 'ongoing']
}
Unique Index: { doctor, date, startTime }  ← prevents duplicate slots
```

### Appointment Collection
```
Appoitment {
  patient_id:   ObjectId (ref: Patient)
  doctor_id:    ObjectId (ref: Doctor)
  sechdule_Id:  ObjectId (ref: Sechdule)
  status:       Enum ['booked', 'ongoing', 'completed', 'cancelled']
  meeting_id:   String  (VideoSDK roomId)
}
```

### Chat Collection
```
Chat {
  patient_Id: ObjectId (ref: Patient)
  messages: [{
    sender:    Enum ['patient', 'ai']
    text:      String
    sources:   [String]
    timestamp: Date
  }]
}
One document per chat session; messages are pushed into the array.
```

### MeetingNote Collection
```
MeetingNote {
  appointment_id: ObjectId (ref: Appoitment)
  doctor_id:      ObjectId (ref: Doctor)
  patient_id:     ObjectId (ref: Patient)
  transcript:     String
  summary:        String
  pdfPath:        String
  createdAt:      Date
}
```

### Review Collection
```
Rewiew {
  doctor_id:  ObjectId (ref: Doctor)
  patient_id: ObjectId (ref: Patient)
  review:     String
}
Note: Model defined but routes/controller not yet wired.
```

---

## Authentication System

Two completely separate JWT-based auth flows using **httpOnly cookies** named `token`.

| Role | JWT Secret (env var) | Middleware | Sets on req |
|---|---|---|---|
| Doctor | `SecretKey` | `Doctor.middleware.js` | `req.doctorId` |
| Patient | `P_SecretKey` | `Patient.middleware.js` | `req.PatientId` |

**Flow:**
1. User submits credentials → backend validates password with bcrypt
2. Backend calls `Generate_Token()` on the model instance
3. Token is set as an httpOnly cookie (6h expiry) and returned in response body
4. Frontend stores minimal display data in `localStorage` for route guarding only
5. All subsequent API calls send the cookie automatically via `withCredentials: true`

**Frontend Route Guards:**
- `PrivateRoute` — checks `localStorage.getItem('doctorName')`
- `PatientRoute` — checks `localStorage.getItem('patientData')`

---

## Features & Implementation

### 1. AI Symptom Checker (RAG-Powered)

The core AI feature uses a Retrieval-Augmented Generation pipeline to answer patient health queries grounded in authoritative medical literature.

**Knowledge Base:**
Five medical textbooks are indexed into a FAISS vector store:
- Harrison's Manual of Medicine (17th Edition)
- Hutchison's Clinical Methods
- Nelson's Essentials of Pediatrics
- Robbins Pathology (7th Edition)
- The Gale Encyclopedia of Medicine (2nd Edition)

**Pipeline:**
```
Patient Question
      │
      ▼
History-Aware Retriever
  (rephrases question using chat history to be standalone)
      │
      ▼
FAISS Vector Search (k=3 most relevant chunks)
  Embeddings: sentence-transformers/all-MiniLM-L6-v2
      │
      ▼
Stuff Documents Chain
  LLM: Groq LLaMA 3.1 8B Instant (temp=0.3)
      │
      ▼
Structured Medical Response
```

**Response Format** (enforced via system prompt):
- 📋 Understanding Your Symptoms
- 🔍 Possible Conditions
- 💊 General Treatment Approaches
- 💉 Medications Commonly Used
- 🏥 Precautionary Measures
- 👨‍⚕️ When to Seek Medical Care
- ⚕️ Next Steps Recommendation

**Session Management:**
- Each patient chat session gets a unique `sessionId` (MongoDB ObjectId)
- Chat history stored in-memory in FastAPI (`chat_history_store` dict)
- Last 10 messages kept per session to manage token limits
- Full conversation persisted to MongoDB `Chat` collection

**Safety Rules** (enforced in system prompt):
- Never provides definitive diagnoses — uses cautious language
- Never prescribes specific medications or dosages
- Emergency symptoms trigger immediate "seek emergency care" warnings
- All responses grounded strictly in retrieved medical context

**API Endpoints (AI Service):**
```
POST /chat           → RAG query with session history
DELETE /chat/{id}    → Clear session history
POST /transcribe     → Audio transcription via faster-whisper
POST /summarize      → Consultation summary via Groq LLaMA
```

---

### 2. Doctor Registration & Profile Management

Doctors register through a dedicated portal with profile picture upload.

**Registration Flow:**
1. Doctor submits `multipart/form-data` with name, email, password, speciality, degrees, and profile picture
2. Backend uses `multer` to save the image to `BackEnd/public/pictures/`
3. Filename stored in the Doctor document
4. Profile pictures served statically at `/pictures/:filename`

**Doctor Portal Pages:**
- `/login` — Doctor login
- `/doctor/signup` — Registration with file upload
- `/doctor-dashboard` — Overview dashboard
- `/doctor/schedule/create` — Create availability slots
- `/doctor/schedule` — View and manage schedule
- `/doctor/appointments` — View appointments and join video calls

---

### 3. Schedule Management

Doctors create date-specific availability slots with fine-grained control.

**Creating Slots:**
- Doctor selects specific calendar dates (up to 30 days ahead)
- Sets time slots (e.g., "09:00", "09:15", "09:30")
- Sets clinic fee and slot duration in minutes
- `POST /Add_Sechdule` with `{ dates[], slots[], clinic_fee, slotDuration }`
- Backend rejects past dates and skips duplicate `date × startTime` combinations
- Bulk inserts one document per `date × slot` combination

**Viewing Schedule:**
- `GET /Show_Doctor_Sechdule` — Returns all active slots, auto-cancels expired ones
- `GET /Show_Doctor_Sechdule/:id` — Filter by day
- `GET /Show_Sechdule_Status/:status` — Filter by status (available/booked/completed/cancelled)
- `DELETE /Delete_Sechdule/:id` — Remove a slot

**Auto-Cancellation Logic** (`BackEnd/utils/autoCancel.js`):
```javascript
// Cancels a slot if:
// 1. schedule.date is before today (midnight boundary)
// 2. schedule.date is today AND schedule.endTime has already passed
// Uses moment.js for safe date arithmetic
```

---

### 4. Patient Appointment Booking

Patients browse doctors, view real-time availability, and book slots.

**Booking Flow:**
1. Patient browses `/doctors` → `GET /View_Doctor` returns all registered doctors
2. Patient selects a doctor → navigates to `/book-appointment/:doctorId`
3. Page calls `GET /Show_Appoitment_Sechdule/:doctorId` → returns available slots
4. Patient selects a slot → `POST /Book_Appointment/:scheduleId`
5. Backend checks for time conflicts on the same day for that patient
6. Creates a VideoSDK room via the VideoSDK REST API
7. Saves appointment with `meeting_id`, marks schedule status as `booked`
8. Patient views all active appointments at `/my-appointments`

**Conflict Prevention:**
- Server checks if the patient already has a booked appointment overlapping the selected time slot on the same day
- The schedule's unique compound index `{ doctor, date, startTime }` prevents double-booking at the database level

---

### 5. Video Consultation

Real-time video calls between doctors and patients using VideoSDK.live.

**Room Creation:**
- When a patient books an appointment, the backend calls the VideoSDK REST API to create a room
- The returned `roomId` is stored in the `Appointment` document as `meeting_id`

**Joining a Meeting:**
- Both doctor and patient navigate to `/room/:roomId`
- Frontend calls `GET /join-meeting/:roomId` to validate the time window
- Backend checks:
  - Is today the correct appointment date?
  - Is the current time within the slot window (with a 5-minute early buffer)?
- If valid: sets appointment status to `ongoing`, returns a VideoSDK JWT token and `remainingTime`
- Backend schedules a `setTimeout` to mark the appointment `completed` when time expires
- Frontend initializes the VideoSDK prebuilt UI with the token

**Token Generation** (`BackEnd/utils/videoSDK.js`):
```javascript
// Participant token — allow_join + allow_mod permissions, 120min expiry
generateToken()

// Server token — allow_join + allow_mod + allow_stream (for recording API)
generateServerToken()
```

---

### 6. AI Meeting Notes (Audio Transcription + Summarization)

After a video consultation, the system can generate structured meeting notes from the audio recording.

**Flow:**
1. Audio file uploaded to `BackEnd/uploads/audio/`
2. Backend sends audio bytes to `POST /transcribe` on the AI service
3. AI service uses `faster-whisper` (small model) to transcribe speech to text
4. Transcript sent to `POST /summarize` with doctor and patient names
5. Groq LLaMA 3.1 8B generates a structured patient-friendly consultation summary
6. Backend uses `pdfkit` to generate a PDF of the notes
7. PDF saved to `BackEnd/uploads/notes/` and stored in `MeetingNote` collection
8. PDF served for download by both doctor and patient

**Whisper Model:** `Systran/faster-whisper-small` — cached locally at `AI/models/`

---

### 7. Patient Dashboard & Doctor Discovery

**Patient-Facing Pages:**
- `/patient/dashboard` — Overview with quick links to AI chat, find doctors, appointments
- `/doctors` — Browse all registered doctors with speciality, degrees, and profile picture
- `/book-appointment/:id` — View available slots for a specific doctor and book
- `/my-appointments` — List of active appointments with join video button
- `/ai-chat` — AI symptom checker interface

**Doctor Cards** display:
- Profile picture (served from `/pictures/:filename`)
- Full name, speciality, degrees
- Link to book an appointment

---

## API Reference

### Doctor Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/D_SignUP` | — | Register (multipart/form-data with profile_Picture) |
| POST | `/D_Login` | — | Login, sets httpOnly cookie |
| GET | `/View_Doctor` | — | List all doctors (public) |
| GET | `/Doctor_Logout` | — | Clear cookie |

### Patient Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/P_SignUp` | — | Register patient |
| POST | `/P_Login` | — | Login, sets httpOnly cookie |
| GET | `/logout` | — | Clear cookie |

### Schedule Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/Add_Sechdule` | Doctor | Bulk insert date-specific slots |
| GET | `/Show_Doctor_Sechdule` | Doctor | View own schedule (auto-cancels expired) |
| GET | `/Show_Doctor_Sechdule/:id` | Doctor | View schedule by day |
| DELETE | `/Delete_Sechdule/:id` | Doctor | Delete a slot |
| GET | `/Show_Sechdule_Status/:status` | Doctor | Filter slots by status |

### Appointment Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/Show_Appoitment_Sechdule/:id` | — | Available slots for a doctor |
| POST | `/Book_Appointment/:id` | Patient | Book a slot, creates VideoSDK room |
| GET | `/My_Appointments` | Patient | Patient's active appointments |
| GET | `/Doctor_Appointments` | Doctor | Doctor's active appointments |
| GET | `/get-video-token` | — | Get VideoSDK JWT token |
| GET | `/join-meeting/:roomId` | — | Validate time window, return token |

### Chat Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/startNewChat` | Patient | Create new chat session |
| POST | `/SendMessage` | Patient | Send question, proxies to AI service |

### Notes Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/notes/process` | Doctor | Upload audio, transcribe, summarize, generate PDF |
| GET | `/notes/:appointmentId` | Doctor/Patient | Retrieve meeting notes |

---

## Frontend Routes

```
/                          → Home (public landing page)
/login                     → Doctor login
/doctor/signup             → Doctor registration
/patient/signup            → Patient registration
/patient/login             → Patient login

/doctor-dashboard          → Doctor home          [Doctor protected]
/doctor/schedule/create    → Create schedule      [Doctor protected]
/doctor/schedule           → View/manage schedule [Doctor protected]
/doctor/appointments       → Appointments + video [Doctor protected]

/patient/dashboard         → Patient home         [Patient protected]
/doctors                   → Browse all doctors   [Patient protected]
/book-appointment/:id      → Book appointment     [Patient protected]
/my-appointments           → Active appointments  [Patient protected]
/ai-chat                   → AI symptom checker   [Patient protected]

/room/:roomId              → Video call room      (validated server-side)
```

---

## Environment Variables

**BackEnd/.env**
```
DB_URL=mongodb://localhost:27017/MediCare
PORT=4000
SecretKey=MediCare        # Doctor JWT secret
P_SecretKey=Patient       # Patient JWT secret
ExpireIn=6h
```

**AI/.env**
```
GROQ_API_KEY=<your_groq_api_key>
```

> Note: VideoSDK API key and secret are currently hardcoded in `BackEnd/utils/videoSDK.js` and should be moved to environment variables before production deployment.

---

## Project Structure

```
MediCare AI/
├── FrontEnd/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx                  ← Public landing page
│       │   ├── AIChat.jsx                ← AI symptom checker
│       │   ├── BookAppointment.jsx       ← Slot selection & booking
│       │   ├── DoctorAppointments.jsx    ← Doctor's appointment list
│       │   ├── DoctorDashboard.jsx       ← Doctor home
│       │   ├── DoctorLogin.jsx
│       │   ├── DoctorSignup.jsx
│       │   ├── FindDoctors.jsx           ← Patient doctor browser
│       │   ├── MyAppointments.jsx        ← Patient appointment list
│       │   └── ...
│       ├── hooks/
│       │   └── useAuth.js
│       └── App.jsx                       ← Route definitions
│
├── BackEnd/
│   ├── index.js                          ← Express server entry point
│   ├── Models/
│   │   ├── Patient.model.js
│   │   ├── Dooctor.model.js              ← Note: intentional typo
│   │   ├── sechdule.model.js             ← Note: intentional typo
│   │   ├── Appoitment.model.js           ← Note: intentional typo
│   │   ├── Chat.model.js
│   │   ├── MeetingNote.model.js
│   │   └── Rewiew.model.js               ← Note: intentional typo
│   ├── Controlers/                       ← Note: intentional typo
│   │   ├── Doctor.controller.js
│   │   ├── Patient.controller.js
│   │   ├── Sechdule.contoller.js
│   │   ├── Appoitment.controller.js
│   │   ├── Chat.contoller.js
│   │   ├── Notes.controller.js
│   │   └── Rewiew.controller.js
│   ├── MiddleWare/
│   │   ├── Doctor.middleware.js          ← Verifies doctor JWT
│   │   ├── Patient.middleware.js         ← Verifies patient JWT
│   │   └── AnyUser.middleware.js
│   ├── Routes/
│   ├── utils/
│   │   ├── autoCancel.js                 ← Expired slot/appointment logic
│   │   ├── videoSDK.js                   ← VideoSDK token generation
│   │   ├── recordingSDK.js               ← Recording utilities
│   │   ├── generateNotesPDF.js           ← pdfkit PDF generation
│   │   └── notesProcessor.js             ← Audio → transcript → summary
│   └── public/pictures/                  ← Doctor profile images
│
└── AI/
    ├── API/
    │   ├── main.py                       ← FastAPI app, endpoints
    │   ├── rag_engine.py                 ← LangChain RAG pipeline
    │   ├── notes_engine.py               ← Whisper + summarization
    │   └── schemas.py                    ← Pydantic request/response models
    ├── data/                             ← Medical PDF textbooks
    ├── vectorstore/db_faiss/             ← FAISS index (pre-built)
    ├── models/                           ← Cached Whisper model
    ├── create_memory_for_llm.py          ← Script to build FAISS index
    └── connect_memory_with_llm.py        ← Script to test RAG pipeline
```

---

## Running the Project

### 1. BackEnd
```bash
cd BackEnd
# Create .env with DB_URL, PORT, SecretKey, P_SecretKey, ExpireIn
npm install
node index.js
# Server runs on http://localhost:4000
```

### 2. AI Service
```bash
cd AI
# Create .env with GROQ_API_KEY
# Install uv: pip install uv
uv sync
# Build vector store (first time only)
python create_memory_for_llm.py
# Start API
uvicorn API.main:app --reload
# Service runs on http://localhost:8000
```

### 3. FrontEnd
```bash
cd FrontEnd
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Known Limitations & Pending Features

| Feature | Status | Notes |
|---|---|---|
| Review/Rating System | Model exists, not wired | `Rewiew.model.js` has no controller or route |
| Patient Chat History | Controller exists, not routed | `getPatientHistory` in `Chat.contoller.js` |
| Doctor Verification | Controller exists, not routed | `Verify_Doctor` in `Doctor.controller.js` |
| Token Refresh | Not implemented | Tokens expire in 6h, user must re-login |
| VideoSDK Credentials | Hardcoded | Should be moved to `.env` |
| CORS | Dev only | `origin: 'http://localhost:5173'` — update for production |

---

## Security Considerations

- Passwords hashed with bcrypt (salt rounds default)
- Auth tokens stored in httpOnly cookies — not accessible via JavaScript
- CORS restricted to the FrontEnd origin with `credentials: true`
- File uploads validated and stored outside the web root
- AI responses include mandatory medical disclaimer
- Emergency symptom detection triggers immediate care warnings
- JWT tokens expire in 6 hours

---

*MediCare AI — Empowering patients and doctors with intelligent, data-driven healthcare solutions.*
