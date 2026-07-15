# MediCare AI - Intelligent Telemedicine Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.9-blue)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

> A comprehensive full-stack telemedicine solution featuring AI-powered symptom analysis, real-time video consultations, and automated post-consultation documentation.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)

---

## 🎯 Overview

MediCare AI is a modern telemedicine platform that bridges the gap between patients and healthcare providers through intelligent automation and seamless communication. The platform leverages cutting-edge AI technology for symptom analysis and provides a comprehensive suite of features for both patients and medical professionals.

### Key Features

#### For Patients
- 🤖 **AI Symptom Checker**: RAG-powered medical assistant using LangChain and Groq LLaMA 3.1
- 👨‍⚕️ **Doctor Discovery**: Browse and filter healthcare providers by speciality
- 📅 **Smart Scheduling**: Book appointments with real-time availability checking
- 🎥 **HD Video Consultations**: Secure, HIPAA-compliant video calls via VideoSDK
- 📄 **AI-Generated Notes**: Automatic transcription and summarization of consultations
- ⭐ **Review System**: Rate and review completed appointments
- 🔄 **Free Rescheduling**: One-time free rebooking for doctor-initiated cancellations

#### For Doctors
- 🗓️ **Schedule Management**: Create, view, and manage availability with granular time slots
- 📊 **Appointment Dashboard**: Unified view of booked, ongoing, and completed consultations
- 👥 **Patient Management**: Access patient history and consultation records
- 🎯 **Analytics**: Track completed appointments and average ratings
- 🔄 **Flexible Rescheduling**: Cancel appointments with automatic patient notification and token issuance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MediCare AI                              │
├─────────────┬────────────────────┬───────────────────────────────┤
│  Frontend   │      Backend       │        AI Service             │
│  React 19   │   Node.js + Express│  Python FastAPI + LangChain  │
│  Port 5173  │      Port 4000     │        Port 8000              │
└─────────────┴────────────────────┴───────────────────────────────┘
       │               │                        │
       │               │                        │
       └───────REST───>│<──────Proxied Chat────┤
                       │                        │
                       │<──FAISS Vector Store───┘
                       │
                       ├──MongoDB (Port 27017)
                       │
                       └──VideoSDK API (Cloud)
```

### Service Communication

- **Frontend → Backend**: RESTful API calls to `http://localhost:4000`
- **Backend → AI Service**: Proxied requests to `http://127.0.0.1:8000`
- **Backend → VideoSDK**: REST API for room management and JWT token generation
- **VideoSDK → Backend**: Webhooks for recording completion notifications

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0 | UI framework |
| React Router | 7.12.0 | Client-side routing |
| TailwindCSS | 4.1.18 | Utility-first CSS |
| Vite | 7.2.4 | Build tool and dev server |
| Axios | 1.13.2 | HTTP client |
| Framer Motion | 12.40.0 | Animation library |
| React Markdown | 10.1.0 | Markdown rendering |
| VideoSDK Prebuilt | 0.3.43 | Video calling UI |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥18.0.0 | Runtime environment |
| Express | 5.2.1 | Web framework |
| MongoDB | 7.0 | Database |
| Mongoose | 9.1.1 | ODM |
| bcrypt | 6.0.0 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT authentication |
| multer | 2.0.2 | File upload handling |
| moment | 2.30.1 | Date manipulation |
| helmet | 8.1.0 | Security headers |
| express-rate-limit | 8.4.1 | Rate limiting |
| pdfkit | 0.15.2 | PDF generation |

### AI Service
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | ≥3.9 | Runtime |
| FastAPI | Latest | API framework |
| LangChain | 0.3 | RAG orchestration |
| Groq | Latest | LLM inference |
| FAISS | CPU | Vector similarity search |
| Sentence Transformers | Latest | Text embeddings |
| faster-whisper | 1.0.3 | Audio transcription |
| PyPDF | Latest | PDF text extraction |

### External Services
- **VideoSDK.live**: Video conferencing infrastructure
- **Groq Cloud**: LLM inference endpoint

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v7.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)

### Additional Requirements

