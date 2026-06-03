const axios    = require('axios')
const fs       = require('fs')
const FormData = require('form-data')
const MeetingNote      = require('../Models/MeetingNote.model')
const { generateNotesPDF } = require('./generateNotesPDF')

const AI_SERVICE_URL      = 'http://127.0.0.1:8000'
const PROCESSING_TIMEOUT_MS = 60 * 60 * 1000 // 1 hour

const processNoteFromAudio = async (noteId, audioPath, appointment) => {
  const note = await MeetingNote.findById(noteId)
  if (!note) {
    console.error(`[Notes] Pipeline ❌ Note ${noteId} not found in DB`)
    return
  }

  console.log(`\n[Notes] ===== Pipeline start =====`)
  console.log(`[Notes] noteId:        ${noteId}`)
  console.log(`[Notes] appointmentId: ${appointment._id}`)
  console.log(`[Notes] audioPath:     ${audioPath}`)

  const cleanupAudio = () => {
    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath)
        console.log(`[Notes] Step 5 ✅ Audio file deleted`)
      }
    } catch (e) {
      console.error(`[Notes] Step 5 ⚠️  Could not delete audio:`, e.message)
    }
  }

  try {
    // ── Step 1: Validate audio file ───────────────────────────────────────
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at: ${audioPath}`)
    }
    const audioStats = fs.statSync(audioPath)
    if (audioStats.size === 0) {
      throw new Error('Audio file is empty (0 bytes)')
    }
    console.log(`[Notes] Step 1 ✅ Audio file valid — ${(audioStats.size / 1024 / 1024).toFixed(2)} MB`)

    // ── Step 2: Transcribe ────────────────────────────────────────────────
    console.log(`[Notes] Step 2 — Sending to AI service for transcription...`)
    console.log(`[Notes] Step 2 — POST ${AI_SERVICE_URL}/transcribe`)

    const form = new FormData()
    form.append('audio_file', fs.createReadStream(audioPath), {
      filename:    `${appointment._id}.webm`,
      contentType: 'audio/webm'
    })

    let transcribeRes
    try {
      transcribeRes = await axios.post(`${AI_SERVICE_URL}/transcribe`, form, {
        headers:          form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength:    Infinity,
        timeout:          10 * 60 * 1000
      })
    } catch (err) {
      throw new Error(`Transcription failed: ${err.response?.data?.detail || err.message}`)
    }

    if (!transcribeRes.data || typeof transcribeRes.data.transcript !== 'string') {
      throw new Error('Invalid transcription response — missing transcript field')
    }

    const transcript = transcribeRes.data.transcript || ''
    const wordCount  = transcript.trim().split(/\s+/).filter(Boolean).length
    console.log(`[Notes] Step 2 ✅ Transcription complete`)
    console.log(`[Notes] Step 2 — Duration: ${transcribeRes.data.duration?.toFixed(1)}s | Words: ${wordCount}`)
    console.log(`[Notes] Step 2 — Preview: "${transcript.slice(0, 120)}..."`)

    // ── Short/empty transcript guard ──────────────────────────────────────
    if (wordCount < 50) {
      console.log(`[Notes] Step 2 ⚠️  Transcript < 50 words — generating default summary`)
      note.transcript = transcript
      note.summary    = 'This meeting recording did not contain enough audio to generate a summary. The session may have been very brief or one participant did not join.'
      note.pdf_path   = await generateNotesPDF(note, appointment)
      note.status     = 'complete'
      await note.save()
      console.log(`[Notes] ✅ Notes complete (short transcript) — ${note.pdf_path}`)
      cleanupAudio()
      return
    }

    note.transcript = transcript
    await note.save()

    // ── Step 3: Summarize ─────────────────────────────────────────────────
    const doctorName  = `Dr. ${appointment.doctor_id.first_Name} ${appointment.doctor_id.last_Name}`
    const patientName = `${appointment.patient_id.first_Name} ${appointment.patient_id.last_Name}`
    console.log(`[Notes] Step 3 — Summarizing for ${doctorName} / ${patientName}`)
    console.log(`[Notes] Step 3 — POST ${AI_SERVICE_URL}/summarize`)

    let summarizeRes
    try {
      summarizeRes = await axios.post(`${AI_SERVICE_URL}/summarize`, {
        transcript:   note.transcript,
        doctor_name:  doctorName,
        patient_name: patientName
      }, { timeout: 60 * 1000 })
    } catch (err) {
      throw new Error(`Summarization failed: ${err.response?.data?.detail || err.message}`)
    }

    if (!summarizeRes.data || typeof summarizeRes.data.summary !== 'string') {
      throw new Error('Invalid summarization response — missing summary field')
    }

    note.summary = summarizeRes.data.summary
    await note.save()
    console.log(`[Notes] Step 3 ✅ Summary generated — ${note.summary.length} chars`)

    // ── Step 4: Generate PDF ──────────────────────────────────────────────
    console.log(`[Notes] Step 4 — Generating PDF...`)
    note.pdf_path = await generateNotesPDF(note, appointment)
    note.status   = 'complete'
    await note.save()
    console.log(`[Notes] Step 4 ✅ PDF generated — ${note.pdf_path}`)
    console.log(`[Notes] ===== Pipeline complete for appointment ${appointment._id} =====\n`)

  } catch (err) {
    note.status        = 'failed'
    note.error_message = err.message || 'Processing pipeline failed'
    await note.save()
    console.error(`[Notes] ❌ Pipeline failed for appointment ${appointment._id}:`, err.message)
  } finally {
    cleanupAudio()
  }
}

module.exports = { processNoteFromAudio, PROCESSING_TIMEOUT_MS }
