# AI Meeting Notes Setup Guide

## Overview

After a video consultation ends, patients can download an AI-generated PDF summary of the full consultation — including both the doctor's and patient's sides of the conversation.

## How It Works

1. **Recording starts**: When the first participant joins, VideoSDK cloud recording starts automatically
2. **Recording runs**: Both participants are recorded server-side for the entire session
3. **Recording stops**: When the appointment time ends, recording stops automatically
4. **Webhook received**: VideoSDK sends a webhook when the recording file is ready (1-3 minutes after session ends)
5. **Download + transcribe**: Backend downloads the audio and sends it to the AI service for transcription using `faster-whisper`
6. **Summarize**: The transcript is summarized by Groq `llama-3.1-8b-instant` into a patient-friendly format
7. **PDF generated**: A branded PDF is created using `pdfkit`
8. **Patient downloads**: Patient sees a "View Consultation Notes" button on their My Appointments page

## Setup Instructions

### 1. Backend Dependencies

Already installed:
```bash
cd BackEnd
npm install pdfkit
```

### 2. AI Service Dependencies

Already installed:
```bash
cd AI
uv add faster-whisper==1.0.3
```

### 3. Environment Variables

Add to `BackEnd/.env`:
```env
WEBHOOK_BASE_URL=http://localhost:4000
```

