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

### AI Service
```bash
cd AI
# One-time: build FAISS vector store from PDFs in data/
python create_memory_for_llm.py

uv run uvicorn API.main:app --reload   # Start API server
streamlit run medibot.py               # Standalone chat UI (dev/testing)
```

### Required Environment Variables
- **Backend:** `JWT_SECRET` (maps to `SecretKey`), `P_JWT_SECRET` (maps to `P_SecretKey`), `VIDEOSDK_API_KEY`, `VIDEOSDK_SECRET`
- **AI:** `GROQ_API_KEY`, `HF_TOKEN` (HuggingFace for embeddings)

## Architecture

### Auth Flow
Two separate JWT flows using httpOnly cookies:
- Doctors: `SecretKey` → `doctorToken` cookie
- Patients: `P_SecretKey` → `patientToken` cookie

Three middleware variants in `BackEnd/MiddleWare/`: `Doctor`, `Patient`, `AnyUser`.

### Data Flow
1. **Appointment booking:** Patient books → Backend calls VideoSDK REST API to create room → stores `meeting_id` in Appointment document
2. **AI symptom chat:** Frontend → Backend proxy → FastAPI `/chat` → LangChain RAG (FAISS retrieval + Groq LLM) → response with source citations
3. **Post-call notes:** Video ends → Backend → AI Service transcribes audio (faster-whisper) + summarizes → PDF generated via pdfkit → stored as MeetingNote
4. **Auto-cancel:** `BackEnd/utils/autoCancel.js` runs on a timer to cancel stale appointments/schedules

### MongoDB Collections
`Patient`, `Doctor`, `Schedule`, `Appointment`, `Chat`, `Review`, `MeetingNote` — all in database `MediCare`.

### AI RAG Pipeline
- Source documents: 5 medical PDFs in `AI/data/`
- FAISS vector index persisted at `AI/vectorstore/db_faiss/` (rebuild with `create_memory_for_llm.py` if PDFs change)
- Embeddings: HuggingFace sentence-transformers (local)
- LLM: Groq (llama-based model via `langchain-groq`)
- Session history maintained per `session_id` in `API/main.py`

### Frontend Routing
`FrontEnd/src/App.jsx` defines all routes with protected route wrappers. `useAuth.js` hook handles cookie-based auth state. Pages split into Doctor/Patient flows under `src/pages/`.

### Known Codebase Issues
The README notes intentional typos in folder/file names (e.g., `Controlers/` not `Controllers/`). Do not "fix" these as they would break imports.

### Video Calls
VideoSDK Prebuilt SDK loaded via CDN (not npm). Join validation logic is in the Backend before redirecting to the call page. See `videocall.md` for the full flow.
