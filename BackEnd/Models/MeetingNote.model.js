const mongoose = require('mongoose')

const MeetingNoteSchema = new mongoose.Schema({
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appoitment',
    required: true,
    unique: true  // one note per appointment — also acts as idempotency guard
  },
  status: {
    type: String,
    enum: ['processing', 'complete', 'failed'],
    default: 'processing'
  },
  recording_url: { type: String },  // VideoSDK-hosted file URL (valid ~7 days)
  audio_path:    { type: String },  // temporary local path — deleted after PDF generated
  transcript:    { type: String },  // full two-sided transcript from faster-whisper
  summary:       { type: String },  // structured summary from Groq llama-3.1-8b-instant
  pdf_path:      { type: String },  // absolute local path to the generated PDF
  error_message: { type: String },  // set only when status = 'failed'
  created_at:    { type: Date, default: Date.now }
})

const MeetingNote = mongoose.model('MeetingNote', MeetingNoteSchema)
module.exports = MeetingNote
