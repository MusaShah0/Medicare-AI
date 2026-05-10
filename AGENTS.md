# AGENTS.md — MediCare AI

## Services
| Service | Dir | Entry | Port |
|---|---|---|---|
| Frontend | `FrontEnd/` | `npm run dev` | 5173 |
| Backend | `BackEnd/` | `node index.js` | 4000 |
| AI Service | `AI/` | `uv run uvicorn API.main:app --reload` | 8000 |

## Critical: intentional typos in file/folder names
NEVER rename these — they would break imports across the codebase:
- `Appoitment` (Appointment), `Sechdule` (Schedule), `Controlers/` (Controllers)
- Model files: `Dooctor.model.js`, `Rewiew.model.js`
- Route files: `Appoitment.route.js`, `Sechdule.Route.js`
- Controller references: `Appoitment.controller.js`, `Notification.controller.js`

## Commands
```bash
# Backend
cd BackEnd && npm install && node index.js

# Tests (root tests/, numbered 1-8)
cd BackEnd && npm test                          # jest --forceExit --verbose
cd BackEnd && npm run test:coverage             # with coverage

# Frontend
cd FrontEnd && npm install && npm run dev

# AI Service — first time only
cd AI && python create_memory_for_llm.py        # build FAISS index from AI/data/*.pdf
# Then start
cd AI && uv run uvicorn API.main:app --reload
# Standalone Streamlit chat (dev only)
cd AI && streamlit run medibot.py
```

## Architecture
- Three independent services, no monorepo tooling. Each has its own package manager (npm / uv).
- Backend proxies `/chat` → AI service `http://127.0.0.1:8000/chat`.
- AI service endpoints: `POST /chat` (RAG), `POST /transcribe` (faster-whisper), `POST /summarize` (Groq).
- Three JWT auth flows (doctor/patient/admin), all httpOnly cookies, middleware in `BackEnd/MiddleWare/`.
- Auth rate limited: 10 req/15 min. AI chat rate limited: 20 req/session/min (in-memory).
- VideoSDK for video calls: room created at booking, token generated server-side.

## Test specifics
- All tests import pure logic helpers (no DB, no network). They test sanitisation, validation, transitions, overlap detection, bcrypt/JWT perf, and in-memory store stress.
- Run from `BackEnd/` because jest config lives in `BackEnd/package.json` (rootDir: `..`, testMatch: `../tests/**/*.test.js`).
- `jest --forceExit` is required (prevents hanging).

## AI Service quirks
- Requires `GROQ_API_KEY` and optionally `HF_TOKEN` in `AI/.env`.
- FAISS vector store at `AI/vectorstore/db_faiss/` — must be rebuilt if PDFs change.
- Session history is in-memory only (lost on restart, last 10 messages, 24h TTL).
- Off-topic and greeting detection is hardcoded in `rag_engine.py` — English + Urdu/Roman Urdu.

## VideoSDK tokens
- Two token types in `BackEnd/utils/videoSDK.js`:
  - `generateToken()` — `allow_join + allow_mod` (participant joining from browser)
  - `generateServerToken()` — adds `allow_stream` (REST API calls: room creation, recording)
- VideoSDK credentials from env vars `VIDEOSDK_API_KEY`, `VIDEOSDK_SECRET_KEY`.

## Docker
- `docker-compose.yml` at root: mongodb, backend, ai-service, frontend (Nginx).
- Named volumes: `mongo_data`, `backend_uploads`, `backend_public`, `ai_vectorstore`, `ai_models`.
- Frontend build arg `VITE_API_URL` for API base URL.

## Additional docs
- `videocall.md` — full video call flow
- `design.md` — UI fields reference per page
- `docs/` — meeting notes setup, testing checklist, changelogs
