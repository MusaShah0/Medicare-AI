import os
from faster_whisper import WhisperModel
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

# ── Whisper model — loaded once at startup, reused for every request ──
_whisper_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
            download_root="./models"   # saved to AI/models/ — gitignored
        )
    return _whisper_model


def transcribe_audio(audio_file_bytes: bytes, filename: str) -> dict:
    """
    Transcribe a recording file using faster-whisper small model (CPU).

    Accepts raw bytes (from multipart/form-data upload) so this works
    even when Node.js and Python run on different servers — no shared
    filesystem required.

    The input is the VideoSDK cloud recording (MP4) which contains
    both the doctor's and patient's audio mixed together — so the
    transcript captures the full two-sided conversation.

    Returns { transcript: str, duration: float }
    """
    import tempfile

    # Validate input
    if not audio_file_bytes or len(audio_file_bytes) == 0:
        raise ValueError("Audio file is empty")
    
    if len(audio_file_bytes) > 500 * 1024 * 1024:  # 500 MB limit
        raise ValueError("Audio file too large (max 500 MB)")

    # Write bytes to a temp file so faster-whisper can read it
    suffix = os.path.splitext(filename)[1] or '.mp4'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_file_bytes)
        tmp_path = tmp.name

    try:
        model = get_whisper_model()
        segments, info = model.transcribe(
            tmp_path,
            beam_size=5,
            language=None,     # auto-detect
            task="translate",  # translate any language to English before transcribing
            vad_filter=True,   # Voice activity detection — filters out silence
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        transcript = " ".join(segment.text.strip() for segment in segments)
        
        # Return empty string if nothing was transcribed — let the caller decide
        # (notesProcessor.js has a < 50 word guard that handles this gracefully)
        return {
            "transcript": transcript,
            "duration": float(info.duration)
        }
    finally:
        # Always clean up the temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


SUMMARY_SYSTEM_PROMPT = """You are a professional meeting transcription assistant.

You will receive a transcript of a video consultation between two participants. The transcript was recorded and captures both participants' voices in a single audio stream.

Generate a clear, professional summary that the participants can keep for their records.

Structure your response with EXACTLY these section headings in this order, using the exact bold markdown format shown:

**Meeting Overview**
[2-3 sentences summarizing the main purpose and topics discussed in the meeting]

**Key Discussion Points**
[List the main topics, concerns, or subjects that were discussed. Use bullet points if multiple topics were covered.]

**Decisions and Recommendations**
[Any conclusions reached, advice given, or decisions made during the conversation. Write "None mentioned" if not applicable.]

**Action Items and Next Steps**
[Any follow-up tasks, appointments, or actions that were agreed upon. Write "None mentioned" if not applicable.]

**Additional Notes**
[Any other important information, warnings, or context mentioned. Write "None mentioned" if not applicable.]

Important rules:
- Use clear, professional language that is easy to understand
- Do not invent any information not present in the transcript
- Keep each section concise — 2 to 5 sentences or short bullet points maximum
- If a section is not applicable to the conversation, write "None mentioned" or "Not discussed"
- Focus on facts and key points, not interpretation
- End your entire response with this exact line on its own new line:
  Note: This summary was AI-generated from the meeting recording. Please verify important details with the participants.
"""


def summarize_transcript(transcript: str, doctor_name: str, patient_name: str) -> str:
    """
    Summarize a full consultation transcript using Groq llama-3.1-8b-instant.
    
    Note: Parameter names kept as doctor_name/patient_name for backward compatibility
    with existing API, but the prompt is now universal for any two-party conversation.

    Returns the formatted summary string.
    """
    # Validate inputs
    if not transcript or len(transcript.strip()) == 0:
        raise ValueError("Transcript is empty")
    
    if not doctor_name or not patient_name:
        raise ValueError("Participant names are required")
    
    # Check for GROQ_API_KEY
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=api_key,
        temperature=0.3,
        max_tokens=1024,
        timeout=60  # 60 second timeout
    )

    user_message = (
        f"Participant 1: {doctor_name}\n"
        f"Participant 2: {patient_name}\n\n"
        f"Full meeting transcript (both participants, mixed audio):\n\n"
        f"{transcript[:8000]}"
        # 8000 chars (~2000 tokens) — fits well within llama-3.1-8b context
    )

    messages = [
        SystemMessage(content=SUMMARY_SYSTEM_PROMPT),
        HumanMessage(content=user_message)
    ]

    try:
        response = llm.invoke(messages)
        summary = response.content.strip()
        
        # Validate output
        if not summary or len(summary) < 50:
            raise ValueError("Summary is too short or empty")
        
        return summary
    except Exception as e:
        raise ValueError(f"Summarization failed: {str(e)}")
