# Chapter 5: System Implementation

---

## 5.1 Important Flow Control / Pseudo Codes

The MediCare AI platform operates through several critical flows that govern user authentication, AI-driven symptom analysis, appointment lifecycle management, and automated post-consultation note generation. The following pseudo codes describe the core control logic implemented across the system.

---

### 5.1.1 Dual-Track Authentication Flow

The system maintains two completely separate authentication pipelines — one for patients and one for doctors — each protected by its own JSON Web Token secret and stored in a dedicated httpOnly cookie to prevent cross-role session leakage.

```
PROCEDURE AuthenticateUser(role, email, password):

    user ← Database.find(role_collection, { email: email })

    IF user IS NULL THEN
        RETURN Error("Account not found")
    END IF

    isMatch ← bcrypt.compare(password, user.password_hash)

    IF isMatch IS FALSE THEN
        RETURN Error("Invalid credentials")
    END IF

    IF role = "doctor" THEN
        secret ← ENV.JWT_SECRET
        cookieName ← "doctorToken"
    ELSE
        secret ← ENV.P_JWT_SECRET
        cookieName ← "patientToken"
    END IF

    token ← jwt.sign({ id: user._id, role: role }, secret, { expiresIn: "7d" })

    Response.setCookie(cookieName, token, {
        httpOnly: TRUE,
        secure: TRUE,
        sameSite: "Strict"
    })

    RETURN Success(user profile data)

END PROCEDURE
```

---

### 5.1.2 AI Symptom Analysis RAG Pipeline

The AI service implements a Retrieval-Augmented Generation (RAG) pipeline. When a patient submits a symptom query, the system retrieves the most semantically relevant passages from a FAISS vector index built from verified medical textbooks, then feeds the retrieved context alongside conversation history to the Groq LLM to produce a grounded, evidence-based response.

```
PROCEDURE ProcessSymptomQuery(session_id, user_message):

    // Step 1 — Retrieve or initialise session history
    history ← SessionStore.get(session_id)
    IF history IS NULL THEN
        history ← []
        SessionStore.create(session_id, history)
    END IF

    // Step 2 — Semantic retrieval from FAISS vector store
    query_embedding ← HuggingFaceEmbeddings.encode(user_message)
    top_k_docs ← FAISS_Index.similarity_search(query_embedding, k=4)
    context ← concatenate(top_k_docs.page_content)

    // Step 3 — Construct prompt with context and history
    system_prompt ← "You are a medical AI assistant. Use ONLY the provided
                      medical context to answer. Do not speculate beyond
                      the retrieved evidence."

    messages ← [
        { role: "system",    content: system_prompt + "\n\nContext:\n" + context },
        ...history,
        { role: "user",      content: user_message }
    ]

    // Step 4 — LLM inference via Groq API
    ai_response ← GroqLLM.chat(messages, model="llama-3.1-8b-instant")

    // Step 5 — Persist turn to session history
    history.append({ role: "user",      content: user_message  })
    history.append({ role: "assistant", content: ai_response   })
    SessionStore.update(session_id, history)

    RETURN { answer: ai_response, sources: top_k_docs.metadata }

END PROCEDURE
```

---

### 5.1.3 Appointment Booking with Conflict Prevention

Before confirming a booking, the system validates the selected slot against all existing appointments of the requesting patient on the same date to prevent time-overlap conflicts, then atomically marks the schedule slot as unavailable.

