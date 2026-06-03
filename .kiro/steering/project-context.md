# MediCare AI — Project Steering Context

## What This Project Is

A full-stack telemedicine platform called **MediCare AI**. Patients can chat with an AI symptom checker, find doctors, book appointments, and join video consultations. Doctors manage their schedules and appointments through a dedicated portal.

---

## Architecture Overview

```
MediCare AI
├── FrontEnd/     → React + Vite + TailwindCSS (port 5173)
├── BackEnd/      → Node.js + Express + MongoDB/Mongoose (port 4000)
└── AI/           → Python FastAPI + LangChain RAG (port 8000)
```

The three services communicate like this:
- FrontEnd calls BackEnd REST API at `http://localhost:4000`
- BackEnd calls AI service at `http://127.0.0.1:8000/chat` for AI responses
- FrontEnd calls VideoSDK.live API for video rooms

---

## Database: MongoDB

Database name: `MediCare` (local: `mongodb://localhost:27017/MediCare`)

### Collections & Schemas

**Patient** (`Patient.model.js`)
- `first_Name`, `last_Name`, `email` (unique), `password` (bcrypt hashed), `age`, `gender` (Male/Female/Other)
- Methods: `Generate_Token()` → JWT signed with `P_SecretKey`, `Check_Password(pass)`

**Doctor** (`Dooctor.model.js`) ← note the typo in filename
- `first_Name`, `last_Name`, `ph`, `email` (unique), `password` (bcrypt hashed), `speciality`, `degrees[]`, `profile_Picture`
- Methods: `Generate_Token()` → JWT signed with `SecretKey`, `Password_Check(pass)`
- Profile pictures stored at `BackEnd/public/pictures/` and served at `/pictures/:filename`

**Schedule** (`sechdule.model.js`) ← note the typo
- `doctor` (ref Doctor), `startTime` (String e.g. "14:30"), `endTime` (String), `date` (Date — specific calendar date), `clinic_fee`, `slotDuration` (minutes), `status` (available/booked/completed/cancelled/ongoing)
- Compound unique index: `{ doctor, date, startTime }` prevents duplicate slots
- Schedules are date-specific (not weekly recurring)

**Appointment** (`Appoitment.model.js`) ← note the typo
- `patient_id` (ref Patient), `doctor_id` (ref Doctor), `sechdule_Id` (ref Sechdule), `status` (booked/ongoing/completed/cancelled), `meeting_id` (VideoSDK roomId)

**Chat** (`Chat.model.js`)
- `patient_Id` (ref Patient), `messages[]` → `{ sender: 'patient'|'ai', text, sources[], timestamp }`
- One Chat document per session; messages are pushed into the array

**Review** (`Rewiew.model.js`) ← note the typo
- `doctor_id` (ref Doctor), `patient_id` (ref Patient), `review` (String)
- Currently defined but not yet wired to routes/controllers

---

## Authentication

Two separate JWT-based auth flows using **httpOnly cookies** named `token`:

| Role    | Secret Env Var | Middleware File             | Sets on req    |
|---------|----------------|-----------------------------|----------------|
| Doctor  | `SecretKey`    | `Doctor.middleware.js`      | `req.doctorId` |
| Patient | `P_SecretKey`  | `Patient.middleware.js`     | `req.PatientId`|

Frontend guards:
- `PrivateRoute` → checks `localStorage.getItem('doctorName')`
- `PatientRoute` → checks `localStorage.getItem('patientData')`

On login, the backend sets the cookie AND the frontend stores minimal data in localStorage for route guarding only.

---

## API Endpoints

### Doctor Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/D_SignUP` | — | Register doctor (multipart/form-data with `profile_Picture`) |
| POST | `/D_Login` | — | Login, sets cookie |
| GET | `/View_Doctor` | — | List all doctors (public, for patient browsing) |
| GET | `/Doctor_Logout` | — | Clear cookie |

### Patient Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/P_SignUp` | — | Register patient |
| POST | `/P_Login` | — | Login, sets cookie |
| GET | `/logout` | — | Clear cookie |

### Schedule Routes (Doctor-protected)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/Add_Sechdule` | Doctor | Add weekly slots (bulk insert) |
| GET | `/Show_Doctor_Sechdule` | Doctor | View own active schedule (auto-cancels past slots) |
| GET | `/Show_Doctor_Sechdule/:id` | Doctor | View schedule by day |
| DELETE | `/Delete_Sechdule/:id` | Doctor | Delete a slot |
| GET | `/Show_Sechdule_Status/:status` | Doctor | Filter slots by status |

### Appointment Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/Show_Appoitment_Sechdule/:id` | — | Get available slots for a doctor (by doctor ID) |
| POST | `/Book_Appointment/:id` | Patient | Book a schedule slot (`:id` = scheduleId), creates VideoSDK room |
| GET | `/My_Appointments` | Patient | Patient's active appointments (auto-cancels expired) |
| GET | `/Doctor_Appointments` | Doctor | Doctor's active appointments (auto-cancels expired) |
| GET | `/get-video-token` | — | Get VideoSDK JWT token |
| GET | `/join-meeting/:roomId` | — | Validate meeting time window, returns token + remainingTime |

### Chat Routes (Patient-protected)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/startNewChat` | Patient | Create new chat session, returns `sessionId` |
| POST | `/SendMessage` | Patient | Send question, proxies to AI service, saves to DB |

---

## Core Business Flows

