# AI Meeting Notes - Edge Cases & Error Handling

## ✅ Edge Cases Covered

### 1. Recording Control Edge Cases

#### ✅ Recording Already Started
**Scenario:** Multiple participants join simultaneously, both trigger `startRoomRecording()`
**Handling:** VideoSDK returns 400 if recording already started — caught and logged, not treated as error
**Code:** `BackEnd/utils/recordingSDK.js` line ~40

#### ✅ Recording Already Stopped
**Scenario:** Auto-complete timer fires AND manual stop is called
**Handling:** VideoSDK returns 400 if recording already stopped — caught and logged, not treated as error
**Code:** `BackEnd/utils/recordingSDK.js` line ~70

#### ✅ Missing WEBHOOK_BASE_URL
**Scenario:** `WEBHOOK_BASE_URL` not configured in `.env`
**Handling:** Throws error immediately when trying to start recording, prevents silent failure
**Code:** `BackEnd/utils/recordingSDK.js` line ~15

---

### 2. Webhook Edge Cases

#### ✅ Duplicate Webhooks
**Scenario:** VideoSDK sends the same webhook twice in rapid succession
**Handling:** MongoDB unique index on `appointment_id` prevents duplicate `MeetingNote` creation (E11000 error)
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~50

#### ✅ Webhook for Wrong Event Type
**Scenario:** VideoSDK sends webhook for events other than `session.recording.ready`
**Handling:** Early return, only process `session.recording.ready` events
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~25

#### ✅ Webhook for Non-Existent Appointment
**Scenario:** Webhook arrives for a `roomId` that doesn't exist in database
**Handling:** Log error and return early, no crash
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~35

#### ✅ Webhook for Cancelled Appointment
**Scenario:** Appointment was cancelled but VideoSDK still sends webhook
**Handling:** Check appointment status, only process if `completed` or `ongoing`
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~45

#### ✅ Missing Populated Fields
**Scenario:** Appointment's doctor, patient, or schedule was deleted
**Handling:** Validate all populated fields exist before processing
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~53

---

### 3. Audio Download Edge Cases

#### ✅ Download Timeout
**Scenario:** VideoSDK file URL is slow or unresponsive
**Handling:** 5-minute timeout on download, 5-minute timeout on write
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~90

#### ✅ Empty File Downloaded
**Scenario:** Download completes but file is 0 bytes
**Handling:** Validate file size after download, throw error if empty
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~110

#### ✅ Partial Download
**Scenario:** Download fails mid-stream
**Handling:** Cleanup partial file in catch block, mark note as failed
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~125

#### ✅ Disk Space Full
**Scenario:** Server runs out of disk space during download
**Handling:** Write stream error caught, note marked as failed, partial file cleaned up
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~125

---

### 4. Transcription Edge Cases

#### ✅ Empty Audio File
**Scenario:** Audio file exists but contains no audio data
**Handling:** Validate file size before transcription, throw error if empty
**Code:** `BackEnd/utils/notesProcessor.js` line ~40

#### ✅ Audio File Too Large
**Scenario:** Recording is >500 MB
**Handling:** Reject with 413 error before processing
**Code:** `AI/API/notes_engine.py` line ~25

#### ✅ Corrupted Audio File
**Scenario:** Downloaded file is corrupted or invalid format
**Handling:** faster-whisper throws error, caught and note marked as failed
**Code:** `BackEnd/utils/notesProcessor.js` line ~85

#### ✅ Empty Transcript
**Scenario:** Whisper transcribes but produces empty string (silence/noise only)
**Handling:** Validate transcript is not empty, throw error if it is
**Code:** `AI/API/notes_engine.py` line ~50

#### ✅ Very Short Transcript (<50 words)
**Scenario:** Patient joined but doctor never showed up, or very brief session
**Handling:** Skip LLM summarization, generate default message, create PDF anyway
**Code:** `BackEnd/utils/notesProcessor.js` line ~60

#### ✅ AI Service Unreachable
**Scenario:** FastAPI service is down or not responding
**Handling:** Axios timeout (10 minutes), error caught, note marked as failed
**Code:** `BackEnd/utils/notesProcessor.js` line ~55

#### ✅ Invalid Transcription Response
**Scenario:** AI service returns malformed JSON or missing fields
**Handling:** Validate response structure, throw error if invalid
**Code:** `BackEnd/utils/notesProcessor.js` line ~65

---

### 5. Summarization Edge Cases

#### ✅ Missing GROQ_API_KEY
**Scenario:** `GROQ_API_KEY` not set in `AI/.env`
**Handling:** Validate API key exists before calling Groq, throw error if missing
**Code:** `AI/API/notes_engine.py` line ~115

#### ✅ Groq API Rate Limit
**Scenario:** Too many requests to Groq API
**Handling:** Groq SDK throws error, caught and note marked as failed
**Code:** `BackEnd/utils/notesProcessor.js` line ~85

