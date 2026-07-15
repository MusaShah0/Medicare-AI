const axios = require('axios')
const fs = require('fs')
const path = require('path')
const Appoitment_Model = require('../Models/Appoitment.model')
const MeetingNote = require('../Models/MeetingNote.model')
const { processNoteFromAudio } = require('../utils/notesProcessor')

const handleVideoSDKWebhook = async (req, res) => {
  res.status(200).json({ received: true })

  try {
    const { event, data } = req.body || {}

    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('[Notes] Webhook received empty body — check express.json() is registered before routes')
      return
    }

    if (event !== 'session.recording.ready') return
    if (!data?.meetingId || !data?.fileUrl) return

    const roomId  = data.meetingId
    const fileUrl = data.fileUrl
    console.log(`[Notes] Recording ready for roomId: ${roomId}`)

    const appointment = await Appoitment_Model.findOne({ meeting_id: roomId })
      .populate('doctor_id',   'first_Name last_Name')
      .populate('patient_id',  'first_Name last_Name')
      .populate('sechdule_Id', 'date startTime endTime')

    if (!appointment) {
      console.error(`[Notes] No appointment found for roomId: ${roomId}`)
      return
    }

    if (!['completed', 'ongoing'].includes(appointment.status)) {
      console.log(`[Notes] Appointment ${appointment._id} is "${appointment.status}" — skipping notes`)
      return
    }

    if (!appointment.doctor_id || !appointment.patient_id || !appointment.sechdule_Id) {
      console.error(`[Notes] Appointment ${appointment._id} has missing populated fields`)
      return
    }

    let note
    try {
      note = await MeetingNote.create({
        appointment_id: appointment._id,
        status: 'processing',
        recording_url: fileUrl
      })
    } catch (err) {
      if (err.code === 11000) return // duplicate webhook — already processing
      throw err
    }

    appointment.meeting_note_id = note._id
    await appointment.save()

    console.log(`[Notes] MeetingNote ${note._id} created — starting pipeline`)
    downloadAndProcess(note._id.toString(), fileUrl, appointment).catch(err =>
      console.error('[Notes] Pipeline error:', err.message)
    )

  } catch (err) {
    console.error('[Notes] Webhook handler error:', err.message)
  }
}

async function downloadAndProcess(noteId, fileUrl, appointment) {
  const note = await MeetingNote.findById(noteId)
  if (!note) return

  const audioDir = path.resolve(__dirname, '../uploads/audio')
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true })

  const audioPath = path.join(audioDir, `${appointment._id}.mp4`)

  try {
    console.log(`[Notes] Downloading recording...`)
    const response = await axios.get(fileUrl, {
      responseType: 'stream',
      timeout: 5 * 60 * 1000,
      maxRedirects: 5
    })

    const writer = fs.createWriteStream(audioPath)
    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        writer.destroy()
        reject(new Error('Download timed out after 5 minutes'))
      }, 5 * 60 * 1000)
      writer.on('finish', () => { clearTimeout(timeout); resolve() })
      writer.on('error', (e) => { clearTimeout(timeout); reject(e) })
    })

    if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size === 0) {
      throw new Error('Downloaded file is empty or missing')
    }

    const sizeMB = (fs.statSync(audioPath).size / 1024 / 1024).toFixed(2)
    console.log(`[Notes] Download complete — ${sizeMB} MB`)

    note.audio_path = audioPath
    await note.save()

    await processNoteFromAudio(note._id.toString(), audioPath, appointment)

  } catch (err) {
    try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath) } catch (_) {}
    note.status        = 'failed'
    note.error_message = `Download failed: ${err.message}`
    await note.save()
    console.error(`[Notes] Download failed for appointment ${appointment._id}:`, err.message)
  }
}

module.exports = { handleVideoSDKWebhook, downloadAndProcessFromUrl: downloadAndProcess }
