# AI Meeting Notes - Testing Checklist

## Pre-Testing Setup

### ✅ 1. Verify All Dependencies Installed

**Backend:**
```bash
cd BackEnd
npm list pdfkit
# Should show: pdfkit@0.15.2
```

**AI Service:**
```bash
cd AI
uv pip list | grep faster-whisper
# Should show: faster-whisper 1.0.3
```

### ✅ 2. Verify Environment Variables

**BackEnd/.env:**
```env
DB_URL="mongodb://localhost:27017/MediCare"
PORT=4000
SecretKey="MediCare"
ExpireIn=6h
P_SecretKey="Patient"
WEBHOOK_BASE_URL=http://localhost:4000  # Update with ngrok URL for testing
```

**AI/.env:**
```env
GROQ_API_KEY=<your_groq_key>  # Should already exist
```

### ✅ 3. Setup ngrok (Required for Local Testing)

```bash
# Install ngrok if not already installed
# Download from: https://ngrok.com/download

# Start ngrok in a new terminal
ngrok http 4000

# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# Update BackEnd/.env:
WEBHOOK_BASE_URL=https://abc123.ngrok-free.app
```

### ✅ 4. Verify Directory Structure

```bash
# These should exist (created automatically):
ls BackEnd/uploads/audio/.gitkeep
ls BackEnd/uploads/notes/.gitkeep
```

### ✅ 5. Start All Services

**Terminal 1 - Backend:**
```bash
cd BackEnd
node index.js
# Should see: "DB Connected" and "Server Runing"
```

**Terminal 2 - AI Service:**
```bash
cd AI
uvicorn API.main:app --reload
# Should see: "🚀 Initializing Medical RAG with History Support..."
```

**Terminal 3 - Frontend:**
```bash
cd FrontEnd
npm run dev
# Should see: "Local: http://localhost:5173"
```

**Terminal 4 - ngrok:**
```bash
ngrok http 4000
# Keep this running throughout testing
```

---

## Testing Flow

### Phase 1: Book Appointment

- [ ] Open browser to `http://localhost:5173`
- [ ] Login as a patient (or create new patient account)
- [ ] Navigate to "Find Doctors"
- [ ] Select a doctor
- [ ] Book an available appointment slot
- [ ] Note the appointment time

**Expected Result:** Appointment appears in "My Appointments" with status "booked"

---

### Phase 2: Join Video Call

- [ ] Wait until appointment time (or within 5 minutes before)
- [ ] Open "My Appointments" page
- [ ] Click "Join Call" button on the booked appointment
- [ ] Verify video call page loads

**Backend Console - Expected Log:**
```
[Recording] Started for roomId: <roomId>, appointmentId: <appointmentId>
```

**If you don't see this log:**
- Check `BackEnd/Controlers/Appoitment.controller.js` line ~296
- Verify `startRoomRecording()` is being called
- Check for any error messages

---

### Phase 3: Conduct Video Call

- [ ] Open a second browser window (or incognito mode)
- [ ] Login as the doctor for this appointment
- [ ] Navigate to "Doctor Appointments"
- [ ] Click "Join Call" on the same appointment
- [ ] Both participants should see each other in the video call
- [ ] Have a brief conversation (at least 1-2 minutes)
- [ ] Discuss symptoms, diagnosis, treatment (for realistic transcript)

**Important:** Keep the call going until the appointment end time!

---

### Phase 4: Wait for Appointment to End

- [ ] Stay in the call until the scheduled end time
- [ ] The call should automatically end when time expires

**Backend Console - Expected Log:**
```
Appointment <appointmentId> auto-completed at slot end
[Recording] Stopped for roomId: <roomId>
```

**If you don't see these logs:**
- Check `BackEnd/utils/autoCancel.js` line ~50
- Verify `stopRoomRecording()` is being called
- Check appointment status in MongoDB

---

### Phase 5: Wait for VideoSDK Webhook

**This is the critical step!** VideoSDK needs 1-3 minutes to process the recording.

- [ ] Wait 2-3 minutes after the call ends
- [ ] Watch the backend console for webhook

**Backend Console - Expected Logs:**
```
[Webhook] Recording ready for roomId: <roomId>
[Notes] Downloading recording from VideoSDK...
[Notes] Recording downloaded, starting transcription...
[Notes] Transcribing audio for appointment <appointmentId>...
```

**If webhook doesn't arrive within 5 minutes:**

