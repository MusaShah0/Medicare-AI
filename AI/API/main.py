import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage

from .schemas import ChatRequest, ChatResponse, TranscribeResponse, SummarizeRequest, SummarizeResponse
from .rag_engine import MedicalRAG
from .notes_engine import transcribe_audio, summarize_transcript

load_dotenv()

rag_app_state = {}

# { session_id: { "history": [...], "last_access": float } }
_chat_sessions: dict[str, dict] = {}
SESSION_TTL = 24 * 3600  # 24 hours

def _get_history(session_id: str) -> list:
    entry = _chat_sessions.get(session_id)
    if entry is None:
        _chat_sessions[session_id] = {"history": [], "last_access": time.time()}
        return _chat_sessions[session_id]["history"]
    entry["last_access"] = time.time()
    return entry["history"]

def _set_history(session_id: str, history: list) -> None:
    if session_id in _chat_sessions:
        _chat_sessions[session_id]["history"] = history
        _chat_sessions[session_id]["last_access"] = time.time()

def _cleanup_sessions() -> None:
    cutoff = time.time() - SESSION_TTL
    expired = [sid for sid, data in _chat_sessions.items() if data["last_access"] < cutoff]
    for sid in expired:
        del _chat_sessions[sid]
    if expired:
        print(f"[Session] Cleaned up {len(expired)} expired sessions")

# Simple in-memory rate limiter: max 20 requests per session per minute
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW = 60  # seconds

def _check_rate_limit(session_id: str) -> None:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    calls = [t for t in _rate_limit_store[session_id] if t > window_start]
    if len(calls) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait before sending another message.")
    calls.append(now)
    _rate_limit_store[session_id] = calls

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Initializing Medical RAG with History Support...")
    rag_app_state["rag_engine"] = MedicalRAG()
    yield
    _chat_sessions.clear()
    rag_app_state.clear()

app = FastAPI(title="MediCare AI API", lifespan=lifespan)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    _check_rate_limit(request.session_id)

    # Opportunistic cleanup every ~50 requests (cheap, no scheduling overhead)
    if len(_chat_sessions) % 50 == 0:
        _cleanup_sessions()

    engine = rag_app_state.get("rag_engine")
    if not engine:
        raise HTTPException(status_code=503, detail="Model not loaded")

    history = _get_history(request.session_id)

    try:
        result = await engine.get_medical_answer(request.question, history)

        history.append(HumanMessage(content=request.question))
        history.append(AIMessage(content=result["answer"]))
        _set_history(request.session_id, history[-10:])

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chat/{session_id}")
async def clear_history(session_id: str):
    if session_id in _chat_sessions:
        del _chat_sessions[session_id]
        return {"message": f"History for {session_id} cleared."}
    return {"message": "No history found."}


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_endpoint(audio_file: UploadFile = File(...)):
    """
    Transcribe an audio/video file using faster-whisper.
    Accepts multipart/form-data upload (no shared filesystem required).
    """
    try:
        # Validate file was uploaded
        if not audio_file:
            raise HTTPException(status_code=400, detail="No audio file provided")
        
        # Validate filename
        if not audio_file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        # Read the uploaded file into memory
        audio_bytes = await audio_file.read()
        
        # Validate file size
        if len(audio_bytes) == 0:
            raise HTTPException(status_code=400, detail="Audio file is empty")
        
        if len(audio_bytes) > 500 * 1024 * 1024:  # 500 MB limit
            raise HTTPException(status_code=413, detail="Audio file too large (max 500 MB)")
        
        # Transcribe using faster-whisper
        result = transcribe_audio(audio_bytes, audio_file.filename)
        
        return TranscribeResponse(
            transcript=result["transcript"],
            duration=result["duration"]
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(request: SummarizeRequest):
    """
    Summarize a consultation transcript using Groq llama-3.1-8b-instant.
    Returns a structured patient-friendly summary.
    """
    try:
        # Validate inputs
        if not request.transcript or len(request.transcript.strip()) == 0:
            raise HTTPException(status_code=400, detail="Transcript is empty")
        
        if not request.doctor_name or not request.patient_name:
            raise HTTPException(status_code=400, detail="Doctor name and patient name are required")
        
        summary = summarize_transcript(
            request.transcript,
            request.doctor_name,
            request.patient_name
        )
        return SummarizeResponse(summary=summary)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")