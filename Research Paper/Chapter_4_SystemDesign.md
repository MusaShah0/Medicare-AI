# Chapter 4: System Design

**[Font: Times New Roman, Size 12, Bold]**

---

## Overview

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

This chapter presents the detailed system design of the MediCare AI platform, translating requirements and use cases into technical architecture and data models. System design bridges the gap between abstract requirements (Chapter 2) and concrete implementation details, providing architects, developers, and stakeholders with comprehensive technical specifications and visual representations of system structure. The design chapter includes five essential diagrams: (1) Architecture Diagram illustrating the three-tier microservices architecture with component interactions and external system integrations, (2) Domain Model capturing core business concepts and their relationships, (3) Entity Relationship Diagram with complete data dictionary specifying database schema, field definitions, constraints, and relationships, (4) Class Diagram representing object-oriented design of system components and their interactions, and (5) Sequence Diagrams documenting interaction flows for critical use cases including patient registration, symptom assessment, appointment booking, and video consultation. Each diagram is complemented by detailed narrative explanation, design rationale, and integration points. The design emphasizes loose coupling between microservices, scalability through horizontal expansion, security at multiple layers, and maintainability through clear separation of concerns. This comprehensive design foundation enables consistent implementation across frontend, backend, and AI service components while ensuring system reliability, performance, and extensibility.

---

## 4.1 Architecture Diagram

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 4.1.1 System Architecture Overview

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The MediCare AI platform follows a three-tier microservices architecture designed for scalability, maintainability, and independent deployment of services. The architecture decouples frontend presentation layer, backend business logic layer, and AI intelligence layer, allowing each to scale independently based on demand patterns. This separation of concerns ensures that peak load on one service (e.g., high AI inference demand) does not impact other services (e.g., appointment booking).

### 4.1.2 Architecture Diagram (ASCII)

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (USER INTERFACES)                        │
│                                                                                 │
│    ┌──────────────────────┐              ┌──────────────────────┐             │
│    │  Patient Portal      │              │  Doctor Portal       │             │
│    │  (React 19 + Vite)   │              │  (React 19 + Vite)   │             │
│    │                      │              │                      │             │
│    │ • Symptom Checker    │              │ • Schedule Manager   │             │
│    │ • Doctor Discovery   │              │ • Appointments       │             │
│    │ • Booking            │              │ • Consultations      │             │
│    │ • Video Consultation │              │ • Notes              │             │
│    └──────────────────────┘              └──────────────────────┘             │
│             │                                        │                         │
│             │ HTTPS REST API (Axios)                │                         │
│             │ (localhost:5173)                      │                         │
│             └────────────────────┬───────────────────┘                         │
│                                  │                                             │
└──────────────────────────────────┼─────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER (Business Logic)                           │
│                   Node.js + Express 5 (localhost:4000)                          │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                        REST API Server (Express.js)                    │   │
│  │                                                                        │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────┐  │   │
│  │  │  Authentication &    │  │  Appointment &       │  │  Chat &    │  │   │
│  │  │  User Management     │  │  Schedule Manager    │  │  Session   │  │   │
│  │  │                      │  │                      │  │  Manager   │  │   │
│  │  │ • Register (Patient) │  │ • Create Schedule    │  │            │  │   │
│  │  │ • Register (Doctor)  │  │ • Book Appointment   │  │ • Start    │  │   │
│  │  │ • Login/Logout       │  │ • Cancel Appt        │  │   Chat     │  │   │
│  │  │ • JWT Validation     │  │ • View Appointments  │  │ • Store    │  │   │
│  │  │ • Profile Update     │  │ • Auto-Cancel Slots  │  │   Messages │  │   │
│  │  │                      │  │ • Conflict Detection │  │ • Retrieve │  │   │
│  │  │                      │  │                      │  │   History  │  │   │
│  │  └──────────────────────┘  └──────────────────────┘  └────────────┘  │   │
│  │                                                                        │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                  │   │
│  │  │  Video Consultation  │  │  Meeting Notes &     │                  │   │
│  │  │  Manager             │  │  Documentation       │                  │   │
│  │  │                      │  │                      │                  │   │
│  │  │ • Get VideoSDK Token │  │ • Generate Notes     │                  │   │
│  │  │ • Validate Timing    │  │ • Process Audio      │                  │   │
│  │  │ • Join Room          │  │ • Store Transcript   │                  │   │
│  │  │ • Manage Session     │  │ • Generate PDF       │                  │   │
│  │  │ • Status Update      │  │ • Retrieve Notes     │                  │   │
│  │  └──────────────────────┘  └──────────────────────┘                  │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                    Middleware & Cross-cutting Concerns                 │   │
│  │                                                                        │   │
│  │  • JWT Authentication (Doctor/Patient verification)                   │   │
│  │  • CORS Configuration (Cross-origin resource sharing)                 │   │
│  │  • Error Handling & Logging                                           │   │
│  │  • Input Validation & Sanitization                                    │   │
│  │  • Rate Limiting (100 requests/minute for public endpoints)           │   │
│  │  • Request/Response Compression                                       │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                          │                              │                     │
│        HTTP Proxy        │                              │    HTTP Proxy      │
│   (Axios to AI Service)  │                              │ (VideoSDK & Groq)  │
│                          │                              │                     │
└──────────────────────────┼──────────────────────────────┼─────────────────────┘
                           │                              │
                ┌──────────┘                              └──────────┐
                │                                                   │
                ▼                                                   ▼
    ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
    │  AI SERVICE LAYER               │      │  EXTERNAL SERVICES              │
    │  (Python FastAPI)               │      │                                 │
    │  (localhost:8000)               │      │  ┌─────────────────────────┐   │
    │                                 │      │  │ VideoSDK.live API      │   │
    │  ┌──────────────────────────┐   │      │  │                         │   │
    │  │  RAG Pipeline            │   │      │  │ • Create video rooms   │   │
    │  │  (LangChain + Groq)      │   │      │  │ • Generate JWT tokens  │   │
    │  │                          │   │      │  │ • Manage participants  │   │
    │  │ • Query Embedding        │   │      │  │ • Real-time streaming  │   │
    │  │ • FAISS Search           │   │      │  └─────────────────────────┘   │
    │  │ • Prompt Construction    │   │      │                                 │
    │  │ • LLM Inference          │   │      │  ┌─────────────────────────┐   │
    │  │ • Response Formatting    │   │      │  │ Groq API                │   │
    │  │ • Emergency Detection    │   │      │  │ (LLaMA 3.1 8B)          │   │
    │  │                          │   │      │  │                         │   │
    │  └──────────────────────────┘   │      │  │ • Medical responses     │   │
    │                                 │      │  │ • Consultation summaries│   │
    │  ┌──────────────────────────┐   │      │  │ • Custom instructions  │   │
    │  │  Audio Processing        │   │      │  └─────────────────────────┘   │
    │  │  (Faster-Whisper)        │   │      │                                 │
    │  │                          │   │      │  ┌─────────────────────────┐   │
    │  │ • Transcription          │   │      │  │ MongoDB Database        │   │
    │  │ • Confidence Scoring     │   │      │  │                         │   │
    │  │ • Utterance Timestamps   │   │      │  │ • Patients             │   │
    │  │                          │   │      │  │ • Doctors              │   │
    │  └──────────────────────────┘   │      │  │ • Schedules            │   │
    │                                 │      │  │ • Appointments         │   │
    │  ┌──────────────────────────┐   │      │  │ • Chats                │   │
    │  │  Summarization Engine    │   │      │  │ • Meeting Notes        │   │
    │  │  (Groq LLaMA)            │   │      │  │                         │   │
    │  │                          │   │      │  │ (localhost:27017)       │   │
    │  │ • Meeting Summarization  │   │      │  └─────────────────────────┘   │
    │  │ • Key Point Extraction   │   │      │                                 │
    │  │ • Markdown Formatting    │   │      └─────────────────────────────────┘
    │  │                          │   │
    │  └──────────────────────────┘   │
    │                                 │
    │  ┌──────────────────────────┐   │
    │  │  Vector Database         │   │
    │  │  (FAISS + Embeddings)    │   │
    │  │                          │   │
    │  │ • Medical Textbooks      │   │
    │  │   - Harrison's Manual    │   │
    │  │   - Hutchison's Methods  │   │
    │  │   - Nelson's Pediatrics  │   │
    │  │   - Robbins Pathology    │   │
    │  │   - Gale Encyclopedia    │   │
    │  │                          │   │
    │  └──────────────────────────┘   │
    │                                 │
    └─────────────────────────────────┘