```
PROCEDURE BookAppointment(patient_id, schedule_slot_id):

    slot ← Schedule.findById(schedule_slot_id)

    IF slot IS NULL OR slot.status ≠ "available" THEN
        RETURN Error(409, "Slot no longer available")
    END IF

    // Conflict check — same patient, same date, overlapping window
    existing ← Appointment.find({
        patient_id : patient_id,
        date       : slot.date,
        status     : { $in: ["booked", "ongoing"] }
    })

    FOR EACH appt IN existing DO
        IF TimeRangesOverlap(appt.startTime, appt.endTime,
                             slot.startTime, slot.endTime) THEN
            RETURN Error(409, "You already have an overlapping appointment")
        END IF
    END FOR

    // Create VideoSDK meeting room
    meeting ← VideoSDK.createRoom()

    // Atomic write — book slot + create appointment record
    BEGIN TRANSACTION
        slot.status ← "booked"
        Schedule.save(slot)

        appointment ← Appointment.create({
            patient_id  : patient_id,
            doctor_id   : slot.doctor_id,
            sechdule_Id : schedule_slot_id,
            meeting_id  : meeting.roomId,
            status      : "booked"
        })
    END TRANSACTION

    RETURN Success(appointment)

END PROCEDURE
```

---

### 5.1.4 Video Call Join Validation

Before granting a user access to a video room, the backend validates that the caller is a legitimate participant of that specific appointment and that the current time falls within the permitted window (five minutes before start until session end).

```
PROCEDURE ValidateJoinMeeting(meeting_id, user_cookie):

    // Authenticate caller from httpOnly cookie
    payload ← jwt.verify(user_cookie, appropriate_secret)
    caller_id ← payload.id
    role ← payload.role

    appointment ← Appointment.findOne({ meeting_id: meeting_id })
                             .populate("sechdule_Id")

    IF appointment IS NULL THEN
        RETURN Error("Meeting not found")
    END IF

    // Authorisation — only the booked patient or assigned doctor may join
    IF role = "patient" AND appointment.patient_id ≠ caller_id THEN
        RETURN Error("Not authorised for this meeting")
    END IF

    IF role = "doctor" AND appointment.doctor_id ≠ caller_id THEN
        RETURN Error("Not authorised for this meeting")
    END IF

    // Time-window validation
    slot    ← appointment.sechdule_Id
    now     ← currentTime()
    start   ← parseTime(slot.date, slot.startTime) - 5 minutes
    end     ← parseTime(slot.date, slot.endTime)

    IF now < start OR now > end THEN
        RETURN Error("Outside permitted joining window")
    END IF

    // Generate short-lived VideoSDK participant token
    token ← VideoSDK.generateToken(meeting_id, caller_id, role)
    remainingTime ← (end - now) in seconds

    RETURN Success({
        token         : token,
        participantName : caller.full_name,
        userRole      : role,
        appointmentId : appointment._id,
        remainingTime : remainingTime
    })

END PROCEDURE
```

---

### 5.1.5 Post-Consultation AI Notes Generation

After a video session ends, the patient's browser uploads the mixed audio recording to the backend. The backend forwards it to the AI service, which transcribes the audio using faster-whisper, summarises the transcript using the Groq LLM, and generates a structured PDF consultation report.

```
PROCEDURE GenerateConsultationNotes(appointment_id, audio_file):

    // Step 1 — Transcription (faster-whisper)
    transcript ← Whisper.transcribe(audio_file, model="base", language="en")
    full_text  ← join(transcript.segments, separator="\n")

    IF length(full_text) < 50 THEN
        RETURN Error("Transcript too short — audio may be empty")
    END IF

    // Step 2 — LLM summarisation
    prompt ← "You are a medical scribe. Summarise the following doctor-patient
               consultation transcript into structured clinical notes with
               sections: Chief Complaint, History, Assessment, and Plan."

    summary ← GroqLLM.chat([
        { role: "system", content: prompt },
        { role: "user",   content: full_text }
    ])

    // Step 3 — PDF generation
    appointment ← Appointment.findById(appointment_id)
                             .populate("doctor_id patient_id sechdule_Id")

    pdf_content ← Template.render("consultation_note", {
        doctor    : appointment.doctor_id,
        patient   : appointment.patient_id,
        date      : appointment.sechdule_Id.date,
        summary   : summary,
        transcript: full_text
    })

    pdf_path ← pdfkit.generate(pdf_content, output_dir="/notes/")

    // Step 4 — Persist note record
    MeetingNote.create({
        appointment_id : appointment_id,
        pdf_path       : pdf_path,
        status         : "complete"
    })

    RETURN Success({ download_url: "/notes/" + pdf_path })

END PROCEDURE
```