#### ✅ Groq API Timeout
**Scenario:** Groq takes too long to respond
**Handling:** 60-second timeout on summarization request
**Code:** `BackEnd/utils/notesProcessor.js` line ~80

#### ✅ Empty Summary
**Scenario:** Groq returns empty or very short summary
**Handling:** Validate summary length (>50 chars), throw error if too short
**Code:** `AI/API/notes_engine.py` line ~145

#### ✅ Missing Doctor/Patient Names
**Scenario:** Appointment populated fields are null
**Handling:** Validate names exist before calling summarize, throw error if missing
**Code:** `BackEnd/utils/notesProcessor.js` line ~75

#### ✅ Invalid Summarization Response
**Scenario:** AI service returns malformed JSON
**Handling:** Validate response structure, throw error if invalid
**Code:** `BackEnd/utils/notesProcessor.js` line ~85

---

### 6. PDF Generation Edge Cases

#### ✅ Missing Summary
**Scenario:** Note object has no summary field
**Handling:** Validate note and summary exist before generating PDF
**Code:** `BackEnd/utils/generateNotesPDF.js` line ~15

#### ✅ Missing Appointment Data
**Scenario:** Appointment or populated fields are null
**Handling:** Validate appointment and populated fields exist
**Code:** `BackEnd/utils/generateNotesPDF.js` line ~20

#### ✅ PDF Write Failure
**Scenario:** Disk full or permissions issue during PDF write
**Handling:** Write stream error caught, promise rejected
**Code:** `BackEnd/utils/generateNotesPDF.js` line ~30

#### ✅ Empty PDF Generated
**Scenario:** PDF file created but is 0 bytes
**Handling:** Validate PDF file size after generation, reject if empty
**Code:** `BackEnd/utils/generateNotesPDF.js` line ~110

#### ✅ Malformed Summary Format
**Scenario:** Groq doesn't follow the **Heading** format
**Handling:** Fallback to rendering raw text if format not detected
**Code:** `BackEnd/utils/generateNotesPDF.js` line ~65

---

### 7. Download Edge Cases

#### ✅ Unauthorized Access
**Scenario:** Patient tries to download another patient's notes
**Handling:** Verify patient owns the appointment before allowing download
**Code:** `BackEnd/Controlers/Notes.controller.js` line ~75

#### ✅ Doctor Tries to Download
**Scenario:** Doctor tries to access patient notes
**Handling:** Only patients can download notes (403 Unauthorized)
**Code:** `BackEnd/Controlers/Notes.controller.js` line ~65

#### ✅ PDF File Deleted
**Scenario:** PDF file was manually deleted from disk
**Handling:** Check file exists before streaming, return 404 if missing
**Code:** `BackEnd/Controlers/Notes.controller.js` line ~80

#### ✅ Notes Still Processing
**Scenario:** Patient checks status before processing completes
**Handling:** Return `status: 'processing'` until complete
**Code:** `BackEnd/Controlers/Notes.controller.js` line ~30

#### ✅ Notes Stuck in Processing
**Scenario:** Server restarted mid-processing, note stuck forever
**Handling:** 1-hour timeout, auto-mark as failed if processing too long
**Code:** `BackEnd/Controlers/Notes.controller.js` line ~40

---

### 8. Cleanup Edge Cases

#### ✅ Audio File Not Deleted
**Scenario:** Processing fails before cleanup runs
**Handling:** Cleanup in `finally` block, always runs even on error
**Code:** `BackEnd/utils/notesProcessor.js` line ~95

#### ✅ Partial Audio File
**Scenario:** Download fails mid-stream, partial file left on disk
**Handling:** Cleanup in catch block of download function
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~125

---

### 9. Race Condition Edge Cases

#### ✅ Multiple Join Calls
**Scenario:** Doctor and patient join at exact same time
**Handling:** `scheduleAutoComplete` uses Map to ensure only one timer per appointment
**Code:** `BackEnd/utils/autoCancel.js` line ~25

#### ✅ Concurrent Webhook Processing
**Scenario:** Two webhook requests arrive simultaneously
**Handling:** MongoDB unique index prevents duplicate note creation (atomic operation)
**Code:** `BackEnd/Controlers/Webhook.controller.js` line ~50

---

### 10. Network Edge Cases

#### ✅ VideoSDK API Down
**Scenario:** VideoSDK API is unreachable
**Handling:** Axios throws error, caught in fire-and-forget catch block, logged but doesn't crash
**Code:** `BackEnd/Controlers/Appoitment.controller.js` line ~298

#### ✅ AI Service Down
**Scenario:** FastAPI service is not running
**Handling:** Axios connection error, caught and note marked as failed
**Code:** `BackEnd/utils/notesProcessor.js` line ~85