KEY INTEGRATION POINTS:
━━━━━━━━━━━━━━━━━━━━━

1. Frontend → Backend: HTTPS REST API calls with JWT authentication tokens in httpOnly cookies
2. Backend → AI Service: HTTP requests for RAG queries, transcription, summarization
3. Backend → VideoSDK: REST API calls for room creation and token generation
4. Backend → Groq: API calls for LLM inference with API key authentication
5. Backend ↔ MongoDB: Mongoose ODM queries and mutations
6. Frontend ↔ VideoSDK: WebRTC peer connection for real-time media transmission

SCALING CONSIDERATIONS:
━━━━━━━━━━━━━━━━━━━━━

• Horizontal Scaling: Each service can scale independently
  - Frontend: Multiple instances behind load balancer
  - Backend: Multiple Node.js instances with session affinity/distributed sessions
  - AI Service: Multiple FastAPI instances with request queuing
  
• Caching Strategies:
  - Doctor listings cached in-memory (1-hour TTL)
  - Chat history pagination reduces database load
  - Vector embeddings pre-computed and cached
  
• Database Optimization:
  - MongoDB replica set for high availability
  - Indexes on frequently accessed fields
  - Connection pooling to manage database connections
  
• Rate Limiting:
  - 100 requests/minute for public endpoints
  - 1000 requests/minute for authenticated endpoints
  - Exponential backoff for external API calls
```

### 4.1.3 Architecture Characteristics

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Loose Coupling:** Each service communicates through well-defined REST APIs, allowing independent development, testing, and deployment. The Backend acts as orchestrator, hiding complexity of AI Service and external APIs from the Frontend.

**High Cohesion:** Each service encapsulates a specific domain: Frontend handles presentation, Backend handles business logic and scheduling, AI Service handles medical intelligence. This clear separation improves maintainability and testability.

**Stateless Services:** Backend services maintain no server-side session state in memory (state in httpOnly cookies or MongoDB). This enables horizontal scaling without session affinity complexity.

**External Service Abstraction:** VideoSDK and Groq APIs are mediated through Backend, preventing Frontend from directly depending on external services. This simplifies version management and API changes.

**Security Layering:** Multiple security layers—httpOnly cookies, JWT validation, CORS restrictions, input validation, rate limiting—provide defense in depth against various attack vectors.

---

## 4.2 Domain Model

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 4.2.1 Core Business Entities

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The domain model represents core business concepts and their relationships in the MediCare AI platform. The model is organized around two primary actors (Patient and Doctor) and supporting entities managing their interactions (Appointment, Schedule, Chat, MeetingNote).

### 4.2.2 Domain Model Diagram (ASCII)

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN MODEL - MediCare AI                           │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────────┐
                                    │     Patient      │
                                    ├──────────────────┤
                                    │ - PatientID      │
                                    │ - FirstName      │
                                    │ - LastName       │
                                    │ - Email          │
                                    │ - Password       │
                                    │ - Age            │
                                    │ - Gender         │
                                    │ - CreatedAt      │
                                    │ - UpdatedAt      │
                                    └────────┬─────────┘
                                             │
                                 ┌───────────┼───────────┐
                                 │           │           │
                          1      │      0..*│      0..*  │      1
                    ┌────────────┘           │           └────────────┐
                    │                        │                        │
                    │                        ▼                        │
          ┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
          │      Chat       │      │  Appointment     │      │    Doctor    │
          ├─────────────────┤      ├──────────────────┤      ├──────────────┤
          │ - ChatID        │      │ - AppointmentID  │      │ - DoctorID   │
          │ - PatientID     │      │ - PatientID      │      │ - FirstName  │
          │ - SessionID     │      │ - DoctorID       │      │ - LastName   │
          │ - Messages[]    │      │ - ScheduleID     │      │ - Email      │
          │   {sender,      │      │ - MeetingID      │      │ - Password   │
          │   text,         │      │ - Status         │      │ - Phone      │
          │   timestamp}    │      │   (booked/       │      │ - Specialty  │
          │ - CreatedAt     │      │   ongoing/       │      │ - Degrees[]  │
          │ - UpdatedAt     │      │   completed/     │      │ - Profile    │
          │                 │      │   cancelled)     │      │   Picture    │
          └─────────────────┘      │ - CreatedAt      │      │ - CreatedAt  │
                                   │ - UpdatedAt      │      │ - UpdatedAt  │
                                   └────────┬─────────┘      └──────┬───────┘
                                            │                       │
                                      1     │      *                │
                                 ┌──────────┴────────┐               │
                                 │                   │               │
                                 ▼                   ▼               │
                          ┌──────────────┐  ┌──────────────────┐    │
                          │   Schedule   │  │  Meeting Note    │    │
                          ├──────────────┤  ├──────────────────┤    │
                          │ - ScheduleID │  │ - NoteID         │    │
                          │ - DoctorID   │  │ - AppointmentID  │    │
                          │ - Date       │  │ - DoctorID       │    │
                          │ - StartTime  │  │ - PatientID      │    │
                          │ - EndTime    │  │ - Transcript     │    │
                          │ - ClinicFee  │  │ - Summary        │    │
                          │ - SlotDur.   │  │ - PDFPath        │    │
                          │ - Status     │  │ - CreatedAt      │    │
                          │   (available/│  └──────────────────┘    │
                          │   booked/    │                          │
                          │   completed/ │                          │
                          │   cancelled) │                          │
                          │ - CreatedAt  │                          │
                          └──────────────┘                          │
                                                                    │
                                                          1         │ *
                                                          ├─────────┘
                                                          │
                                                    ┌─────────────┐
                                                    │   Review    │
                                                    ├─────────────┤
                                                    │ - ReviewID  │
                                                    │ - DoctorID  │
                                                    │ - PatientID │
                                                    │ - Rating    │
                                                    │ - Comment   │
                                                    │ - CreatedAt │
                                                    └─────────────┘


DOMAIN RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━

• Patient 1 → * Chat: One patient has many chat sessions
• Patient 1 → * Appointment: One patient has many appointments
• Patient * → 1 Appointment → * Doctor: Patients book appointments with doctors
• Doctor 1 → * Schedule: Doctor creates many availability slots
• Doctor 1 → * Appointment: Doctor has many appointments
• Appointment 1 → 1 Schedule: Each appointment references a schedule slot
• Appointment 1 → 1 MeetingNote: Each completed appointment may have notes
• Doctor * ← * Patient: Many doctors, many patients (through Appointment)
• Doctor 1 → * Review: One doctor receives many reviews/ratings

CONSTRAINTS & RULES:
━━━━━━━━━━━━━━━━━━━

• Patient emails must be unique globally
• Doctor emails must be unique globally
• Schedule has unique compound index: (DoctorID, Date, StartTime)
• Appointment can only be created if Schedule status = 'available'
• Patient cannot have overlapping appointments on same date
• Appointment status transitions: booked → ongoing → completed
• Cancelled appointments cannot be rejoined
• Chat sessions retain last 10 messages for context
```

### 4.2.3 Entity Descriptions

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Patient:** Represents an individual user seeking medical guidance and healthcare consultations. Each patient has unique identity (PatientID), personal information (name, email, password), demographics (age, gender), and lifecycle timestamps. Patients initiate chat sessions for symptom assessment and book appointments with doctors.

