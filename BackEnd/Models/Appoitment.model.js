const mongoose = require('mongoose')

const AppoitmentSechema = mongoose.Schema({

  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },

  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },

  sechdule_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sechdule',
    required: true
  },

  status: {
    type: String,
    enum: ['booked', 'ongoing', 'completed', 'cancelled'],
    default: 'booked'
  },

  meeting_id: {
    type: String,
    default: null
  },

  // Doctor triggered a reschedule — patient gets a free rebook token
  is_rescheduled_token: {
    type: Boolean,
    default: false
  },

  // If this appointment was booked using a reschedule token, points to the original cancelled appointment
  rescheduled_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appoitment',
    default: null
  },

  // Reference to the AI-generated meeting notes PDF (set after recording is processed)
  meeting_note_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingNote',
    default: null
  }

}, { timestamps: true })

const Appoitment_Model = mongoose.model('Appoitment', AppoitmentSechema)
module.exports = Appoitment_Model