1. **Check ngrok is running:**
   ```bash
   # In ngrok terminal, you should see:
   POST /webhook/videosdk    200 OK
   ```

2. **Check WEBHOOK_BASE_URL:**
   ```bash
   # In BackEnd/.env, should be:
   WEBHOOK_BASE_URL=https://<your-ngrok-url>.ngrok-free.app
   ```

3. **Check VideoSDK Dashboard:**
   - Login to https://app.videosdk.live
   - Check webhook delivery logs
   - Verify webhook URL is correct

4. **Manual webhook test (if needed):**
   ```bash
   curl -X POST http://localhost:4000/webhook/videosdk \
     -H "Content-Type: application/json" \
     -d '{
       "event": "session.recording.ready",
       "data": {
         "meetingId": "<your-roomId>",
         "fileUrl": "https://example.com/test.mp4"
       }
     }'
   ```

---

### Phase 6: Monitor Processing

**Backend Console - Expected Logs (in order):**
```
[Notes] Downloading recording from VideoSDK...
[Notes] Recording downloaded, starting transcription...
[Notes] Transcribing audio for appointment <appointmentId>...
[Notes] Transcription complete. Duration: <X>s
[Notes] Generating summary...
[Notes] Summary generated.
[Notes] Generating PDF...
[Notes] PDF ready for appointment <appointmentId>: <path>
```

**AI Service Console - Expected Logs:**
```
INFO: 127.0.0.1:xxxxx - "POST /transcribe HTTP/1.1" 200 OK
INFO: 127.0.0.1:xxxxx - "POST /summarize HTTP/1.1" 200 OK
```

**Processing Time:** Typically 1-2 minutes total

**If processing fails:**

1. **Check AI service is running:**
   ```bash
   curl http://localhost:8000/docs
   # Should return FastAPI docs page
   ```

2. **Check faster-whisper model downloaded:**
   ```bash
   ls AI/models/
   # Should contain Whisper model files
   ```

3. **Check disk space:**
   ```bash
   df -h
   # Ensure sufficient space in BackEnd/uploads/
   ```

4. **Check MongoDB for error:**
   ```javascript
   // In MongoDB shell:
   db.meetingnotes.find({ appointment_id: ObjectId("<appointmentId>") })
   // Check 'status' and 'error_message' fields
   ```

---

### Phase 7: Check Notes Status (Patient UI)

- [ ] As the patient, go to "My Appointments" page
- [ ] Find the completed appointment
- [ ] Look for "View Consultation Notes" button below the appointment card
- [ ] Click the button

**Expected Behavior:**

**First click (while processing):**
```
Status: "Notes are being prepared. Check back in a few minutes."
```

**After processing completes:**
```
Status: "Download Consultation Notes (PDF)" (green link)
```

**If button doesn't appear:**
- Verify appointment status is "completed" in MongoDB
- Check browser console for errors
- Verify `FrontEnd/src/pages/MyAppointments.jsx` was updated

---

### Phase 8: Download PDF

- [ ] Click "Download Consultation Notes (PDF)"
- [ ] PDF should download to your browser's download folder
- [ ] Open the PDF

**Expected PDF Content:**

1. **Header:**
   - "MediCare AI" branding
   - "Consultation Summary" subtitle

2. **Metadata:**
   - Date of consultation
   - Time slot
   - Doctor name
   - Patient name

3. **Summary Sections (in order):**
   - **What we discussed**
   - **What the doctor recommended**
   - **Medications or treatments mentioned**
   - **Your next steps**
   - **When to seek urgent care**

4. **Footer:**
   - Generation date
   - "MediCare AI · For personal records only"
   - Disclaimer: "This summary was AI-generated..."

**If PDF is empty or malformed:**
- Check `BackEnd/uploads/notes/<appointmentId>-notes.pdf` exists
- Check backend logs for PDF generation errors
- Verify `pdfkit` is installed correctly

---

## Verification Checklist

### ✅ Database Verification

```javascript
// MongoDB shell commands:

// 1. Check MeetingNote was created
db.meetingnotes.find({ appointment_id: ObjectId("<appointmentId>") }).pretty()
// Should show: status: "complete", transcript, summary, pdf_path

// 2. Check Appointment was linked
db.appoitments.findOne({ _id: ObjectId("<appointmentId>") })
// Should show: meeting_note_id: ObjectId("<noteId>")

// 3. Check audio file was deleted
// In terminal:
ls BackEnd/uploads/audio/
// Should be empty (only .gitkeep)

// 4. Check PDF file exists
ls BackEnd/uploads/notes/
// Should show: <appointmentId>-notes.pdf
```