**Important for Production/Testing:**
- VideoSDK webhooks require a publicly accessible URL
- For local development, use [ngrok](https://ngrok.com):
  ```bash
  ngrok http 4000
  # Then set WEBHOOK_BASE_URL=https://<your-ngrok-subdomain>.ngrok-free.app
  ```

### 4. Directory Structure

The following directories are created automatically:
```
BackEnd/
├── uploads/
│   ├── audio/     # Temporary audio files (deleted after processing)
│   └── notes/     # Generated PDF files (permanent)
```

### 5. Start Services

Start all three services in separate terminals:

```bash
# Terminal 1 - Backend
cd BackEnd
node index.js

# Terminal 2 - AI Service
cd AI
uvicorn API.main:app --reload

# Terminal 3 - Frontend
cd FrontEnd
npm run dev
```

## New Files Created

### Backend
- `BackEnd/Models/MeetingNote.model.js` - MongoDB schema for meeting notes
- `BackEnd/Controlers/Notes.controller.js` - Notes status and download endpoints
- `BackEnd/Controlers/Webhook.controller.js` - VideoSDK webhook handler
- `BackEnd/Routes/Notes.route.js` - Notes routes
- `BackEnd/Routes/Webhook.route.js` - Webhook routes
- `BackEnd/utils/recordingSDK.js` - VideoSDK recording control functions
- `BackEnd/utils/generateNotesPDF.js` - PDF generation utility
- `BackEnd/utils/notesProcessor.js` - Full processing pipeline

### AI Service
- `AI/API/notes_engine.py` - Transcription and summarization logic

### Modified Files
- `BackEnd/Models/Appoitment.model.js` - Added `meeting_note_id` field
- `BackEnd/Controlers/Appoitment.controller.js` - Added recording start call
- `BackEnd/utils/autoCancel.js` - Added recording stop call
- `BackEnd/index.js` - Registered new routes
- `AI/API/main.py` - Added `/transcribe` and `/summarize` endpoints
- `AI/API/schemas.py` - Added new Pydantic models
- `FrontEnd/src/pages/MyAppointments.jsx` - Added consultation notes UI

## API Endpoints

### Patient Endpoints

**Check Notes Status**
```
GET /appointments/:appointmentId/notes
Auth: Patient JWT cookie
Returns: { status: 'processing' | 'complete' | 'failed', download_url?: string }
```

**Download PDF**
```
GET /notes/:noteId/download
Auth: Patient JWT cookie
Returns: PDF file stream
```

### Webhook Endpoint (VideoSDK)

**Recording Ready Webhook**
```
POST /webhook/videosdk
Auth: None (called by VideoSDK servers)
Body: { event: 'session.recording.ready', data: { meetingId, fileUrl, ... } }
```

### AI Service Endpoints

**Transcribe Audio**
```
POST /transcribe
Content-Type: multipart/form-data
Body: audio_file (MP4/audio file)
Returns: { transcript: string, duration: float }
```

**Summarize Transcript**
```
POST /summarize
Body: { transcript: string, doctor_name: string, patient_name: string }
Returns: { summary: string }
```

## Database Schema

### MeetingNote Collection

```javascript
{
  appointment_id: ObjectId,      // ref: Appoitment (unique)
  status: String,                // 'processing' | 'complete' | 'failed'
  recording_url: String,         // VideoSDK-hosted file URL
  audio_path: String,            // Temporary local path (deleted after PDF)
  transcript: String,            // Full two-sided transcript
  summary: String,               // Structured summary from Groq
  pdf_path: String,              // Absolute path to generated PDF
  error_message: String,         // Set only when status = 'failed'
  created_at: Date
}
```

## Security Features

### PHI Authorization
- Download endpoint verifies the requesting patient owns the appointment
- Prevents unauthorized access to Protected Health Information (PHI)

### Idempotency
- MongoDB unique index on `appointment_id` prevents duplicate processing
- Handles VideoSDK duplicate webhook events safely using E11000 error

### Timeout Recovery
- Notes stuck in 'processing' for >1 hour are marked as failed
- Handles server restart scenarios gracefully

## Processing Pipeline Details

### 1. Audio Transfer
- Audio is sent via multipart/form-data (no shared filesystem required)
- Works even when Node.js and Python run on different servers

### 2. Speaker Diarization
- Standard Whisper doesn't label speakers
- Groq LLM infers roles based on conversation context
- Prompt guides the model: doctors give advice, patients describe symptoms

### 3. Empty Meeting Guard
- If transcript is <50 words, skips LLM summarization
- Returns a default message for no-show/empty sessions

### 4. Cleanup
- Audio files are deleted after PDF generation (in `finally` block)
- Only PDFs are retained permanently

## Troubleshooting

### Webhook Not Received
- Verify `WEBHOOK_BASE_URL` is publicly accessible
- Check ngrok is running if testing locally
- Check VideoSDK dashboard for webhook delivery logs

### Processing Stuck
- Check AI service logs: `cd AI && uvicorn API.main:app --reload`
- Verify `faster-whisper` model downloaded: `AI/models/`
- Check disk space in `BackEnd/uploads/`

### PDF Not Generated
- Check `pdfkit` is installed: `cd BackEnd && npm list pdfkit`
- Verify `BackEnd/uploads/notes/` directory exists and is writable

### Transcription Errors
- Verify audio file format is supported (MP4, MP3, WAV)
- Check `faster-whisper` model downloaded successfully
- Review AI service logs for detailed error messages

## Testing Checklist

- [ ] Start all three services (Backend, AI, Frontend)
- [ ] Book an appointment as a patient
- [ ] Join the video call as both doctor and patient
- [ ] Wait for appointment time to end (or manually mark as completed)
- [ ] Wait 2-3 minutes for VideoSDK webhook
- [ ] Check "View Consultation Notes" button appears on My Appointments page
- [ ] Click button to check status (should show "processing" initially)
- [ ] Wait for processing to complete (~1-2 minutes)
- [ ] Download the PDF and verify it contains the summary

## Production Deployment

1. Set `WEBHOOK_BASE_URL` to your production domain
2. Ensure VideoSDK webhook can reach your server (firewall rules)
3. Configure proper backup for `BackEnd/uploads/notes/` directory
4. Monitor disk space for PDF storage
5. Consider adding a cleanup job for old PDFs (e.g., delete after 90 days)
6. Set up monitoring for webhook delivery failures
7. Configure error alerting for failed note processing

## Known Limitations

- VideoSDK recording files are available for ~7 days only
- Transcription quality depends on audio quality and accents
- Speaker diarization is inference-based (not 100% accurate)
- Processing takes 1-3 minutes after session ends
- PDFs are stored indefinitely (manual cleanup required)