### Patient Booking Flow
1. Patient browses `/doctors` → calls `GET /View_Doctor`
2. Clicks a doctor → navigates to `/book-appointment/:doctorId`
3. Page calls `GET /Show_Appoitment_Sechdule/:doctorId` → shows available slots
4. Patient selects a slot → calls `POST /Book_Appointment/:scheduleId`
5. Backend checks for time conflicts on same day, creates a VideoSDK room via API, saves appointment with `meeting_id`, marks schedule as `booked`
6. Patient views appointments at `/my-appointments` → `GET /My_Appointments`

### Video Call Flow
1. Patient/Doctor navigates to `/room/:roomId`
2. Frontend calls `GET /join-meeting/:roomId` to validate time window
3. Backend checks: correct day? within time slot (with 5-min early buffer)?
4. If valid: sets appointment to `ongoing`, returns VideoSDK token + `remainingTime`
5. Backend schedules a `setTimeout` to mark appointment `completed` when time expires
6. Frontend uses VideoSDK SDK with the token to join the room

### Auto-Cancellation Logic
Extracted to `BackEnd/utils/autoCancel.js` — used in both appointment and schedule controllers.
- If `schedule.date` is before today (midnight boundary) → cancel
- If `schedule.date` is today AND `schedule.endTime` has passed → cancel
- Uses `moment` for safe date arithmetic

### AI Chat Flow
1. Patient opens `/ai-chat`
2. Frontend calls `POST /startNewChat` → gets `sessionId`
3. Each message: `POST /SendMessage` with `{ question, session_id }`
4. BackEnd proxies to FastAPI at `http://127.0.0.1:8000/chat`
5. FastAPI uses LangChain RAG: retrieves from FAISS vector store → Groq LLaMA 3.1 8B generates answer
6. Response saved to Chat document, returned to frontend

### Doctor Schedule Creation
1. Doctor goes to `/doctor/schedule/create`
2. Selects specific calendar dates (next 30 days) + time slots + fee + slot duration
3. `POST /Add_Sechdule` with `{ dates[], slots[], clinic_fee, slotDuration }` (dates are ISO strings e.g. "2025-07-14")
4. Backend rejects past dates and skips duplicate date×startTime combos
5. Bulk inserts one document per date×slot combination

---

## AI Layer (Python FastAPI)

**Location:** `AI/API/`  
**Run command:** from `AI/` directory using `uvicorn API.main:app`

- **Vector store:** FAISS index at `AI/vectorstore/db_faiss/` built from medical PDFs in `AI/data/`
- **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` (HuggingFace)
- **LLM:** Groq `llama-3.1-8b-instant` (API key in `AI/.env` as `GROQ_API_KEY`)
- **RAG chain:** History-aware retriever → stuff documents chain → structured medical response
- **Session history:** Stored in-memory dict `chat_history_store`, last 10 messages kept per session
- **Response format:** Structured markdown with sections: Understanding Symptoms, Possible Conditions, Treatment Approaches, Medications, Precautions, When to Seek Care, Next Steps

---

## Frontend Routes

```
/                          → Home (public landing page)
/login                     → Doctor login
/doctor/signup             → Doctor registration
/patient/signup            → Patient registration
/patient/login             → Patient login

/doctor-dashboard          → Doctor home [Doctor protected]
/doctor/schedule/create    → Create weekly schedule [Doctor protected]
/doctor/schedule           → View/manage schedule [Doctor protected]
/doctor/appointments       → View appointments + join video [Doctor protected]

/patient/dashboard         → Patient home [Patient protected]
/doctors                   → Browse all doctors [Patient protected]
/book-appointment/:id      → Book slot for doctor :id [Patient protected]
/my-appointments           → View active appointments [Patient protected]
/ai-chat                   → AI symptom checker chat [Patient protected]

/room/:roomId              → Video call room (no auth guard, validated server-side)
```

---

## Known Typos in Codebase (Do Not Rename Without Updating All References)

These are intentional inconsistencies to be aware of — do not "fix" them without updating all imports:

| Typo | Correct | Affected Files |
|------|---------|----------------|
| `Appoitment` | Appointment | Models, Controllers, Routes |
| `Sechdule` | Schedule | Models, Controllers, Routes |
| `Dooctor.model.js` | Doctor.model.js | Model file |
| `Rewiew.model.js` | Review.model.js | Model file |
| `Controlers/` | Controllers/ | Folder name |

---

## Environment Variables

**BackEnd/.env**
```
DB_URL=mongodb://localhost:27017/MediCare
PORT=4000
SecretKey=MediCare          # Doctor JWT secret
P_SecretKey=Patient         # Patient JWT secret
ExpireIn=6h
```

**AI/.env**
```
GROQ_API_KEY=<your_groq_key>
```

**VideoSDK** credentials are hardcoded in `BackEnd/utils/videoSDK.js` — should be moved to env.

---

## Key Dependencies

**BackEnd:** express 5, mongoose 9, bcrypt, jsonwebtoken, multer (image uploads), axios (calls AI service), moment, cookie-parser, cors

**FrontEnd:** React 18, react-router-dom, axios, TailwindCSS, Vite

**AI:** FastAPI, LangChain 0.3, langchain-groq, langchain-huggingface, FAISS-cpu, sentence-transformers, PyPDF, python-dotenv

---

## What Is Not Yet Implemented

- Review/rating system — `Rewiew.model.js` exists but has no controller or route
- `getPatientHistory` controller exists in `Chat.contoller.js` but is not registered in `Chat.route.js`
- Doctor `Verify_Doctor` controller exists but is not registered in `Doctor.route.js`
- No refresh token mechanism — tokens expire in 6h and user must re-login
- VideoSDK credentials are hardcoded, not in `.env`