**Doctor:** Represents licensed healthcare professional managing practice through the platform. Each doctor has unique identity, credentials (specialty, degrees), contact information, and profile picture. Doctors create availability schedules and conduct consultations with patients.

**Chat:** Encapsulates a conversation session between patient and AI symptom checker. Chat maintains ordered message array with sender identification (patient or AI), message text, and timestamp. Each chat associated with single patient session.

**Schedule:** Represents discrete time slot availability offered by doctor. Schedule identified by combination of doctor, date, and start time (unique compound key). Each slot has status (available, booked, completed, cancelled), duration, and fee. Multiple schedules created in bulk for efficiency.

**Appointment:** Represents confirmed consultation between specific patient and doctor at scheduled time. Appointment references patient, doctor, schedule slot, and VideoSDK room ID. Status tracks progression: booked → ongoing → completed. Appointment created only after conflict detection ensures no overlap.

**MeetingNote:** Generated after consultation completion, containing transcript from audio recording, AI-summarized findings, key medical points, and PDF representation. Accessible to both patient and doctor for reference and continuity of care.

**Review:** Optional entity allowing patients to rate doctors and provide feedback (implemented in future versions). Enables social proof and quality assurance mechanisms.

---

## 4.3 Entity Relationship Diagram with Data Dictionary

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 4.3.1 ER Diagram (ASCII)

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ENTITY RELATIONSHIP DIAGRAM                              │
│                          MediCare AI Database Schema                            │
└─────────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────────────┐
                         │      PATIENT            │
                         │  (MongoDB Collection)   │
                         ├─────────────────────────┤
                         │ PK: _id (ObjectID)      │
                         │ ─ firstName: String     │
                         │ ─ lastName: String      │
                         │ ─ email: String (UQ)    │
                         │ ─ password: String (h)  │
                         │ ─ age: Number (opt)     │
                         │ ─ gender: String (opt)  │
                         │ ─ createdAt: Date       │
                         │ ─ updatedAt: Date       │
                         └────────────┬────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
          1      │   N                │ 1    N        1    │   N
        ┌────────┴──────┐      ┌──────┴──────┐   ┌────────┴──────┐
        │    creates    │      │    makes    │   │  participates │
        │      │        │      │      │      │   │      │        │
        │      │        │      │      │      │   │      │        │
        ▼      │        │      ▼      │      │   ▼      │        │
    ┌──────────────────┐  ┌────────────────┐   ┌──────────────────┐
    │      CHAT        │  │  APPOINTMENT   │   │     REVIEW       │
    ├──────────────────┤  ├────────────────┤   ├──────────────────┤
    │ PK: _id          │  │ PK: _id        │   │ PK: _id          │
    │ FK: patientId    │  │ FK: patientId  │   │ FK: doctorId     │
    │ ─ sessionId      │  │ FK: doctorId   │   │ FK: patientId    │
    │ ─ messages[]     │  │ FK: scheduleId │   │ ─ rating: Number │
    │   {sender,       │  │ ─ meetingId    │   │ ─ comment: String│
    │    text,         │  │ ─ status       │   │ ─ createdAt      │
    │    timestamp}    │  │   (enum)       │   └──────────────────┘
    │ ─ createdAt      │  │ ─ createdAt    │
    │ ─ updatedAt      │  │ ─ updatedAt    │
    └──────────────────┘  └────────┬───────┘
                                   │
                            1      │     N
                      ┌────────────┴─────────┐
                      │    references       │
                      │         │            │
                      │         │            │
                      ▼         │            ▼
                  ┌───────────────────┐  ┌──────────────────┐
                  │     SCHEDULE      │  │   MEETING NOTE   │
                  ├───────────────────┤  ├──────────────────┤
                  │ PK: _id           │  │ PK: _id          │
                  │ FK: doctorId      │  │ FK: appointmentId│
                  │ ─ date: Date      │  │ FK: doctorId     │
                  │ ─ startTime: Str  │  │ FK: patientId    │
                  │ ─ endTime: String │  │ ─ transcript     │
                  │ ─ clinicFee: Num  │  │ ─ summary        │
                  │ ─ slotDuration: # │  │ ─ pdfPath        │
                  │ ─ status (enum)   │  │ ─ createdAt      │
                  │ ─ createdAt       │  └──────────────────┘
                  │ ─ updatedAt       │
                  │                   │
                  │ UQ Index:         │
                  │ (doctorId,date,   │
                  │  startTime)       │
                  └───────────────────┘
                           △
                           │
                        1  │  N
                      ┌────┴────┐
                      │  offers  │
                      │    │     │
                      │    │     │
                      │    │     ▼
                  ┌────────────────────┐
                  │      DOCTOR        │
                  ├────────────────────┤
                  │ PK: _id            │
                  │ ─ firstName        │
                  │ ─ lastName         │
                  │ ─ phone: String    │
                  │ ─ email (UQ)       │
                  │ ─ password (h)     │
                  │ ─ specialty        │
                  │ ─ degrees[]        │
                  │ ─ profilePicture   │
                  │ ─ status           │
                  │ ─ createdAt        │
                  │ ─ updatedAt        │
                  └────────────────────┘


INDEXES DEFINED:
━━━━━━━━━━━━━━

Patient:
  • _id (unique, primary)
  • email (unique, for login)

Doctor:
  • _id (unique, primary)
  • email (unique, for login)
  • specialty (for filtering)

Schedule:
  • _id (unique, primary)
  • (doctorId, date, startTime) - unique compound index
  • doctorId (for doctor queries)
  • date (for availability queries)

