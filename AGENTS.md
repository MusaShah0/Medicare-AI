# AGENTS.md — MediCare AI

## Services
| Service | Dir | Entry | Port |
|---|---|---|---|
| Frontend | `FrontEnd/` | `npm run dev` | 5173 |
| Backend | `BackEnd/` | `node index.js` | 4000 |
| AI Service | `AI/` | `uv run uvicorn API.main:app --reload` | 8000 |

## Commands
```bash
# Backend
cd BackEnd && npm install && node index.js

# Tests (root tests/, numbered 1-8)
cd BackEnd && npm test                 # jest --forceExit --verbose
cd BackEnd && npm run test:coverage    # with coverage

# Frontend
cd FrontEnd && npm install && npm run dev
cd FrontEnd && npm run build           # production build
cd FrontEnd && npm run lint            # ESLint (flat config)

# AI Service (Python 3.13 required, see AI/.python-version)
cd AI && uv sync                       # preferred; or pip install -r requirements.txt
cd AI && python create_memory_for_llm.py  # build FAISS index (first time only)
cd AI && uv run uvicorn API.main:app --reload
cd AI && streamlit run medibot.py      # standalone chat UI (dev only)
```

## Intentional filename typos
Do NOT rename — would break imports:
- `Appoitment`, `Sechdule`, `Controlers/`
- Models: `Dooctor.model.js`, `Rewiew.model.js`
- Routes: `Appoitment.route.js`, `Sechdule.Route.js`
- Controllers: `Appoitment.controller.js`, `Notification.controller.js`

## Architecture
- Three independent services, each with own package manager (npm/uv).
- Backend proxies `/chat` → AI service `http://127.0.0.1:8000/chat` (patient-protected).
- AI service: `POST /chat` (RAG), `POST /transcribe` (faster-whisper small, CPU), `POST /summarize` (Groq llama-3.1-8b-instant), `DELETE /chat/{session_id}`.
- Three JWT auth flows (doctor/patient/admin), httpOnly cookies. Middleware in `BackEnd/MiddleWare/`.
- Auth rate limited: 10 req/15 min. AI chat: 20 req/session/min (in-memory).
- VideoSDK for video calls: room created at booking, token generated server-side.
- **Webhook route (`/webhook/videosdk`) must be registered before auth-gated routes** in `index.js` (`BackEnd/index.js:40`).
- `frontend/src/hooks/useAuth.js` uses `VITE_API_URL` (defaults to `http://localhost:4000`).

## Tests
- Pure logic helpers (no DB, no network). Test sanitisation, validation, transitions, overlap detection, bcrypt/JWT perf, in-memory store stress.
- Run from `BackEnd/` (jest config: rootDir: `..`, testMatch: `../tests/**/*.test.js`).
- `jest --forceExit` required (prevents hanging).

## AI Service quirks
- Requires `GROQ_API_KEY`, optionally `HF_TOKEN` in `AI/.env`.
- Python **3.13** required (per `AI/.python-version`).
- Primary dep management: `uv sync` (uv.lock); falls back to `pip install -r requirements.txt`.
- FAISS vector store at `AI/vectorstore/db_faiss/` — rebuild if PDFs change.
- Session history in-memory (last 10 messages, 24h TTL, lost on restart).
- Off-topic/greeting detection hardcoded in `rag_engine.py`.
- Whisper model (`small`) auto-downloaded to `AI/models/` (gitignored).

## Post-call notes pipeline
- VideoSDK cloud recording → webhook `POST /webhook/videosdk` (or polling fallback 90s after session end when `WEBHOOK_BASE_URL` is localhost) → backend downloads audio → AI service transcribes (`/transcribe`, faster-whisper) → summarizes (`/summarize`, Groq) → PDF generated (pdfkit).
- Audio deleted after PDF. Transcripts under 50 words get a default summary. Processing stuck >1 hour → `failed`.
- Recording start has **5-retry logic** for "No active session" 403 (`recordingSDK.js:17-75`).

## VideoSDK tokens (`BackEnd/utils/videoSDK.js`)
- `generateToken()` — `allow_join + allow_mod` (participant joining from browser)
- `generateServerToken()` — adds `allow_stream` (REST API calls: room creation, recording)
- Credentials from env vars `VIDEOSDK_API_KEY`, `VIDEOSDK_SECRET_KEY`.

## Docker
- `docker-compose.yml` at root: mongodb (7.0), backend, ai-service (python:3.11-slim), frontend (Nginx on 80/443).
- Named volumes: `mongo_data`, `backend_uploads`, `backend_public`, `ai_vectorstore`, `ai_models`.
- Frontend build arg `VITE_API_URL` (defaults to `http://localhost:4000`).
- `.env.example` only covers docker-compose vars — see `CLAUDE.md` for full local dev env vars reference.

## opencode.json
- `opencode.json` at root configures a **Stitch AI MCP server** (`stitch-ai-mcp/`). Uses `ts-node` to run the server.

## Local dev notes
- VideoSDK webhooks require a public URL. Use `ngrok http 4000` and set `WEBHOOK_BASE_URL` in `BackEnd/.env`.
- `BackEnd/.env` secrets (`VIDEOSDK_*`, `GROQ_API_KEY`) are committed to this repo — **rotate if pushed to public remote**.

## Additional docs
- `videocall.md` — full video call flow
- `design.md` — UI fields reference per page
- `docs/` — meeting notes setup, testing checklist, changelogs