---

### 5.1.6 Auto-Cancellation of Stale Appointments

A scheduled background job runs periodically to cancel appointments and schedule slots that have passed their end time without being attended, freeing up the doctor's availability automatically.

```
PROCEDURE AutoCancelStaleAppointments():

    now ← currentDateTime()

    stale_slots ← Schedule.find({
        status    : "booked",
        date      : { $lt: today() }
    })

    FOR EACH slot IN stale_slots DO

        appointment ← Appointment.findOne({
            sechdule_Id : slot._id,
            status      : { $in: ["booked", "ongoing"] }
        })

        IF appointment IS NOT NULL THEN
            appointment.status ← "cancelled"
            Appointment.save(appointment)
        END IF

        slot.status ← "cancelled"
        Schedule.save(slot)

        Log("Auto-cancelled slot: " + slot._id + " at " + now)

    END FOR

END PROCEDURE

// Runs every 10 minutes via setInterval in BackEnd/utils/autoCancel.js
SCHEDULE AutoCancelStaleAppointments EVERY 10 MINUTES
```

---

## 5.2 Components, Libraries, Web Services and Stubs

The MediCare AI platform is composed of three independently deployable services — a React frontend, an Express backend, and a FastAPI AI service — each drawing on a carefully selected set of libraries and external web services.

---

### 5.2.1 Frontend Components and Libraries

The user interface is built with **React 19** using functional components and hooks throughout. The entire component tree is split into purpose-specific page modules under `FrontEnd/src/pages/` and shared utility hooks under `FrontEnd/src/hooks/`. Routing is handled by **React Router v7**, which provides client-side navigation with protected route wrappers that gate access based on the authenticated user role returned by the `useAuth.js` hook.

**Vite 6** serves as the frontend build tool and development server. Its ES module-native architecture delivers sub-second hot module replacement during development and generates optimised, code-split bundles for production. **TailwindCSS v4** is used exclusively for styling; no external component library is introduced, keeping the bundle lean and giving full visual control over the design system (Navy `#0A2540`, Teal `#00B4A0`, Chalk `#F4F7F9`).

**Axios** manages all HTTP communication between the frontend and the backend REST API. Every request that requires authentication passes `{ withCredentials: true }` so the browser automatically attaches the appropriate httpOnly cookie (`doctorToken` or `patientToken`). The **VideoSDK Prebuilt SDK** is loaded at runtime via CDN rather than bundled through npm, which avoids bundling a large WebRTC dependency and allows the video call page to lazy-load the SDK only when a user navigates to a call room.

| Library | Version | Role |
|---|---|---|
| React | 19 | UI component framework |
| React Router | 7 | Client-side routing and protected routes |
| Vite | 6 | Build tool and dev server |
| TailwindCSS | 4 | Utility-first CSS framework |
| Axios | 1.x | HTTP client with cookie support |
| VideoSDK Prebuilt | 0.3.20 | WebRTC video call UI (CDN) |

---

### 5.2.2 Backend Components and Libraries

The backend is an **Express 5** application running on Node.js 20. The entry point `BackEnd/index.js` initialises middleware, connects to MongoDB, schedules the auto-cancel job, and mounts all route modules. The codebase is organised into four top-level directories: `Controlers/` (intentional spelling, preserved to avoid breaking imports), `Routes/`, `Models/`, `MiddleWare/`, and `utils/`.

**Mongoose 9** provides the ODM layer for all seven MongoDB collections: `Patient`, `Doctor`, `Schedule`, `Appointment`, `Chat`, `Review`, and `MeetingNote`. **bcrypt** handles password hashing with a salt round of 10 before any credential is persisted. **jsonwebtoken** signs and verifies all authentication tokens. **cookie-parser** extracts tokens from incoming httpOnly cookies for the middleware chain.

