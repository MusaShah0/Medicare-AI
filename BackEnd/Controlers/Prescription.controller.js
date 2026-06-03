const Prescription   = require('../Models/Prescription.model')
const Appointment    = require('../Models/Appoitment.model')
const { createNotification } = require('./Notification.controller')

// POST /prescription/:appointmentId  — doctor creates/updates prescription
const upsertPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const doctorId = req.doctorId
    const { diagnosis, medicines, advice, follow_up_date, vital_signs } = req.body

    if (!diagnosis) return res.status(400).json({ success: false, message: 'Diagnosis is required.' })

    const appt = await Appointment.findOne({ _id: appointmentId, doctor_id: doctorId })
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' })

    const prescription = await Prescription.findOneAndUpdate(
      { appointment_id: appointmentId },
      { appointment_id: appointmentId, doctor_id: doctorId, patient_id: appt.patient_id, diagnosis, medicines: medicines || [], advice: advice || '', follow_up_date: follow_up_date || null, vital_signs: vital_signs || {} },
      { upsert: true, new: true, runValidators: true }
    )

    // Notify patient
    await createNotification({
      recipient_id  : appt.patient_id,
      recipient_role: 'patient',
      type          : 'prescription_ready',
      title         : 'Prescription Available',
      message       : 'Your doctor has added a prescription and clinical notes for your appointment.',
      appointment_id: appointmentId,
    })

    res.json({ success: true, message: 'Prescription saved.', data: prescription })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /prescription/:appointmentId  — doctor or patient views prescription
const getPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const prescription = await Prescription.findOne({ appointment_id: appointmentId })
      .populate('doctor_id',  'first_Name last_Name speciality')
      .populate('patient_id', 'first_Name last_Name age gender')
    if (!prescription) return res.status(404).json({ success: false, message: 'No prescription yet.' })
    res.json({ success: true, data: prescription })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /doctor/patient-history/:patientId  — doctor sees patient's full appointment history
const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params
    const doctorId = req.doctorId

    const appointments = await Appointment.find({ patient_id: patientId })
      .populate('doctor_id',   'first_Name last_Name speciality')
      .populate('sechdule_Id', 'date startTime endTime clinic_fee')
      .sort({ createdAt: -1 })

    const prescriptions = await Prescription.find({ patient_id: patientId })
      .populate('doctor_id', 'first_Name last_Name')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: { appointments, prescriptions } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { upsertPrescription, getPrescription, getPatientHistory }