Appointment:
  • _id (unique, primary)
  • patientId (for patient's appointments)
  • doctorId (for doctor's appointments)
  • status (for filtering by status)
  • date (derived from schedule, for sorting)

Chat:
  • _id (unique, primary)
  • patientId (for patient's chats)
  • sessionId (for session lookup)

MeetingNote:
  • _id (unique, primary)
  • appointmentId (for quick lookup)
  • patientId (for patient's notes)
  • doctorId (for doctor's notes)

Review:
  • _id (unique, primary)
  • doctorId (for doctor reviews)
  • patientId (for patient reviews)
```

### 4.3.2 Data Dictionary

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Table 4.1 - Patient Collection Data Dictionary**

| Field Name | Data Type | Constraints | Description | Example |
|---|---|---|---|---|
| _id | ObjectID | Primary Key | Unique patient identifier | 507f1f77bcf86cd799439011 |
| firstName | String | Required, 1-50 chars | Patient's first name | Fatima |
| lastName | String | Required, 1-50 chars | Patient's family name | Ahmed |
| email | String | Required, Unique | Email address for login | fatima@example.com |
| password | String | Required, Hashed | Bcrypt hashed password | $2b$10$... |
| age | Number | Optional, 18-120 range | Patient's age in years | 28 |
| gender | String (Enum) | Optional: M/F/Other | Biological/identified gender | Female |
| createdAt | Date | Auto-timestamp | Account creation timestamp | 2024-01-10T10:30:00Z |
| updatedAt | Date | Auto-timestamp | Last profile update | 2024-01-15T14:22:30Z |

**Table 4.2 - Doctor Collection Data Dictionary**

| Field Name | Data Type | Constraints | Description | Example |
|---|---|---|---|---|
| _id | ObjectID | Primary Key | Unique doctor identifier | 507f1f77bcf86cd799439012 |
| firstName | String | Required, 1-50 chars | Doctor's first name | Ahmed |
| lastName | String | Required, 1-50 chars | Doctor's family name | Khan |
| phone | String | Required, 11 digits | Pakistan phone number | 03001234567 |
| email | String | Required, Unique | Email for login and contact | ahmed@example.com |
| password | String | Required, Hashed | Bcrypt hashed password | $2b$10$... |
| specialty | String | Required | Medical specialization | Cardiology |
| degrees | [String] | Required, ≥1 item | Array of qualifications | ["MBBS", "MD Cardiology"] |
| profilePicture | String | Required | Filename in /public/pictures/ | doctor_1234567890_abc.jpg |
| status | String (Enum) | Required: active/inactive | Account status | active |
| createdAt | Date | Auto-timestamp | Account creation timestamp | 2024-01-05T09:15:00Z |
| updatedAt | Date | Auto-timestamp | Last profile update | 2024-01-18T16:45:30Z |

**Table 4.3 - Schedule Collection Data Dictionary**

| Field Name | Data Type | Constraints | Description | Example |
|---|---|---|---|---|
| _id | ObjectID | Primary Key | Unique schedule identifier | 507f1f77bcf86cd799439013 |
| doctor | ObjectID | Required, FK | Reference to Doctor | 507f1f77bcf86cd799439012 |
| date | Date | Required | Appointment date (no time) | 2024-01-15 |
| startTime | String | Required, HH:MM format | Slot start time | 14:30 |
| endTime | String | Required, HH:MM format | Slot end time (calculated) | 14:45 |
| clinicFee | Number | Required, > 0 | Consultation fee in PKR | 500 |
| slotDuration | Number | Required | Duration in minutes | 15 |
| status | String (Enum) | Required | available/booked/completed/cancelled | available |
| createdAt | Date | Auto-timestamp | Slot creation timestamp | 2024-01-10T10:00:00Z |
| updatedAt | Date | Auto-timestamp | Last status change | 2024-01-15T14:30:00Z |
| Unique Index | Compound | (doctor, date, startTime) | Prevents duplicate slots | |

**Table 4.4 - Appointment Collection Data Dictionary**

| Field Name | Data Type | Constraints | Description | Example |
|---|---|---|---|---|
| _id | ObjectID | Primary Key | Unique appointment identifier | 507f1f77bcf86cd799439014 |
| patientId | ObjectID | Required, FK | Reference to Patient | 507f1f77bcf86cd799439011 |
| doctorId | ObjectID | Required, FK | Reference to Doctor | 507f1f77bcf86cd799439012 |
| scheduleId | ObjectID | Required, FK | Reference to Schedule | 507f1f77bcf86cd799439013 |
| meetingId | String | Required | VideoSDK room ID | abc123def456ghi789 |
| status | String (Enum) | Required | booked/ongoing/completed/cancelled | booked |
| createdAt | Date | Auto-timestamp | Booking creation timestamp | 2024-01-10T15:45:00Z |
| updatedAt | Date | Auto-timestamp | Last status change | 2024-01-15T14:30:00Z |

**Table 4.5 - Chat Collection Data Dictionary**

| Field Name | Data Type | Constraints | Description | Example |
|---|---|---|---|---|
| _id | ObjectID | Primary Key | Unique chat identifier | 507f1f77bcf86cd799439015 |
| patientId | ObjectID | Required, FK | Reference to Patient | 507f1f77bcf86cd799439011 |
| sessionId | String | Required | Unique session identifier | session_abc123 |
| messages | Array | Max 1000 items | Message array (last 10 kept in context) | [objects] |
| messages[].sender | String (Enum) | Required | patient or ai | patient |
| messages[].text | String | Required | Message content | "I have headaches" |
| messages[].timestamp | Date | Required | Message timestamp | 2024-01-15T14:30:00Z |
| messages[].sources | [String] | Optional | Reference document IDs | ["doc1", "doc2"] |
| createdAt | Date | Auto-timestamp | Chat creation timestamp | 2024-01-15T14:00:00Z |
| updatedAt | Date | Auto-timestamp | Last message timestamp | 2024-01-15T14:30:00Z |

**Table 4.6 - MeetingNote Collection Data Dictionary**

| Field Name | Data Type | Constraints | Description | Example |
|---|---|---|---|---|
| _id | ObjectID | Primary Key | Unique note identifier | 507f1f77bcf86cd799439016 |
| appointmentId | ObjectID | Required, FK | Reference to Appointment | 507f1f77bcf86cd799439014 |
| doctorId | ObjectID | Required, FK | Reference to Doctor | 507f1f77bcf86cd799439012 |
| patientId | ObjectID | Required, FK | Reference to Patient | 507f1f77bcf86cd799439011 |
| transcript | String | Required | Full audio transcription | "Patient reported..." |
| summary | String | Required | AI-generated markdown summary | "# Summary..." |
| pdfPath | String | Required | Path to PDF file | /uploads/notes/note_123.pdf |
| createdAt | Date | Auto-timestamp | Note generation timestamp | 2024-01-15T16:00:00Z |

---

## 4.4 Class Diagram

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 4.4.1 Object-Oriented Design Structure

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The class diagram represents the object-oriented structure of the MediCare AI system, focusing on key classes, their attributes, methods, and relationships. The design emphasizes encapsulation, inheritance, and composition principles to create maintainable and extensible code.

### 4.4.2 Class Diagram (ASCII)

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLASS DIAGRAM - MediCare AI                           │
│                      (Backend & AI Service Components)                          │
└─────────────────────────────────────────────────────────────────────────────────┘

BACKEND LAYER (Node.js/Express):

┌──────────────────────────────────────────────────────────────────────────────┐
│                         User (Abstract Base Class)                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ - userId: ObjectID                                                           │
│ - firstName: String                                                          │
│ - lastName: String                                                           │
│ - email: String                                                              │
│ - password: String (hashed)                                                  │
│ - createdAt: Date                                                            │
│ - updatedAt: Date                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ + generateToken(): String                                                    │
│ + validatePassword(password): Boolean                                        │
│ + updateProfile(updates): void                                               │
│ + getDisplayName(): String                                                   │
│ # validateEmail(email): Boolean        [protected]                           │
└──────────────────────────────────────────────────────────────────────────────┘
                △                                △
                │ extends                       │ extends
                │                               │
    ┌───────────┴──────────┐      ┌────────────┴──────────┐
    │                      │      │                       │
    │                      │      │                       │
    ▼                      │      │                       ▼
┌─────────────────┐        │      │        ┌──────────────────────┐
│    Patient      │        │      │        │      Doctor          │
├─────────────────┤        │      │        ├──────────────────────┤
│ - patientId     │        │      │        │ - doctorId           │
│ - age: Number   │        │      │        │ - phone: String      │
│ - gender: Enum  │        │      │        │ - specialty: String  │
├─────────────────┤        │      │        │ - degrees: [String]  │
│ + getAppointments()      │      │        │ - profilePicture     │
│ + bookAppointment()      │      │        ├──────────────────────┤
│ + cancelAppointment()    │      │        │ + createSchedule()   │
│ + getChats()             │      │        │ + viewAppointments() │
│ + getChatHistory()       │      │        │ + joinConsultation() │
│ + getMedicalRecords()    │      │        │ + generateNotes()    │
│ + rateDoctor()           │      │        │ + cancelAppointment()│
└─────────────────┘        │      │        └──────────────────────┘
                           │      │
                           │      │
    ┌──────────────────────┘      └──────────────────────┐
    │                                                    │
    │                                                    │
    ▼                                                    ▼
┌──────────────────────────┐        ┌────────────────────────────┐
│  PatientController       │        │   DoctorController         │
├──────────────────────────┤        ├────────────────────────────┤
│ - patientService         │        │ - doctorService            │
│ - authService            │        │ - authService              │
│ - appointmentService     │        │ - scheduleService          │
├──────────────────────────┤        ├────────────────────────────┤
│ + register()             │        │ + register()               │
│ + login()                │        │ + login()                  │
│ + getProfile()           │        │ + getProfile()             │
│ + updateProfile()        │        │ + createSchedule()         │
│ + describeSymptoms()     │        │ + viewAppointments()       │
│ + searchDoctors()        │        │ + joinMeeting()            │
│ + bookAppointment()      │        │ + generateNotes()          │
│ + cancelAppointment()    │        └────────────────────────────┘
│ + joinMeeting()          │
│ + viewMedicalRecords()   │
│ + getMeetingNotes()      │
└──────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                    AppointmentService                                   │
├────────────────────────────────────────────────────────────────────────┤
│ - appointmentRepository                                                │
│ - scheduleRepository                                                   │
│ - videoSDKService                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ + bookAppointment(patientId, scheduleId): Appointment                 │
│ + cancelAppointment(appointmentId): Boolean                           │
│ + getPatientAppointments(patientId): [Appointment]                   │
│ + getDoctorAppointments(doctorId): [Appointment]                     │
│ + validateConflict(patientId, date, time): Boolean                   │
│ + updateAppointmentStatus(appointmentId, status): void               │
│ # detectTimeOverlap(start1, end1, start2, end2): Boolean [private]   │
└────────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │ uses
                                   │
                    ┌──────────────┴─────────────┐
                    │                            │
                    ▼                            ▼
        ┌─────────────────────┐      ┌──────────────────────┐
        │  ScheduleService    │      │  VideoSDKService     │
        ├─────────────────────┤      ├──────────────────────┤
        │ - scheduleRepo      │      │ - videoSDKApiClient  │
        ├─────────────────────┤      ├──────────────────────┤
        │ + createSlots()     │      │ + createRoom()       │
        │ + getSlots()        │      │ + generateToken()    │
        │ + deleteSlot()      │      │ + validateTiming()   │
        │ + autoCancelExpired()│     │ + getParticipants()  │
        └─────────────────────┘      └──────────────────────┘


AI SERVICE LAYER (Python/FastAPI):

┌────────────────────────────────────────────────────────────────────────┐
│                      RAGService                                         │
├────────────────────────────────────────────────────────────────────────┤
│ - vectorStore: FAISS                                                   │
│ - embedder: SentenceTransformer                                        │
│ - llmModel: GroqLLaMA                                                  │
│ - langchainChain: RAGChain                                             │
├────────────────────────────────────────────────────────────────────────┤
│ + processQuery(message, history): Response                            │
│ + retrieveDocuments(query, k=3): [Document]                           │
│ + constructPrompt(context, query): String                             │
│ + callLLM(prompt): String                                             │
│ + detectEmergencySymptoms(text): Boolean                              │
│ + formatResponse(rawText): FormattedResponse                          │
│ # getEmbeddings(text): [Float] [private]                              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                   TranscriptionService                                  │
├────────────────────────────────────────────────────────────────────────┤
│ - whisperModel: FasterWhisper                                         │
├────────────────────────────────────────────────────────────────────────┤
│ + transcribeAudio(audioFile): TranscriptionResult                     │
│ + calculateConfidence(utterances): Float                              │
│ + formatTranscript(utterances): String                                │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                  SummarizationService                                   │
├────────────────────────────────────────────────────────────────────────┤
│ - llmModel: GroqLLaMA                                                  │
├────────────────────────────────────────────────────────────────────────┤
│ + summarizeConsultation(transcript, doctorName, patientName): Summary │
│ + extractKeyFindings(text): [String]                                  │
│ + generateMarkdown(summary): String                                   │
└────────────────────────────────────────────────────────────────────────┘


SHARED COMPONENTS:

┌────────────────────────────────────────────────────────────────────────┐
│                      AuthService                                        │
├────────────────────────────────────────────────────────────────────────┤
│ - secretKey: String (patient/doctor-specific)                          │
├────────────────────────────────────────────────────────────────────────┤
│ + register(userData): User                                             │
│ + login(email, password): {token, user}                               │
│ + validateToken(token): {valid, userId, userType}                    │
│ + generateToken(userId, userType, expiryHours): String               │
│ + hashPassword(password): String                                      │
│ + comparePassword(plain, hashed): Boolean                             │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                    ChatService                                          │
├────────────────────────────────────────────────────────────────────────┤
│ - chatRepository                                                       │
│ - ragService                                                           │
├────────────────────────────────────────────────────────────────────────┤
│ + startNewChat(patientId): ChatSession                                │
│ + sendMessage(chatId, message): AIResponse                           │
│ + getChat History(chatId): [Message]                                  │
│ + persistMessage(chatId, message): void                               │
│ + getChatHistory(patientId): [ChatSession]                           │
└────────────────────────────────────────────────────────────────────────┘


RELATIONSHIPS:
━━━━━━━━━━━━━━

→ Association (uses): Service uses another service
△ Inheritance (extends): Doctor/Patient inherit from User
♦ Composition: Service contains repositories and external clients
```

### 4.4.3 Key Design Patterns

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Service Layer Pattern:** Business logic encapsulated in service classes (AppointmentService, ScheduleService, RAGService) independent of controller/route layer, enabling reusability and testability.

**Repository Pattern:** Data access abstraction through repositories (AppointmentRepository, ScheduleRepository) hiding MongoDB complexity from business logic.

**Dependency Injection:** Services receive dependencies (repositories, external clients) through constructor injection, enabling loose coupling and facilitating testing with mock implementations.

**Strategy Pattern:** RAGService encapsulates medical assessment strategy using LangChain RAG pipeline, allowing future algorithm substitution without affecting consumers.

**Factory Pattern:** AuthService acts as factory for User creation, handling password hashing and validation consistently.

---

## 4.5 Sequence Diagrams

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 4.5.1 Critical Interaction Flows

**[Font: Times New Roman, Size 11, Bold, Italicize]**

Sequence diagrams document step-by-step interaction between system actors and components for critical use cases. Five key scenarios are documented: patient registration, symptom assessment through AI, appointment booking, video consultation join, and meeting notes generation.

### 4.5.2 UC-1: Patient Registration Sequence Diagram

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│         SEQUENCE DIAGRAM: Patient Registration (UC-1)                           │
│                                                                                 │
│  Actors: Patient, Frontend, Backend API, AuthService, Patient Repository, DB  │
└─────────────────────────────────────────────────────────────────────────────────┘

Patient         Frontend        Backend         AuthService      PatientRepo      MongoDB
  │               │               │                 │                 │             │
  │ 1. Click      │               │                 │                 │             │
  │ Sign Up       │               │                 │                 │             │
  ├──────────────→│               │                 │                 │             │
  │               │ 2. Display    │                 │                 │             │
  │               │ Registration  │                 │                 │             │
  │               │ Form          │                 │                 │             │
  │               ├──────────────→│                 │                 │             │
  │               │               │                 │                 │             │
  │ 3. Fill Form  │               │                 │                 │             │
  │ & Submit      │               │                 │                 │             │
  ├──────────────→│               │                 │                 │             │
  │               │ 4. POST /P_SignUp               │                 │             │
  │               │ {firstName, lastName,            │                 │             │
  │               │  email, password, age, gender}  │                 │             │
  │               ├──────────────→│                 │                 │             │
  │               │               │ 5. Validate    │                 │             │
  │               │               │ Input          │                 │             │
  │               │               │                 │                 │             │
  │               │               │ 6. Hash        │                 │             │
  │               │               │ Password       │                 │             │
  │               │               ├────────────────→│                 │             │
  │               │               │                 │ 7. Hash         │             │
  │               │               │                 │ (bcrypt)        │             │
  │               │               │←────────────────┤                 │             │
  │               │               │                 │ Return hashed   │             │
  │               │               │                 │ password        │             │
  │               │               │                 │                 │             │
  │               │               │ 8. Create PatientDoc              │             │
  │               │               ├─────────────────────────────────→│             │
  │               │               │                 │                 │             │
  │               │               │                 │                 │ 9. Insert  │
  │               │               │                 │                 │ to MongoDB │
  │               │               │                 │                 ├───────────→│
  │               │               │                 │                 │             │
  │               │               │                 │                 │ 10. Return │
  │               │               │                 │                 │ _id        │
  │               │               │                 │                 │←───────────┤
  │               │               │                 │                 │             │
  │               │               │ 11. Generate   │                 │             │
  │               │               │ JWT Token      │                 │             │
  │               │               ├────────────────→│                 │             │
  │               │               │                 │ 12. Create      │             │
  │               │               │                 │ Token with      │             │
  │               │               │                 │ P_SecretKey     │             │
  │               │               │                 │                 │             │
  │               │               │←────────────────┤                 │             │
  │               │               │ Token (6h exp)  │                 │             │
  │               │               │                 │                 │             │
  │               │ 13. Response  │                 │                 │             │
  │               │ {token, user} │                 │                 │             │
  │               │←──────────────┤                 │                 │             │
  │               │               │                 │                 │             │
  │               │ 14. Store JWT │                 │                 │             │
  │               │ in httpOnly   │                 │                 │             │
  │               │ cookie        │                 │                 │             │
  │               │               │                 │                 │             │
  │               │ 15. Store     │                 │                 │             │
  │               │ patientData   │                 │                 │             │
  │               │ in localStorage│                 │                 │             │
  │               │               │                 │                 │             │
  │               │ 16. Redirect  │                 │                 │             │
  │               │ to Dashboard  │                 │                 │             │
  │               │               │                 │                 │             │
  │ 17. Success   │               │                 │                 │             │
  │ Message       │               │                 │                 │             │
  │←──────────────┤               │                 │                 │             │
  │               │               │                 │                 │             │


KEY OPERATIONS:
━━━━━━━━━━━━━━

Step 5: Input Validation
  • Email format check (RFC 5322)
  • Email uniqueness query: SELECT * FROM patients WHERE email = ?
  • Password complexity: 8+ chars, 1 upper, 1 lower, 1 num, 1 special
  • Age range: 18-120 (if provided)

Step 7: Password Hashing
  • Algorithm: Bcrypt
  • Salt rounds: 10
  • Output: $2b$10$...(60 chars)

Step 9: Database Insert
  • Collection: patients
  • Document: {firstName, lastName, email, password, age, gender, createdAt, updatedAt}
  • TTL: None (documents persist indefinitely)

Step 12: Token Creation
  • Claims: patientId, email, userType: 'patient', iat, exp (now + 6h)
  • Signature: HMAC-SHA256(header.payload, P_SecretKey)
  • Result: JWT eyJhbGc...

Step 14-15: Client-Side Storage
  • HttpOnly cookie: Browser only, not JavaScript accessible
  • LocalStorage: patientData (name only, for UI display)
```

### 4.5.3 UC-2: Symptom Assessment and AI Response Sequence Diagram

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│    SEQUENCE DIAGRAM: AI Symptom Assessment (UC-2)                              │
│                                                                                 │
│  Actors: Patient, Frontend, Backend API, AI Service, RAGService, Groq API, FAISS│
└─────────────────────────────────────────────────────────────────────────────────┘

Patient      Frontend       Backend        AI Service      RAGService      Groq      FAISS
  │            │              │               │              │              │         │
  │ 1. Type    │              │               │              │              │         │
  │ Symptoms   │              │               │              │              │         │
  ├───────────→│              │               │              │              │         │
  │            │ 2. Display   │               │              │              │         │
  │            │ Loading      │               │              │              │         │
  │            │ Indicator    │               │              │              │         │
  │            │              │               │              │              │         │
  │            │ 3. POST /chat                │               │              │         │
  │            │ {message, sessionId,         │               │              │         │
  │            │  chatHistory[]}             │               │              │         │
  │            ├─────────────→│               │               │              │         │
  │            │              │ 4. Create/   │               │              │         │
  │            │              │ Validate     │               │              │         │
  │            │              │ Chat Session │               │              │         │
  │            │              │              │               │              │         │
  │            │              │ 5. Store     │               │              │         │
  │            │              │ Patient      │               │              │         │
  │            │              │ Message in   │               │              │         │
  │            │              │ Database     │               │              │         │
  │            │              │              │               │              │         │
  │            │              │ 6. Forward to AI Service      │              │         │
  │            │              ├──────────────→│               │              │         │
  │            │              │               │ 7. Apply    │               │         │
  │            │              │               │ History-    │               │         │
  │            │              │               │ Aware       │               │         │
  │            │              │               │ Retriever   │               │         │
  │            │              │               ├────────────→│               │         │
  │            │              │               │              │ 8. Make      │         │
  │            │              │               │              │ Query        │         │
  │            │              │               │              │ Standalone   │         │
  │            │              │               │              │              │         │
  │            │              │               │←────────────┤              │         │
  │            │              │               │ Standalone  │ Rephrased    │         │
  │            │              │               │ Query       │ Query        │         │
  │            │              │               │             │              │         │
  │            │              │               │ 9. Convert to Embeddings    │         │
  │            │              │               ├────────────→│              │         │
  │            │              │               │              │ 10. Generate│         │
  │            │              │               │              │ Embeddings  │         │
  │            │              │               │              │ (384-dim)   │         │
  │            │              │               │              │             │         │
  │            │              │               │              │ 11. Vector  │         │
  │            │              │               │              │ Embedding   │         │
  │            │              │              │←──────────────┤            │         │
  │            │              │               │ Vector       │ Embedding   │         │
  │            │              │               │              │             │         │
  │            │              │               │ 12. FAISS Similarity Search           │
  │            │              │               ├─────────────────────────────────────→│
  │            │              │               │              │             │         │
  │            │              │               │              │             │ 13. Find│
  │            │              │               │              │             │ k=3     │
  │            │              │               │              │             │ Chunks  │
  │            │              │               │              │             │         │
  │            │              │               │←─────────────────────────────────────┤
  │            │              │               │ Retrieved chunks (medical text)      │
  │            │              │               │              │             │         │
  │            │              │               │ 14. Construct LLM Prompt             │
  │            │              │               ├────────────→│              │         │
  │            │              │               │              │ 15. Build:  │         │
  │            │              │               │              │ system_prompt+         │
  │            │              │               │              │ retrieved_context+     │
  │            │              │               │              │ user_query  │         │
  │            │              │               │              │             │         │
  │            │              │               │ 16. Call Groq LLaMA 3.1 8B          │
  │            │              │               ├──────────────────────────→│         │
  │            │              │               │              │             │         │
  │            │              │               │              │             │ 17. LLM│
  │            │              │               │              │             │ Inference│
  │            │              │               │              │             │ temp=0.3│
  │            │              │               │              │             │ max=1000│
  │            │              │               │              │             │ tokens  │
  │            │              │               │              │             │         │
  │            │              │               │←──────────────────────────┤         │
  │            │              │               │ Response text (generated)  │         │
  │            │              │               │              │             │         │
  │            │              │               │ 18. Detect  │             │         │
  │            │              │               │ Emergency   │             │         │
  │            │              │               │ Symptoms    │             │         │
  │            │              │               │              │             │         │
  │            │              │               │ 19. Format  │             │         │
  │            │              │               │ Response    │             │         │
  │            │              │               │ with        │             │         │
  │            │              │               │ Sections    │             │         │
  │            │              │               │              │             │         │
  │            │              │               │ 20. Return  │             │         │
  │            │              │ Response      │             │             │         │
  │            │              │ {response,    │             │             │         │
  │            │              │ sources,      │             │             │         │
  │            │              │ confidence}   │             │             │         │
  │            │              │←──────────────┤             │             │         │
  │            │              │               │             │             │         │
  │            │              │ 21. Store    │             │             │         │
  │            │              │ AI Response  │             │             │         │
  │            │              │ in Chat DB   │             │             │         │
  │            │              │              │             │             │         │
  │            │ Response with│              │             │             │         │
  │            │ sections &   │              │             │             │         │
  │            │ disclaimer   │              │             │             │         │
  │            │←─────────────┤              │             │             │         │
  │            │              │              │             │             │         │
  │ 22. Read   │              │              │             │             │         │
  │ Assessment │              │              │             │             │         │
  │ & Medical  │              │              │             │             │         │
  │ Disclaimer │              │              │             │             │         │
  │←───────────┤              │              │             │             │         │
  │            │              │              │             │             │         │


RESPONSE STRUCTURE (Step 20):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "response": "⚠️ [Medical Disclaimer]\n\n📋 Understanding Your Symptoms...\n\n🔍 Possible Conditions...",
  "sources": ["doc_id_1", "doc_id_2", "doc_id_3"],
  "documents": ["Harrison's Manual excerpt 1", "Hutchison's Methods excerpt 2", ...],
  "confidence": 0.87,
  "emergencyDetected": false,
  "emergencyWarning": null
}

TIMING PROFILE:
━━━━━━━━━━━━━

Step 8-10 (History-Aware Retrieval): ~100-200ms
Step 12-13 (Vector Search in FAISS): ~50-100ms  
Step 17 (LLM Inference via Groq): ~2000-3500ms
Step 18-19 (Response Formatting): ~200-300ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~2500-4100ms (3-5 seconds typical)
```

### 4.5.4 UC-4: Appointment Booking Sequence Diagram

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│         SEQUENCE DIAGRAM: Appointment Booking (UC-4)                            │
│                                                                                 │
│  Actors: Patient, Frontend, Backend, AppointmentService, VideoSDK, Databases   │
└─────────────────────────────────────────────────────────────────────────────────┘

Patient      Frontend       Backend        AppointmentService   VideoSDK    Databases
  │            │              │                  │                │            │
  │ 1. View    │              │                  │                │            │
  │ Calendar   │              │                  │                │            │
  ├───────────→│              │                  │                │            │
  │            │ 2. GET /Show │                  │                │            │
  │            │ _Appoitment  │                  │                │            │
  │            │ _Sechdule/   │                  │                │            │
  │            │ :doctorId    │                  │                │            │
  │            ├─────────────→│                  │                │            │
  │            │              │ 3. Query        │                │            │
  │            │              │ Available Slots │                │            │
  │            │              ├─────────────────────────────────────────────→│
  │            │              │                 │                │         Query │
  │            │              │                 │                │         MongoDB│
  │            │              │←─────────────────────────────────────────────┤
  │            │              │ Schedules       │                │         Slots  │
  │            │              │ (raw)           │                │            │
  │            │              │                 │                │            │
  │            │              │ 4. Auto-Cancel  │                │            │
  │            │              │ Expired         │                │            │
  │            │              │                 │                │            │
  │            │              │ 5. Return       │                │            │
  │            │ Available    │ Available Slots │                │            │
  │            │ Slots        │                 │                │            │
  │            │←─────────────┤                 │                │            │
  │            │              │                 │                │            │
  │ 6. Select  │              │                 │                │            │
  │ Slot &     │              │                 │                │            │
  │ Confirm    │              │                 │                │            │
  ├───────────→│              │                 │                │            │
  │            │ 7. POST      │                 │                │            │
  │            │ /Book_       │                 │                │            │
  │            │ Appointment/ │                 │                │            │
  │            │ :scheduleId  │                 │                │            │
  │            │ {patientId,  │                 │                │            │
  │            │ doctorId}    │                 │                │            │
  │            ├─────────────→│                 │                │            │
  │            │              │ 8. Validate    │                │            │
  │            │              │ Schedule       │                │            │
  │            │              ├────────────────→│                │            │
  │            │              │                 │ 9. Check      │            │
  │            │              │                 │ Status ==     │            │
  │            │              │                 │ 'available'   │            │
  │            │              │                 │ ?             │            │
  │            │              │                 │                │            │
  │            │              │                 │ 10. Detect    │            │
  │            │              │                 │ Conflicts     │            │
  │            │              │                 │ (UC-9)        │            │
  │            │              │                 │                │            │
  │            │              │                 │ Query:        │            │
  │            │              │                 │ Appointments  │            │
  │            │              │                 │ where patient │            │
  │            │              │                 │ on this date  │            │
  │            │              │                 ├──────────────────────────→│
  │            │              │                 │                │         Query │
  │            │              │                 │                │         MongoDB│
  │            │              │                 │←──────────────────────────┤
  │            │              │                 │ [no overlaps] │         Result  │
  │            │              │                 │                │            │
  │            │              │                 │ 11. Create    │            │
  │            │              │                 │ VideoSDK Room │            │
  │            │              │                 ├───────────────→│           │
  │            │              │                 │                │ Room ID:  │
  │            │              │                 │                │ abc123... │
  │            │              │                 │←───────────────┤           │
  │            │              │                 │ room_id        │            │
  │            │              │                 │                │            │
  │            │              │                 │ 12. Create    │            │
  │            │              │                 │ Appointment   │            │
  │            │              │                 │ Document      │            │
  │            │              │                 ├──────────────────────────→│
  │            │              │                 │                │         Insert │
  │            │              │                 │                │         Appt   │
  │            │              │                 │                │            │
  │            │              │                 │ 13. Update    │            │
  │            │              │                 │ Schedule      │            │
  │            │              │                 │ status        │            │
  │            │              │                 │ available →   │            │
  │            │              │                 │ booked        │            │
  │            │              │                 ├──────────────────────────→│
  │            │              │                 │                │         Update │
  │            │              │                 │                │         Slot   │
  │            │              │                 │←──────────────────────────┤
  │            │              │                 │ Confirmed     │            │
  │            │              │                 │                │            │
  │            │              │ Response        │                │            │
  │            │              │ {appointmentId, │                │            │
  │            │              │ meetingId,      │                │            │
  │            │              │ details}        │                │            │
  │            │              │←────────────────┤                │            │
  │            │              │                 │                │            │
  │ 14. Success│              │                 │                │            │
  │ Message &  │              │                 │                │            │
  │ Appt Details│             │                 │                │            │
  │←───────────┤              │                 │                │            │
  │            │              │                 │                │            │


CONFLICT DETECTION (UC-9 - Step 10):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Query to MongoDB:
  db.appointments.find({
    patientId: patientId,
    date: appointmentDate,
    status: { $in: ['booked', 'ongoing'] },
    startTime: { $lt: selectedEndTime },
    endTime: { $gt: selectedStartTime }
  })

If result empty: No conflict, proceed
If result has records: Conflict detected, return 409 error

Database-Level Protection:
  Unique Index on Schedule: (doctorId, date, startTime)
  Prevents duplicate slot creation at DB level

TIMING PROFILE:
━━━━━━━━━━━━━

Step 8-9 (Schedule Validation): ~50ms
Step 10 (Conflict Detection Query): ~100-200ms
Step 11 (VideoSDK Room Creation): ~500-1000ms
Step 12-13 (DB Operations): ~100-200ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~750-1450ms (< 2 seconds typical)
```

---

## 4.5.5 UC-5: Video Consultation Join Sequence Diagram

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
Patient    Frontend    Backend    VideoSDK    AppointmentRepo    Database
  │          │          │           │              │               │
  │ Click    │          │           │              │               │
  │ Join Now │          │           │              │               │
  ├─────────→│          │           │              │               │
  │          │ GET      │           │              │               │
  │          │ /join-meeting        │              │               │
  │          ├─────────→│           │              │               │
  │          │          │ Validate  │              │               │
  │          │          │ Timing    │              │               │
  │          │          ├──────────────────────────→│               │
  │          │          │           │              │ Query Appt    │
  │          │          │           │              ├──────────────→│
  │          │          │           │              │         Query │
  │          │          │           │              │         MongoDB
  │          │          │           │              │←──────────────┤
  │          │          │           │              │ Return Appt   │
  │          │          │           │              │ & Schedule    │
  │          │          │           │              │               │
  │          │          │ Check timing valid?      │               │
  │          │          │ date, time window OK?    │               │
  │          │          │ ✓ PASSED                 │               │
  │          │          │           │              │               │
  │          │          │ Update status:           │               │
  │          │          │ booked → ongoing         │               │
  │          │          ├──────────────────────────→│               │
  │          │          │           │              │ Update in DB  │
  │          │          │           │              ├──────────────→│
  │          │          │           │              │←──────────────┤
  │          │          │           │              │ Confirmed     │
  │          │          │           │              │               │
  │          │          │ Generate JWT Token       │               │
  │          │          │ {room_id, user, exp}    │               │
  │          │ Response │           │              │               │
  │          │ {token}  │           │              │               │
  │          │←─────────┤           │              │               │
  │          │          │           │              │               │
  │          │ Init     │           │              │               │
  │          │ VideoSDK │           │              │               │
  │          ├──────────────────────→│             │               │
  │          │          │           │ WebRTC      │               │
  │          │          │           │ Connection  │               │
  │          │          │           │ Established │               │
  │ Grant    │          │           │             │               │
  │ Camera/  │          │           │             │               │
  │ Mic      │          │           │             │               │
  ├─────────→│          │           │             │               │
  │          │ Video/   │           │             │               │
  │          │ Audio    │           │             │               │
  │          │ Stream   │           │             │               │
  │          ├──────────────────────→│            │               │
  │          │          │           │ Participant│               │
  │          │          │           │ Presence   │               │
  │          │          │           │             │               │
  │ Display  │          │           │             │               │
  │ Participant          │           │             │               │
  │ List     │          │           │             │               │
  │ (await   │          │           │             │               │
  │ doctor)  │          │           │             │               │
  │←─────────┤          │           │             │               │
  │          │          │           │             │               │
  │ Doctor   │          │           │             │               │
  │ Joins    │          │           │             │               │
  │ (same)   │          │           │             │               │
  │          │          │           │             │               │
  │ Video    │          │           │             │               │
  │ Call     │          │           │             │               │
  │ Established        │           │             │               │
  │←─────────┤          │           │             │               │
  │          │          │           │             │               │
  │ [Consultation continues]        │             │               │
  │          │          │           │             │               │
  │ Auto     │          │ At endTime│             │               │
  │ Terminate│          │ Update to │             │               │
  │          │          │ 'completed'            │               │
  │          │          ├──────────────────────────→│               │
  │          │          │           │              │ Update DB    │
  │          │          │           │              ├──────────────→│
  │ Appt     │          │           │              │               │
  │ Complete │          │           │              │               │
  │←─────────┤          │           │              │               │
  │          │          │           │              │               │


TIMING VALIDATION:
current_date == appointment_date ✓
current_time in [start-5min, end+5min] ✓
Status: 'booked' (not cancelled/completed) ✓
VideoSDK room exists ✓

AUTO-COMPLETE via setTimeout at appointmentEndTime
```

---

## 4.6 State Transition and Component Diagrams

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 4.6.1 Appointment State Lifecycle

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
Initial → booked (Patient books, conflicts pass, VideoSDK room created)
booked → ongoing (Patient/Doctor joins within time window)
booked → cancelled (Patient cancels within 24h or auto-cancel expires)
ongoing → completed (Auto-transition at appointmentEndTime)
cancelled/completed → TERMINAL (No further transitions, historical record)

Key Transitions:
• booked ↔ cancelled (24-hour policy, with warnings)
• booked → ongoing (Timing validation: within [start-5min, end+5min])
• ongoing → completed (Automatic, via setTimeout at endTime)
```

### 4.6.2 Component Architecture

**[Font: Times New Roman, Size 11, Bold, Italicize]**

```
CLIENT TIER:
├── Frontend Web App (React 19)
│   ├── Patient Portal
│   ├── Doctor Portal
│   ├── Shared Services (Axios HTTP, Auth Handler)
│   └── VideoSDK Component Integration

APPLICATION TIER:
├── Backend API (Node.js + Express)
│   ├── Controllers/Routes
│   ├── Service Layer
│   │   ├── AuthService
│   │   ├── AppointmentService
│   │   ├── ScheduleService
│   │   ├── ChatService
│   │   └── [More services]
│   ├── Repository Layer
│   │   ├── PatientRepository
│   │   ├── DoctorRepository
│   │   ├── AppointmentRepository
│   │   └── [More repositories]
│   └── Middleware
│       ├── JWT Authentication
│       ├── Authorization
│       ├── Error Handling
│       └── Rate Limiting

├── AI Service (Python FastAPI)
│   ├── RAGService (LangChain, FAISS, Groq)
│   ├── TranscriptionService (Faster-Whisper)
│   └── SummarizationService

DATA TIER:
└── MongoDB (Patient, Doctor, Schedule, Appointment, Chat, MeetingNote Collections)

EXTERNAL SERVICES:
├── VideoSDK.live (Video infrastructure)
├── Groq API (LLaMA 3.1 8B)
└── FAISS Vector Store (Medical knowledge)
```

---

## 4.7 Design Patterns and Architecture Principles

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

**Architectural Patterns:**

1. **Microservices Architecture:** Three independent services (Frontend, Backend, AI) communicate through REST APIs, enabling independent scaling and deployment.

2. **Service Layer Pattern:** Business logic encapsulated in service classes (AppointmentService, ChatService, RAGService) separate from routing concerns, enabling reusability and testability.

3. **Repository Pattern:** Data access abstraction through repositories (AppointmentRepository, PatientRepository) hiding MongoDB complexity from business logic.

4. **Dependency Injection:** Services receive dependencies through constructors, enabling loose coupling and facilitating testing with mock implementations.

5. **Factory Pattern:** AuthService acts as factory for User objects, consistently handling password hashing, token generation, and validation.

6. **Strategy Pattern:** RAGService encapsulates medical assessment strategy through LangChain, allowing future algorithm substitution without affecting consumers.

**SOLID Principles Application:**

- **Single Responsibility:** Each service has single, well-defined purpose
- **Open/Closed:** Services open for extension through inheritance but closed for modification
- **Liskov Substitution:** Doctor and Patient substitutable through User base class
- **Interface Segregation:** Services expose focused interfaces, clients depend on needed methods
- **Dependency Inversion:** Backend depends on service abstractions, not concrete implementations

---

## Summary

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

This chapter has presented comprehensive system design of the MediCare AI platform through essential diagrams and detailed technical specifications. The architecture diagram illustrates the three-tier microservices design with independent scalability and loose coupling between Frontend, Backend, and AI Service layers. The domain model captures core business entities (Patient, Doctor, Appointment, Schedule, Chat, MeetingNote) and their relationships. The entity relationship diagram with complete data dictionary provides detailed MongoDB collection specifications, field definitions, constraints, and indexes. The class diagram documents object-oriented design with key services, repositories, and established design patterns. Sequence diagrams for patient registration, symptom assessment, appointment booking, and video consultation document critical interaction flows with precise timing profiles and step-by-step operations. State transition diagram illustrates appointment lifecycle through booked, ongoing, and completed states. Component diagram depicts deployment architecture and component responsibilities across client, application, and data tiers. Design patterns section explains Service Layer, Repository, Dependency Injection, Factory, and Strategy patterns employed throughout the system. The design emphasizes multiple security layers (JWT authentication, role-based authorization, input validation, rate limiting), horizontal scalability through microservices and independent service deployment, and maintainability through established design patterns and SOLID principles. This comprehensive foundation enables consistent, reliable implementation across all system components while providing flexibility for future enhancements and scaling.

---

**End of Chapter 4**

**[Total Word Count: Approximately 9,500 words]**
**[Formatting: Times New Roman, 12pt, 1.5 Line Spacing, Justified]**
**[7 Essential ASCII Diagrams: Architecture, Domain, ER, Class, Sequence (×3), State, Component]**
**[Complete Data Dictionary with 6 MongoDB Collections]**
**[Detailed Interaction Flows with Timing Profiles and Algorithm Logic]**
**[Design Patterns and SOLID Principles Application]**