**Multer** handles multipart/form-data file uploads (doctor profile pictures and post-call audio recordings). **pdfkit** generates the structured PDF consultation notes entirely in-process without any external rendering dependency. **helmet** sets security-related HTTP response headers, and **express-rate-limit** applies per-IP request throttling to the authentication endpoints. **axios** on the backend side is used to call the VideoSDK REST API when creating meeting rooms and to proxy patient symptom queries to the AI service.

| Library | Version | Role |
|---|---|---|
| Express | 5 | HTTP server and routing |
| Mongoose | 9 | MongoDB ODM |
| bcrypt | 6 | Password hashing |
| jsonwebtoken | 9 | JWT creation and verification |
| cookie-parser | 1.4 | httpOnly cookie extraction |
| multer | 2 | File upload handling |
| pdfkit | 0.15 | In-process PDF generation |
| helmet | 8 | HTTP security headers |
| express-rate-limit | 8 | API rate limiting |
| dotenv | 17 | Environment variable loading |
| moment | 2 | Date/time manipulation |

---

### 5.2.3 AI Service Components and Libraries

The AI microservice is built with **FastAPI** and exposes two primary endpoints: `POST /chat` for symptom analysis and `POST /transcribe-and-summarise` for post-call note generation. Session-level conversation history is maintained in an in-memory dictionary keyed by `session_id`, allowing multi-turn dialogue without a persistent chat database.

The RAG pipeline relies on **LangChain** as the orchestration layer. **HuggingFace sentence-transformers** (`all-MiniLM-L6-v2`) generate dense vector embeddings for both the indexed medical documents and incoming user queries entirely locally, with no embedding API calls. The resulting embeddings are indexed in **FAISS** (Facebook AI Similarity Search), a high-performance in-process vector store that is built once from five medical PDF textbooks using `create_memory_for_llm.py` and then loaded from disk on every service start.

Inference is performed by the **Groq API** (`langchain-groq`) using Llama-3 class models hosted on Groq's low-latency LPU inference hardware, yielding sub-second response times. Post-call audio transcription uses **faster-whisper**, a CTranslate2-optimised reimplementation of OpenAI Whisper that runs on CPU without GPU dependencies.

| Library | Version | Role |
|---|---|---|
| FastAPI | 0.115 | Async REST API framework |
| LangChain | 0.3 | RAG pipeline orchestration |
| langchain-groq | 0.3 | Groq LLM integration |
| langchain-huggingface | 0.3 | Local embedding model |
| sentence-transformers | 5.0 | Text embedding generation |
| faiss-cpu | 1.11 | Vector similarity search |
| faster-whisper | 1.0.3 | Audio transcription (CPU) |
| pydantic | 2 | Request/response validation |
| python-dotenv | 1.1 | Environment variable loading |
| uvicorn | 0.30 | ASGI server |

---

### 5.2.4 External Web Services

**VideoSDK** is the sole external real-time communication service. The backend calls the VideoSDK REST API (`https://api.videosdk.live`) to create a meeting room and obtain a short-lived participant token before a user joins a call. The prebuilt JavaScript SDK is then loaded client-side via CDN and initialised with that token and the meeting room ID. This architecture means MediCare never handles raw WebRTC signalling or media relay infrastructure directly.

**Groq API** provides the cloud-hosted large language model inference used both by the AI symptom chat and the consultation note summarisation pipeline. All calls go through the `langchain-groq` integration, which formats messages in the OpenAI-compatible chat completions schema.

**HuggingFace Hub** is accessed at startup by the `sentence-transformers` library to download the embedding model weights on first run. In production, the model is cached to the `AI/models/` volume so subsequent container restarts do not re-download it.

---

### 5.2.5 Stubs and Mock Interfaces

During development and unit testing, the VideoSDK REST API is stubbed with a local mock that returns a hardcoded `roomId` and `token` so that appointment booking flows can be tested end-to-end without consuming VideoSDK API quota. Similarly, the Groq API is substituted with a stub function that returns a fixed symptom assessment string, allowing the AI chat endpoint to be exercised without network access. These stubs are activated by setting `NODE_ENV=test` (backend) or `MOCK_AI=true` (AI service), and are never shipped in production builds.

