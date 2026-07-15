const mongoose = require('mongoose')

const SechduleSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clinic_fee: {
    type: Number,
    required: true
  },
  slotDuration: {
    type: Number
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'completed', 'cancelled', 'ongoing'],
    default: 'available'
  }
}, { timestamps: true })

// Prevent duplicate slots for same doctor on same date+time
SechduleSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true })

const Sechdule_Model = mongoose.model('Sechdule', SechduleSchema)
module.exports = Sechdule_Model
