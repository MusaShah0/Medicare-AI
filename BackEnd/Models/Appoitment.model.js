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

}, { timestamps: true })

const Appoitment_Model = mongoose.model('Appoitment', AppoitmentSechema)
module.exports = Appoitment_Model