### ✅ API Endpoint Verification

```bash
# 1. Check notes status endpoint (replace IDs)
curl -X GET http://localhost:4000/appointments/<appointmentId>/notes \
  -H "Cookie: token=<patient-jwt-token>"
# Should return: { "status": "complete", "download_url": "/notes/<noteId>/download" }

# 2. Check download endpoint (replace IDs)
curl -X GET http://localhost:4000/notes/<noteId>/download \
  -H "Cookie: token=<patient-jwt-token>" \
  --output test-download.pdf
# Should download the PDF file
```

### ✅ Security Verification

```bash
# 1. Try to download with wrong patient token (should fail)
curl -X GET http://localhost:4000/notes/<noteId>/download \
  -H "Cookie: token=<different-patient-token>"
# Should return: 403 Unauthorized

# 2. Try to download without auth (should fail)
curl -X GET http://localhost:4000/notes/<noteId>/download
# Should return: 401 Login required
```

---

## Common Issues & Solutions

### Issue: "Webhook not received"

**Solution:**
1. Verify ngrok is running: `curl https://<your-ngrok-url>.ngrok-free.app/webhook/videosdk`
2. Check `WEBHOOK_BASE_URL` in `.env` matches ngrok URL exactly
3. Restart backend after changing `.env`
4. Check VideoSDK dashboard for webhook delivery status

### Issue: "Transcription failed"

**Solution:**
1. Check AI service logs for detailed error
2. Verify `faster-whisper` installed: `uv pip list | grep faster-whisper`
3. Check audio file format (should be MP4)
4. Verify sufficient disk space for model download

### Issue: "Summary is empty or generic"

**Solution:**
1. Check transcript length (must be >50 words)
2. Verify `GROQ_API_KEY` is set in `AI/.env`
3. Check Groq API quota/limits
4. Review AI service logs for LLM errors

### Issue: "PDF not generated"

**Solution:**
1. Verify `pdfkit` installed: `npm list pdfkit`
2. Check `BackEnd/uploads/notes/` directory exists and is writable
3. Review backend logs for PDF generation errors
4. Check summary text is properly formatted

### Issue: "Notes stuck in 'processing'"

**Solution:**
1. Check if >1 hour has passed (auto-fails after timeout)
2. Review backend and AI service logs for errors
3. Check MongoDB `meetingnotes` collection for `error_message`
4. Manually check processing status in database

---

## Success Criteria

All of the following must pass:

- [x] Recording starts when first participant joins
- [x] Recording stops when appointment ends
- [x] Webhook is received within 3 minutes
- [x] Audio is downloaded successfully
- [x] Transcript contains both sides of conversation
- [x] Summary is generated with all 5 sections
- [x] PDF is created with proper formatting
- [x] Patient can view "Check Notes" button
- [x] Patient can download PDF
- [x] PDF contains accurate consultation summary
- [x] Audio file is deleted after processing
- [x] Only the appointment owner can download
- [x] Error states are handled gracefully

---

## Performance Benchmarks

**Expected Timings:**
- Recording start: < 1 second
- Recording stop: < 1 second
- VideoSDK webhook delivery: 1-3 minutes
- Audio download: 10-30 seconds (depends on file size)
- Transcription: 30-60 seconds (for 5-10 minute call)
- Summarization: 5-10 seconds
- PDF generation: < 1 second
- **Total end-to-end: 2-4 minutes** after call ends

---

## Cleanup After Testing

```bash
# 1. Stop all services (Ctrl+C in each terminal)

# 2. Stop ngrok (Ctrl+C)

# 3. Clean up test data (optional)
# MongoDB:
db.meetingnotes.deleteMany({})
db.appoitments.updateMany({}, { $unset: { meeting_note_id: "" } })

# Files:
rm BackEnd/uploads/notes/*.pdf
rm BackEnd/uploads/audio/*.mp4  # Should already be empty

# 4. Reset WEBHOOK_BASE_URL in .env
WEBHOOK_BASE_URL=http://localhost:4000
```

---

**Testing Date:** _____________  
**Tester Name:** _____________  
**Result:** ☐ Pass  ☐ Fail  
**Notes:** _____________________________________________