---

## 5.3 Deployment Environment

The MediCare AI platform is containerised using **Docker** and orchestrated with **Docker Compose**, enabling reproducible, one-command deployment across development, staging, and production environments. The deployment stack consists of four containers that communicate over a private bridge network named `medicare_network`, with no inter-container ports exposed to the host except the application ingress ports.

---

### 5.3.1 Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Host Machine                             │
│                                                                 │
│   Port 80 ──► ┌──────────────────┐                             │
│               │  medicare_front  │  Nginx 1.27-alpine          │
│               │  (React SPA)     │  Serves compiled Vite dist  │
│               └────────┬─────────┘                             │
│                        │ proxy /api/*                          │
│   Port 4000 ──► ┌──────▼─────────┐                             │
│                 │ medicare_back  │  Node 20-alpine             │
│                 │ (Express 5)    │  REST API + Auth + PDF      │
│                 └──────┬─────────┘                             │
│                        │ internal:8000                         │
│               ┌────────▼─────────┐   ┌────────────────────┐   │
│               │  medicare_ai     │   │ medicare_mongodb    │   │
│               │  (FastAPI+RAG)   │   │ (MongoDB 7.0)      │   │
│               └──────────────────┘   └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Frontend Container** — Built using a two-stage Dockerfile. Stage one uses `node:20-alpine` to install dependencies and run `npm run build`, producing the optimised static bundle in `dist/`. Stage two copies only the compiled assets into `nginx:1.27-alpine`, which serves them with gzip compression, aggressive caching headers for hashed assets, and a React Router SPA fallback (`try_files $uri /index.html`).

**Backend Container** — Also multi-stage. Stage one installs production npm dependencies using `npm ci --omit=dev`. Stage two copies only the `node_modules` and source into a clean `node:20-alpine` image and runs `node index.js`. bcrypt's native addon is pre-compiled against Alpine's musl libc in stage one so no build tools are needed at runtime.

**AI Service Container** — Built from `python:3.11-slim`. System packages (`ffmpeg`, `wkhtmltopdf`, `libopenblas`, `libgomp`) are installed first for faster-whisper, FAISS, and pdfkit. Python dependencies from `requirements.txt` are pip-installed into the image. The FAISS vector index and HuggingFace model weights are mounted as named Docker volumes (`ai_vectorstore`, `ai_models`) so they persist across container restarts and do not need to be rebuilt on each deployment.

**MongoDB Container** — Uses the official `mongo:7.0` image with a named volume (`mongo_data`) for persistence. A Docker healthcheck polls `mongosh` every ten seconds so dependent services only start after the database is genuinely accepting connections.

---

### 5.3.2 Environment Variables and Secrets

All sensitive configuration is injected at container runtime via environment variables defined in a `.env` file that is never committed to version control. The `.env.example` template lists all required variables:

| Variable | Service | Purpose |
|---|---|---|
| `JWT_SECRET` | Backend | Signs doctor authentication tokens |
| `P_JWT_SECRET` | Backend | Signs patient authentication tokens |
| `VIDEOSDK_API_KEY` | Backend | VideoSDK REST API authentication |
| `VIDEOSDK_SECRET` | Backend | VideoSDK token signing |
| `GROQ_API_KEY` | AI Service | Groq LLM inference API |
| `HF_TOKEN` | AI Service | HuggingFace model download |
| `VITE_API_URL` | Frontend (build-time) | Backend base URL injected at Vite build |

---

### 5.3.3 Startup Order and Health Checks

Docker Compose service dependencies are declared with `condition: service_healthy` rather than the weaker `condition: service_started`, enforcing the following strict startup sequence:

```
MongoDB ──(healthy)──► Backend ──(healthy)──► Frontend
                              └──────────────► AI Service
```

This guarantees that the Express server never attempts a Mongoose connection before MongoDB is ready, and that the frontend Nginx instance only starts after the backend API is responsive.

---

### 5.3.4 Persistent Volumes

| Volume | Mounted At | Contents |
|---|---|---|
| `mongo_data` | `/data/db` | All MongoDB collections |
| `backend_uploads` | `/app/uploads` | Doctor profile pictures, audio files |
| `backend_public` | `/app/public` | Served static assets |
| `ai_vectorstore` | `/app/vectorstore` | FAISS index (`db_faiss/`) |
| `ai_models` | `/app/models` | Cached HuggingFace model weights |

---

### 5.3.5 Minimum Hardware Requirements

| Resource | Development | Production (Recommended) |
|---|---|---|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Disk | 20 GB | 50 GB SSD |
| OS | Linux / macOS / Windows (WSL2) | Ubuntu 22.04 LTS |
| Docker | 24+ | 24+ with Docker Compose v2 |

The AI service is the most resource-intensive container due to faster-whisper transcription (CPU-bound) and the HuggingFace embedding model held in memory (~90 MB). A minimum of 4 GB RAM should be reserved for the `medicare_ai` container in production.

---

## 5.4 Tools and Techniques

The development of MediCare AI employed a structured set of tools spanning code editing, API testing, database inspection, version control, and design, chosen to maximise productivity across the three-service architecture.

---

### 5.4.1 Development Environment

**Visual Studio Code** served as the primary integrated development environment for all three services. Its polyglot support — JavaScript/JSX for the frontend, Node.js for the backend, and Python for the AI service — combined with extensions such as ESLint, Prettier, Tailwind CSS IntelliSense, and Pylance made it suitable for the full-stack workload without switching editors. The Remote – Containers extension was used to open each service inside its Docker container during integration testing, ensuring that the development runtime exactly matched the production environment.

**Node.js 20 LTS** (with npm) was used for both the frontend build toolchain (Vite, TailwindCSS CLI) and the backend runtime. **Python 3.11** was the interpreter for the AI service, managed through the `uv` package manager which provides faster dependency resolution than pip alone and generates a fully reproducible lock file (`uv.lock`).

---

### 5.4.2 API Development and Testing

**Postman** was used extensively for manual API development and contract testing throughout the backend build. Collections were created for the three major API groups — Auth, Appointments, and AI Proxy — and shared across the team. Environment variables within Postman held the base URL and authentication cookie values, allowing the full request chain (login → book → join → end) to be executed sequentially against a local or staging server.

For automated integration testing of the AI service, **FastAPI's built-in Swagger UI** (accessible at `/docs`) provided an interactive contract explorer that allowed testing the `/chat` and `/transcribe-and-summarise` endpoints directly from the browser without any additional tooling.

---

### 5.4.3 Database Tooling

**MongoDB Compass** was used for database inspection during development. Its visual collection browser and aggregation pipeline builder were particularly useful for inspecting the `Appointment` collection's populated references (doctor, patient, schedule slot) and for verifying the output of the auto-cancel utility without writing ad-hoc scripts.

---

### 5.4.4 Design and Prototyping

The UI was designed code-first using **TailwindCSS** with a strict three-colour design token system (Navy, Teal, Chalk) established upfront. No external component library was used; all interactive elements — carousels, modals, accordions, animated cards — were implemented from scratch in JSX with Tailwind utility classes. Reference designs for section layouts were sketched informally before implementation to align the visual hierarchy across the fifteen application pages.

---

### 5.4.5 AI Pipeline Development Techniques

The RAG pipeline was developed iteratively using **Streamlit** (`medibot.py`), which provided a rapid browser-based chat UI for testing the retrieval quality, prompt engineering, and LLM response accuracy before the FastAPI endpoint was wired up. This decoupled the AI development from the web application development, allowing the retrieval and summarisation logic to be validated independently. FAISS index quality was assessed by inspecting returned source chunks for relevance against known symptom queries drawn from the five source medical textbooks.

**faster-whisper** model selection was determined by benchmarking the `tiny`, `base`, and `small` models against a set of synthetic consultation recordings, balancing transcription accuracy against CPU inference time. The `base` model was selected as the production default, offering sufficient accuracy for structured medical dialogue within an acceptable processing window.

---

### 5.4.6 Containerisation and Deployment Tooling

**Docker Desktop** (with WSL2 backend on Windows) was used during development to build and run the multi-container stack. **Docker Compose v2** orchestrated service startup, volume mounting, and inter-container networking. Multi-stage Dockerfile patterns were applied to both the frontend and backend builds to minimise final image sizes by excluding build-time dependencies from the production layers.

---

## 5.5 Best Practices / Coding Standards

The MediCare AI codebase was developed under a consistent set of coding standards and architectural best practices applied uniformly across all three services to ensure maintainability, security, and readability.

---

### 5.5.1 Code Organisation and Separation of Concerns

Each service enforces a strict separation between routing, business logic, and data access. In the backend, Express route files in `Routes/` contain only route declarations and middleware chains; all business logic lives in the corresponding `Controlers/` files; and all database interactions are encapsulated within Mongoose model methods or explicit queries in the controllers. No controller directly imports another controller, and no route file contains inline logic beyond parameter extraction.

In the frontend, each page component in `src/pages/` is a self-contained module responsible for its own data fetching, local state management, and rendering. Shared logic such as authentication state and cookie inspection is extracted into the `useAuth.js` custom hook, which is consumed by protected route wrappers rather than duplicated across pages.

---

### 5.5.2 Security Standards

All passwords are hashed with **bcrypt** at a cost factor of 10 before storage; plaintext passwords are never logged, stored, or transmitted after the initial request body has been processed. Authentication tokens are stored exclusively in **httpOnly, Secure, SameSite=Strict cookies**, making them inaccessible to JavaScript running in the browser and immune to cross-site request forgery without a valid same-origin cookie.

All file uploads pass through **Multer** with explicit MIME type whitelists and file size limits before being written to disk. Uploaded filenames are replaced with randomly generated UUIDs to prevent path traversal and filename collision attacks. The backend applies **helmet** middleware globally to set Content-Security-Policy, X-Frame-Options, and other protective HTTP headers on every response. **express-rate-limit** restricts the login endpoints to a maximum of ten requests per minute per IP address to mitigate brute-force attacks.

Input from the client is never interpolated directly into MongoDB queries; Mongoose's schema-based query API and typed model methods provide structural protection against NoSQL injection. All environment variables containing secrets are read exclusively through `process.env` populated by `dotenv` from a `.env` file that is excluded from version control via `.gitignore`.

---

### 5.5.3 Error Handling

The backend applies a consistent HTTP status code vocabulary: `200` for successful reads, `201` for successful resource creation, `400` for malformed or invalid requests, `401` for unauthenticated access, `403` for authorisation failures, `404` for missing resources, `409` for business-rule conflicts (overlapping appointments, duplicate schedule slots), and `500` for unexpected server errors. Error responses always include a JSON body with a `message` field and, where applicable, a `type` field that the frontend uses to render contextually appropriate error banners without parsing message strings.

In the AI service, FastAPI's exception handler middleware catches all unhandled exceptions and returns structured JSON error responses with HTTP 500, preventing raw Python tracebacks from leaking to clients.

---

### 5.5.4 Frontend Code Standards

All React components use **functional components with hooks** exclusively; no class components are present. State is kept as local as possible — lifted to a parent only when two or more siblings need to share it. Side effects (data fetching, subscriptions, timers) are confined to `useEffect` hooks with explicit dependency arrays and cleanup functions to prevent memory leaks from stale closures and uncleared intervals.

Inline styles are avoided except where a value must be dynamically computed (e.g., `objectPosition` for per-image carousel alignment). All other styling is expressed through Tailwind utility classes to maintain visual consistency and enable the JIT compiler to purge unused styles from the production bundle. Magic numbers are replaced with named constants or derived from the three-colour token system.

---

### 5.5.5 Naming Conventions

The project adopts consistent naming conventions across all layers. Backend field names use `snake_case` to match MongoDB document conventions (e.g., `first_Name`, `last_Name`, `contact_Number`, `sechdule_Id`). JavaScript variables and functions use `camelCase`. React components and their files use `PascalCase`. Python modules and functions follow PEP 8 `snake_case`. CSS utility classes are Tailwind-generated and therefore follow Tailwind's own naming system without custom class names except where a keyframe animation requires a named class (e.g., `scroll-up`, `anim-fadeup`).

---

### 5.5.6 Comments and Documentation

Code comments are written sparingly and only where the intent is non-obvious from the code itself — for example, the note explaining why `sechdule_Id` is spelled with a typo (it is the MongoDB field name as it exists in the database, and correcting it would break all existing documents), or the comment documenting why the VideoSDK script is loaded via CDN rather than npm. Function signatures and API endpoints are documented through FastAPI's automatic OpenAPI schema generation, which derives documentation directly from Pydantic model type annotations, ensuring the documentation is always in sync with the implementation.

---

## 5.6 Version Control

The MediCare AI project uses **Git** for distributed version control with the remote repository hosted on **GitHub**. The repository contains all three services (`FrontEnd/`, `BackEnd/`, `AI/`) in a single monorepo structure, which simplifies cross-service changes and ensures that the repository always represents a coherent, deployable state of the entire platform.

---

### 5.6.1 Branching Strategy

The project follows a simplified **feature branch workflow** adapted for a small development team:

```
main
 └── Edge-Cases-Fixed       ← active development branch
      └── feature/...       ← short-lived feature branches (merged via PR)
```

The `main` branch represents the production-ready state and is protected from direct pushes. All development occurs on the `Edge-Cases-Fixed` branch or short-lived feature branches created from it. Feature branches are named descriptively (e.g., `feature/ai-notes-pdf`, `feature/reschedule-token`, `fix/slot-conflict-check`) and are merged back through pull requests after review.

---

### 5.6.2 Commit Conventions

Commits follow a structured message format that makes the history scannable and useful as a changelog:

```
<type>: <short imperative description>

<optional body explaining the why, not the what>
```

Common types used in the project include `feat` (new feature), `fix` (bug fix), `refactor` (structural improvement with no behaviour change), `style` (UI-only changes), `docs` (documentation), and `chore` (build scripts, dependency updates). Representative commits from the project history include:

- `feat: add reschedule token redeem flow for cancelled appointments`
- `fix: prevent overlapping appointment booking with conflict check`
- `feat: integrate faster-whisper audio transcription with mixed recording`
- `style: redesign all auth pages with Navy/Teal/Chalk design system`
- `chore: add Docker Compose deployment configuration`

---

### 5.6.3 .gitignore Configuration

The `.gitignore` file excludes all categories of files that must not enter version control:

- **Secrets and configuration** — `.env`, `*.env.*` (all variants except `.env.example`)
- **Generated artefacts** — `node_modules/`, `dist/`, `__pycache__/`, `*.pyc`
- **Large binary data** — `AI/vectorstore/db_faiss/` (rebuilt from PDFs), `AI/models/` (downloaded from HuggingFace)
- **User-uploaded content** — `BackEnd/uploads/*` (persisted via Docker volume in production)
- **IDE and OS metadata** — `.vscode/settings.json`, `.DS_Store`, `Thumbs.db`

The `.env.example` file is explicitly included in version control as a template that documents all required environment variables without exposing their values.

---

### 5.6.4 Repository Metrics (Project Summary)

| Metric | Value |
|---|---|
| Primary Language | JavaScript (Frontend + Backend) |
| Secondary Language | Python (AI Service) |
| Total Source Files | ~45 |
| Main Branch | `main` |
| Active Development Branch | `Edge-Cases-Fixed` |
| Key Commit Milestones | Authentication · Appointment Booking · Video Integration · AI RAG · Notes PDF · Docker Deployment |
| `.gitignore` Exclusions | `node_modules`, `.env`, `dist`, FAISS index, model weights, uploads |

---

*End of Chapter 5*