#### ✅ MongoDB Connection Lost
**Scenario:** Database connection drops mid-processing
**Handling:** Mongoose throws error, caught and logged, processing stops gracefully
**Code:** All database operations wrapped in try-catch

---

## 🔍 Testing Each Edge Case

### Recording Control
```bash
# Test: Start recording twice
# Expected: Second call logs "Already started", no error

# Test: Stop recording twice
# Expected: Second call logs "Already stopped", no error

# Test: Missing WEBHOOK_BASE_URL
# Expected: Error thrown immediately, logged to console
```

### Webhooks
```bash
# Test: Send duplicate webhook
curl -X POST http://localhost:4000/webhook/videosdk \
  -H "Content-Type: application/json" \
  -d '{"event":"session.recording.ready","data":{"meetingId":"test","fileUrl":"https://example.com/test.mp4"}}'
# Run twice — second should log "Duplicate webhook"

# Test: Wrong event type
curl -X POST http://localhost:4000/webhook/videosdk \
  -H "Content-Type: application/json" \
  -d '{"event":"session.started","data":{}}'
# Expected: Returns 200 but does nothing

# Test: Non-existent roomId
curl -X POST http://localhost:4000/webhook/videosdk \
  -H "Content-Type: application/json" \
  -d '{"event":"session.recording.ready","data":{"meetingId":"fake-room-id","fileUrl":"https://example.com/test.mp4"}}'
# Expected: Logs "No appointment found", returns 200
```

### Audio Download
```bash
# Test: Invalid file URL
# Modify webhook to send invalid fileUrl
# Expected: Download fails, note marked as failed

# Test: Empty file
# Modify webhook to send URL that returns 0 bytes
# Expected: Validation catches it, note marked as failed
```

### Transcription
```bash
# Test: Empty audio file
# Upload 0-byte file to /transcribe
# Expected: 400 error "Audio file is empty"

# Test: File too large
# Upload >500 MB file
# Expected: 413 error "Audio file too large"

# Test: Corrupted file
# Upload non-audio file (e.g., text file with .mp4 extension)
# Expected: faster-whisper error, note marked as failed
```

### Summarization
```bash
# Test: Missing GROQ_API_KEY
# Unset GROQ_API_KEY in AI/.env, restart AI service
# Expected: 400 error "GROQ_API_KEY environment variable is not set"

# Test: Empty transcript
curl -X POST http://localhost:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{"transcript":"","doctor_name":"Dr. Smith","patient_name":"John Doe"}'
# Expected: 400 error "Transcript is empty"
```

### PDF Generation
```bash
# Test: Disk full
# Fill disk to capacity, trigger PDF generation
# Expected: Write error caught, note marked as failed

# Test: Missing appointment data
# Manually set appointment.doctor_id to null in DB, trigger PDF generation
# Expected: Validation error, note marked as failed
```

### Download
```bash
# Test: Unauthorized access
# Patient A tries to download Patient B's notes
# Expected: 403 Unauthorized

# Test: Doctor tries to download
# Doctor tries to access /notes/:noteId/download
# Expected: 403 Unauthorized

# Test: PDF deleted
# Manually delete PDF file, patient tries to download
# Expected: 404 "PDF file not found on server"
```

---

## 🛡️ Error Recovery Strategies

### Automatic Recovery
- **Stuck processing**: Auto-fails after 1 hour
- **Duplicate webhooks**: Silently ignored via unique index
- **Recording already started/stopped**: Logged, not treated as error
- **Audio cleanup**: Always runs in finally block

### Manual Recovery
- **Failed notes**: Patient sees "Notes not available" message
- **Missing PDF**: Can be regenerated by re-running processing pipeline
- **Corrupted data**: Admin can manually delete MeetingNote and trigger reprocessing

### Monitoring Recommendations
1. Alert on high failure rate (>10% of notes fail)
2. Alert on stuck processing (notes in 'processing' for >2 hours)
3. Alert on disk space <10% free
4. Alert on VideoSDK API errors
5. Alert on Groq API rate limits

---

## 📊 Error Logging

All errors are logged with context:
```
[Recording] Failed to start recording: <error>
[Webhook] No appointment found for roomId: <roomId>
[Notes] Download failed for appointment <id>: <error>
[Notes] Transcription failed for noteId <id>: <error>
[Notes] processNoteFromAudio failed for noteId <id>: <error>
```

Check logs for:
- `[Recording]` — VideoSDK API issues
- `[Webhook]` — Webhook processing issues
- `[Notes]` — Processing pipeline issues

---

## ✅ All Edge Cases Handled

Every identified edge case has been addressed with proper:
- ✅ Input validation
- ✅ Error handling
- ✅ Cleanup logic
- ✅ User-friendly error messages
- ✅ Logging for debugging
- ✅ Graceful degradation

The implementation is production-ready with comprehensive error handling.