- **Groq API Key**: Sign up at [Groq Cloud](https://console.groq.com/)
- **VideoSDK Account**: Register at [VideoSDK.live](https://www.videosdk.live/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MusaShah0/Medicare-AI.git
cd Medicare-AI
```

### 2. Backend Setup

```bash
cd BackEnd
npm install
```

### 3. Frontend Setup

```bash
cd ../FrontEnd
npm install
```

### 4. AI Service Setup

**Using uv (recommended):**
```bash
cd ../AI
pip install uv
uv sync
```

**Alternative using pip:**
```bash
cd ../AI
pip install -r requirements.txt
```

### 5. Build FAISS Vector Store

First time only - index medical knowledge base:

```bash
cd AI
python create_memory_for_llm.py
```

This process:
- Loads medical PDFs from `AI/data/`
- Splits documents into optimized chunks
- Generates embeddings using Sentence Transformers
- Creates FAISS index at `AI/vectorstore/db_faiss/`

**Duration**: ~5-10 minutes depending on hardware

---

## ⚙️ Configuration

### Backend Environment (.env)

Create `BackEnd/.env`:

```env
# Database
DB_URL=mongodb://localhost:27017/MediCare

# Server
PORT=4000

# JWT Secrets (CHANGE IN PRODUCTION)
SecretKey=your_doctor_jwt_secret_key_here
P_SecretKey=your_patient_jwt_secret_key_here
ExpireIn=6h

# VideoSDK (Get from https://app.videosdk.live/api-keys)
VIDEOSDK_API_KEY=your_videosdk_api_key
VIDEOSDK_SECRET_KEY=your_videosdk_secret_key

# Webhooks (use ngrok URL for local development)
WEBHOOK_BASE_URL=http://localhost:4000
```

### AI Service Environment (.env)

Create `AI/.env`:

```env
# Groq API (Get from https://console.groq.com/keys)
GROQ_API_KEY=your_groq_api_key_here

# Optional: HuggingFace token for gated models
HF_TOKEN=your_huggingface_token
```

### Frontend Environment (.env)

Create `FrontEnd/.env` (optional):

```env
VITE_API_URL=http://localhost:4000
```

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - MongoDB:**
```bash
mongod
# Or if using MongoDB service:
# sudo systemctl start mongod  (Linux)
# brew services start mongodb-community  (macOS)
```

**Terminal 2 - Backend:**
```bash
cd BackEnd
node index.js
```

**Terminal 3 - AI Service:**
```bash
cd AI
uv run uvicorn API.main:app --reload
# Or: uvicorn API.main:app --reload
```

**Terminal 4 - Frontend:**
```bash
cd FrontEnd
npm run dev
```

**Terminal 5 - ngrok (for webhooks in local dev):**
```bash
ngrok http 4000
# Update WEBHOOK_BASE_URL in BackEnd/.env with the HTTPS URL
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **AI Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📚 API Documentation

### Authentication Endpoints

#### Doctor Authentication
```http
POST /D_SignUp
Content-Type: multipart/form-data

Body:
- first_Name: string
- last_Name: string  
- email: string (unique)
- password: string
- ph: string
- speciality: string
- degrees: string[] (comma-separated)
- profile_Picture: file

Response: 200 OK + Set-Cookie
```

```http
POST /D_Login
Content-Type: application/json

Body:
{
  "email": "doctor@example.com",
  "password": "password123"
}

Response: 200 OK + Set-Cookie
```

#### Patient Authentication
```http
POST /P_SignUp
Content-Type: application/json

Body:
{
  "first_Name": "John",
  "last_Name": "Doe",
  "email": "patient@example.com",
  "password": "password123",
  "age": 30,
  "gender": "Male"
}

Response: 200 OK
```

```http
POST /P_Login
Content-Type: application/json

Body:
{
  "email": "patient@example.com",
  "password": "password123"
}

Response: 200 OK + Set-Cookie
```

### Schedule Management (Doctor Protected)

```http
POST /Add_Sechdule
Authorization: Cookie (Doctor JWT)
Content-Type: application/json

Body:
{
  "dates": ["2024-01-15", "2024-01-16"],
  "slots": [
    {"startTime": "09:00", "endTime": "10:00"},
    {"startTime": "10:00", "endTime": "11:00"}
  ],
  "clinic_fee": 500,
  "slotDuration": 30
}

Response: 201 Created
```

### Appointment Booking

```http
POST /Book_Appointment/:scheduleId
Authorization: Cookie (Patient JWT)

Response:
{
  "message": "Appointment booked successfully",
  "appointment": {...},
  "meeting_id": "abc-def-ghi"
}
```

### AI Chat

```http
POST /SendMessage
Authorization: Cookie (Patient JWT)
Content-Type: application/json

Body:
{
  "question": "I have a persistent headache and fever",
  "session_id": "session_12345"
}

Response:
{
  "answer": "...",
  "sources": [...]
}
```

### Video Call

```http
GET /join-meeting/:roomId
Authorization: Cookie (Doctor or Patient JWT)

Response:
{
  "token": "eyJhbGc...",
  "participantName": "Dr. Smith",
  "patientName": "John Doe",
  "doctorName": "Dr. Smith",
  "userRole": "doctor",
  "appointmentId": "...",
  "remainingTime": 1800
}
```

For complete API documentation, see the interactive Swagger docs at `http://localhost:8000/docs` when the AI service is running.

---

## 🗄️ Database Schema

### Collections Overview

```
MediCare Database
├── patients        (User accounts for patients)
├── doctors         (User accounts for doctors)
├── schedules       (Doctor availability slots)
├── appoitments     (Booked consultations)
├── chats           (AI symptom chat sessions)
├── rewiews         (Patient reviews)
└── meetingnotes    (AI-generated consultation summaries)
```

### Key Models

#### Patient
```javascript
{
  _id: ObjectId,
  first_Name: String (required),
  last_Name: String (required),
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  age: Number (required),
  gender: Enum ['Male', 'Female', 'Other'] (required),
  createdAt: Date,
  updatedAt: Date
}
```

#### Doctor
```javascript
{
  _id: ObjectId,
  first_Name: String (required),
  last_Name: String (required),
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  ph: String (required),
  speciality: String (required),
  degrees: [String] (required),
  profile_Picture: String,
  completed_appointments: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### Schedule
```javascript
{
  _id: ObjectId,
  doctor: ObjectId (ref: Doctor, required),
  startTime: String (HH:mm format, required),
  endTime: String (HH:mm format, required),
  date: Date (required),
  clinic_fee: Number (required),
  slotDuration: Number (minutes, required),
  status: Enum ['available', 'booked', 'ongoing', 'completed', 'cancelled'] (default: 'available'),
  createdAt: Date,
  updatedAt: Date
}

// Unique compound index: {doctor, date, startTime}
```

#### Appointment
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId (ref: Patient, required),
  doctor_id: ObjectId (ref: Doctor, required),
  sechdule_Id: ObjectId (ref: Schedule, required),
  status: Enum ['booked', 'ongoing', 'completed', 'cancelled'] (default: 'booked'),
  meeting_id: String (VideoSDK room ID, required),
  is_rescheduled_token: Boolean (default: false),
  rescheduled_from: ObjectId (ref: Appointment),
  meeting_note_id: ObjectId (ref: MeetingNote),
  createdAt: Date,
  updatedAt: Date
}
```

#### MeetingNote
```javascript
{
  _id: ObjectId,
  appointment_id: ObjectId (ref: Appointment, unique, required),
  status: Enum ['processing', 'complete', 'failed'] (default: 'processing'),
  recording_url: String,
  audio_path: String,
  transcript: String,
  summary: String,
  pdf_path: String,
  error_message: String,
  created_at: Date (default: Date.now),
  updated_at: Date
}
```

---

## 🧪 Testing

### Backend Tests

The backend includes comprehensive test suites covering:

1. **Unit Tests**: Pure function testing
2. **Equivalence Partitioning**: Input validation
3. **Boundary Value Analysis**: Edge case handling
4. **Data Flow Testing**: State transitions
5. **Use Case Testing**: User workflows
6. **Integration Tests**: API endpoint testing
7. **Performance Tests**: Response time benchmarks
8. **Stress Tests**: Concurrent request handling

```bash
cd BackEnd

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd FrontEnd

# Lint code
npm run lint

# Build for production (validates code)
npm run build
```

### AI Service Tests

```bash
cd AI

# Test transcription endpoint
curl -X POST http://localhost:8000/transcribe \
  -F "audio_file=@test_audio.mp4"

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are symptoms of flu?", "session_id": "test_123"}'
```

---

## 🚢 Deployment

### Docker Deployment

A complete `docker-compose.yml` is provided at the project root:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services included:**
- MongoDB (persistent volume)
- Backend (with health checks)
- AI Service (with model caching)
- Frontend (Nginx reverse proxy)

### Production Considerations

1. **Environment Variables**
   - Use strong, unique JWT secrets
   - Rotate API keys regularly
   - Never commit `.env` files

2. **Database**
   - Use MongoDB Atlas or managed MongoDB
   - Enable authentication
   - Configure backup strategy

3. **SSL/TLS**
   - Use HTTPS for all endpoints
   - Configure SSL certificates
   - Enable HSTS headers

4. **Monitoring**
   - Set up application monitoring (e.g., PM2, New Relic)
   - Configure error tracking (e.g., Sentry)
   - Monitor API rate limits

5. **Scaling**
   - Use load balancer for multiple backend instances
   - Configure Redis for session storage
   - Implement CDN for static assets

---

## 🔒 Security Considerations

### Authentication & Authorization

- JWT tokens stored in **httpOnly cookies** (XSS protection)
- Separate secrets for doctor and patient tokens
- Token expiration: 6 hours
- Password hashing using bcrypt (cost factor: 10)

### API Security

- **Helmet.js**: Security headers (CSP, XSS protection)
- **CORS**: Configured for frontend origin only
- **Rate Limiting**: 10 requests per 15 minutes for auth endpoints
- **Input Validation**: All user inputs sanitized
- **SQL Injection Protection**: Mongoose ORM with parameterized queries

### Data Protection

- **PHI Compliance**: Patient health information encrypted at rest
- **Audit Logging**: All appointment and chat actions logged
- **Access Control**: Role-based authorization for all endpoints
- **File Upload Security**: Type and size validation for profile pictures

### Known Limitations

⚠️ **Important Security Notes:**

1. **No Refresh Token**: Users must re-login after 6-hour expiration
2. **In-Memory Sessions**: AI chat history lost on server restart
3. **Local File Storage**: Profile pictures and notes stored locally (use S3 in production)
4. **Hardcoded Secrets**: Some VideoSDK credentials in code (move to environment variables)

---

## 🐛 Known Issues & Limitations

### Filename Typos

The following typos exist throughout the codebase. **Do not rename** without updating all references:

| Incorrect | Correct | Files Affected |
|-----------|---------|----------------|
| `Appoitment` | Appointment | Models, Controllers, Routes |
| `Sechdule` | Schedule | Models, Controllers, Routes |
| `Dooctor.model.js` | Doctor.model.js | Models folder |
| `Rewiew.model.js` | Review.model.js | Models folder |
| `Controlers/` | Controllers/ | Directory name |

### Technical Debt

- [ ] Implement refresh token mechanism
- [ ] Add persistent session storage (Redis)
- [ ] Move file uploads to cloud storage (AWS S3)
- [ ] Add comprehensive error logging
- [ ] Implement automated database backups
- [ ] Add end-to-end tests
- [ ] Improve mobile responsiveness
- [ ] Add multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 👥 Authors

- **Musa Shah** - *Initial work* - [MusaShah0](https://github.com/MusaShah0)

---

## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference
- **VideoSDK** for reliable video infrastructure
- **LangChain** for simplifying RAG implementation
- **MongoDB** for flexible data modeling
- **React** and **Vite** teams for excellent developer experience

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Mobile applications (iOS/Android)
- [ ] Electronic Health Records (EHR) integration
- [ ] Prescription management
- [ ] Payment gateway integration
- [ ] Insurance claims processing
- [ ] Multi-factor authentication
- [ ] Telemedicine marketplace
- [ ] AI-powered diagnosis assistance
- [ ] Wearable device integration

---

<div align="center">
  <strong>Built with ❤️ for better healthcare access</strong>
</div>
