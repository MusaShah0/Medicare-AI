# Meeting Notes - Quick Start Guide

## Starting the Services

### 1. Start AI Service (Port 8000)
```bash
cd AI
.venv\Scripts\uvicorn.exe API.main:app --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
🚀 Initializing Medical RAG with History Support...
INFO:     Application startup complete.
```

### 2. Start Backend (Port 4000)
```bash
cd BackEnd
npm start
```

### 3. Start Frontend (Port 5173)
```bash
cd FrontEnd
npm run dev
```

## Testing the Flow

### As Patient:

1. **Book an appointment** with a doctor
2. **Join the video call** when it's time (5 minutes before start time)
3. **Have a conversation** - both sides will be recorded automatically
4. **End the meeting** - audio will upload automatically
5. **Go to "My Appointments"** page
6. **Click "View Consultation Notes"** on the completed appointment
7. **Wait 2-3 minutes** for processing (status will show "Notes are being prepared")
8. **Download the PDF** when ready

### Checking Logs:

**Backend logs** (in terminal where you ran `npm start`):
```
[Notes] ===== Audio upload received for appointment: <id> =====
[Notes] File received: recording.webm
[Notes] File size: X.XX MB
[Notes] ✅ MeetingNote created: <noteId>
[Notes] ===== Pipeline start =====
[Notes] Step 1 ✅ Audio file valid
[Notes] Step 2 — Sending to AI service for transcription...
[Notes] Step 2 ✅ Transcription complete
[Notes] Step 3 — Summarizing...
[Notes] Step 3 ✅ Summary generated
[Notes] Step 4 ✅ PDF generated
[Notes] ===== Pipeline complete =====
```

**AI service logs** (in terminal where you ran uvicorn):
```
INFO:     127.0.0.1:XXXXX - "POST /transcribe HTTP/1.1" 200 OK
INFO:     127.0.0.1:XXXXX - "POST /summarize HTTP/1.1" 200 OK
```

## Troubleshooting

### AI Service Won't Start

**Error:** `ModuleNotFoundError: No module named 'faster_whisper'`
```bash
cd AI
uv pip install faster-whisper python-multipart
```

**Error:** `RuntimeError: Form data requires "python-multipart"`
```bash
cd AI
uv pip install python-multipart
```

**Error:** `[Errno 10048] ... port is normally permitted`
Port 8000 is already in use. Find and kill the process:
```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### Backend Can't Connect to AI Service

**Error:** `connect ECONNREFUSED 127.0.0.1:8000`

1. Check if AI service is running:
   ```bash
   curl http://127.0.0.1:8000/docs
   ```
   Should return FastAPI docs page

2. Restart AI service:
   ```bash
   cd AI
   .venv\Scripts\uvicorn.exe API.main:app --host 127.0.0.1 --port 8000
   ```

### Notes Stuck in "Processing"

If notes show "processing" for more than 5 minutes:

1. Check backend logs for errors
2. Check AI service logs for errors
3. Verify AI service is running: `curl http://127.0.0.1:8000/docs`
4. After 1 hour, the system will automatically mark it as "failed"

### No Audio Recorded

**Possible causes:**
- Microphone permission denied
- Only one participant joined the call
- Meeting was too short (< 10 seconds)

**Check browser console** (F12) for:
```
[Notes] Step 1 ✅ Microphone access granted
[Notes] Step 5 — Chunk recorded: X.X KB
```

### PDF Not Generating

Check backend logs for:
```
[Notes] Step 4 ✅ PDF generated — <path>
```

If missing, check:
- `BackEnd/uploads/notes/` directory exists
- Node.js has write permissions
- `pdfkit` package is installed: `npm install pdfkit`

## Environment Variables

### AI/.env
```env
GROQ_API_KEY=<your_groq_api_key>
```

Get your API key from: https://console.groq.com/keys

### BackEnd/.env
```env
DB_URL=mongodb://localhost:27017/MediCare
PORT=4000
SecretKey=MediCare
P_SecretKey=Patient
ExpireIn=6h
```

## File Locations

### Uploaded Audio Files
```
BackEnd/uploads/audio/<appointmentId>-<timestamp>.webm
```
These are automatically deleted after processing.

### Generated PDFs
```
BackEnd/uploads/notes/<noteId>.pdf
```
These are kept permanently for patient download.

### Whisper Model Cache
```
AI/models/
```
The Whisper "small" model (~500MB) is downloaded here on first use.

## API Testing (Manual)

### Test Transcription
```bash
curl -X POST http://127.0.0.1:8000/transcribe \
  -F "audio_file=@test-audio.webm"
```

Expected response:
```json
{
  "transcript": "Hello, how are you feeling today?",
  "duration": 3.5
}
```

### Test Summarization
```bash
curl -X POST http://127.0.0.1:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Patient complains of headache for 3 days...",
    "doctor_name": "Dr. John Smith",
    "patient_name": "Jane Doe"
  }'
```

Expected response:
```json
{
  "summary": "**What we discussed**\n\nJane came in with..."
}
```

## Performance Notes

- **Transcription time:** ~10-20% of audio duration (e.g., 10-min call = 1-2 min transcription)
- **Summarization time:** ~5-10 seconds
- **PDF generation:** < 1 second
- **Total processing:** ~2-3 minutes for typical 10-minute consultation

## Security Notes

- Audio files are deleted after processing
- PDFs are only accessible to the patient who owns the appointment
- All endpoints require authentication (Patient JWT cookie)
- Transcripts and summaries are stored in MongoDB (not in files)

---

**Need help?** Check the full documentation in `docs/meeting-notes-fix-summary.md`
