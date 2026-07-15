const fs   = require('fs')
const path = require('path')
const MeetingNote      = require('../Models/MeetingNote.model')
const Appoitment_Model = require('../Models/Appoitment.model')
const { processNoteFromAudio, PROCESSING_TIMEOUT_MS } = require('../utils/notesProcessor')

/**
 * GET /appointments/:appointmentId/notes
 * Patient polls this to check if their consultation notes are ready.
 */
const getNoteStatus = async (req, res) => {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized.' })
    }

    const { appointmentId } = req.params

    const appointment = await Appoitment_Model.findById(appointmentId)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })
    if (appointment.patient_id.toString() !== req.PatientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' })
    }

    const note = await MeetingNote.findOne({ appointment_id: appointmentId })
    // No note at all — only show processing if the appointment has a note linked
    // (i.e. audio was uploaded). Otherwise return 'none' so the frontend stays silent.
    if (!note) {
      if (appointment.meeting_note_id) {
        return res.json({ status: 'processing' })
      }
      return res.json({ status: 'none' })
    }

    // Stuck-in-processing recovery — mark failed after 1 hour
    if (note.status === 'processing') {
      const ageMs = Date.now() - new Date(note.created_at).getTime()
      if (ageMs > PROCESSING_TIMEOUT_MS) {
        note.status        = 'failed'
        note.error_message = 'Processing timed out.'
        await note.save()
        return res.json({ status: 'failed' })
      }
    }

    if (note.status === 'complete') {
      return res.json({ status: 'complete', download_url: `/notes/${note._id}/download` })
    }

    return res.json({ status: note.status })

  } catch (err) {
    return res.status(500).json({ message: 'Status check failed.' })
  }
}

/**
 * GET /notes/:noteId/download
 * Streams the PDF to the patient's browser.
 */
const downloadPDF = async (req, res) => {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized.' })
    }

    const note = await MeetingNote.findById(req.params.noteId)
    if (!note || note.status !== 'complete') {
      return res.status(404).json({ message: 'Notes not available.' })
    }

    const appointment = await Appoitment_Model.findById(note.appointment_id)
    if (!appointment || appointment.patient_id.toString() !== req.PatientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' })
    }

    if (!note.pdf_path || !fs.existsSync(note.pdf_path)) {
      return res.status(404).json({ message: 'PDF file not found on server.' })
    }

    res.setHeader('Content-Disposition', 'attachment; filename="meeting-notes.pdf"')
    res.setHeader('Content-Type', 'application/pdf')
    fs.createReadStream(note.pdf_path).pipe(res)

  } catch (err) {
    return res.status(500).json({ message: 'Download failed.' })
  }
}

/**
 * POST /appointments/:appointmentId/upload-audio
 *
 * Patient's browser uploads the recorded audio blob after the meeting ends.
 * This is the primary recording path for local development (no ngrok needed).
 * In production, VideoSDK cloud recording + webhook is used instead.
 *
 * Expects: multipart/form-data with field "audio" (webm/ogg/mp4 blob)
 */
const uploadAudio = async (req, res) => {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized.' })
    }

    const { appointmentId } = req.params
    console.log(`\n[Notes] ===== Audio upload received for appointment: ${appointmentId} =====`)

    // Verify patient owns this appointment
    const appointment = await Appoitment_Model.findById(appointmentId)
      .populate('doctor_id',   'first_Name last_Name')
      .populate('patient_id',  'first_Name last_Name')
      .populate('sechdule_Id', 'date startTime endTime')

    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })
    if (appointment.patient_id._id.toString() !== req.PatientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' })
    }

    if (!req.file) {
      console.error('[Notes] ❌ No file in request — multer did not receive the audio field')
      return res.status(400).json({ message: 'No audio file uploaded.' })
    }

    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2)
    console.log(`[Notes] File received: ${req.file.originalname}`)
    console.log(`[Notes] File size: ${fileSizeMB} MB`)
    console.log(`[Notes] File path: ${req.file.path}`)
    console.log(`[Notes] MIME type: ${req.file.mimetype}`)

    // Idempotency — if note already exists, skip
    const existing = await MeetingNote.findOne({ appointment_id: appointmentId })
    if (existing) {
      console.log(`[Notes] MeetingNote already exists (${existing._id}) — skipping duplicate upload`)
      try { fs.unlinkSync(req.file.path) } catch (_) {}
      return res.json({ message: 'Notes already being processed.', noteId: existing._id })
    }

    // Create MeetingNote
    const note = await MeetingNote.create({
      appointment_id: appointment._id,
      status:         'processing',
      audio_path:     req.file.path
    })
    console.log(`[Notes] ✅ MeetingNote created: ${note._id}`)

    appointment.meeting_note_id = note._id
    await appointment.save()
    console.log(`[Notes] ✅ Appointment linked to note`)

    // Respond immediately, process in background
    res.json({ message: 'Audio received, processing started.', noteId: note._id })
    console.log(`[Notes] Response sent — starting background pipeline`)

    // Run the pipeline
    processNoteFromAudio(note._id.toString(), req.file.path, appointment).catch(err =>
      console.error('[Notes] Upload pipeline error:', err.message)
    )

  } catch (err) {
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path) } catch (_) {}
    }
    console.error('[Notes] uploadAudio error:', err.message)
    return res.status(500).json({ message: 'Upload failed.' })
  }
}

module.exports = { getNoteStatus, downloadPDF, uploadAudio }
