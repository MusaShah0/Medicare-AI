const mongoose = require('mongoose')

const MedicineSchema = new mongoose.Schema({
  name        : { type: String, required: true },
  dosage      : { type: String, required: true }, // e.g. "500mg"
  frequency   : { type: String, required: true }, // e.g. "Twice daily"
  duration    : { type: String, required: true }, // e.g. "7 days"
  instructions: { type: String, default: '' },    // e.g. "Take after meals"
}, { _id: false })

const PrescriptionSchema = new mongoose.Schema({
  appointment_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Appoitment', required: true, unique: true },
  doctor_id      : { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',     required: true },
  patient_id     : { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',    required: true },
  diagnosis      : { type: String, required: true },
  medicines      : { type: [MedicineSchema], default: [] },
  advice         : { type: String, default: '' },
  follow_up_date : { type: Date,   default: null },
  vital_signs    : {
    blood_pressure : { type: String, default: '' },
    temperature    : { type: String, default: '' },
    pulse          : { type: String, default: '' },
    weight         : { type: String, default: '' },
  },
}, { timestamps: true })

module.exports = mongoose.model('Prescription', PrescriptionSchema)
