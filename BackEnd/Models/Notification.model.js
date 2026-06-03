const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  recipient_id   : { type: mongoose.Schema.Types.ObjectId, required: true },
  recipient_role : { type: String, enum: ['doctor', 'patient'], required: true },
  type           : { type: String, required: true }, // 'appointment_booked' | 'appointment_cancelled' | 'appointment_rescheduled' | 'prescription_ready'
  title          : { type: String, required: true },
  message        : { type: String, required: true },
  appointment_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Appoitment', default: null },
  read           : { type: Boolean, default: false },
}, { timestamps: true })

NotificationSchema.index({ recipient_id: 1, read: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', NotificationSchema)
