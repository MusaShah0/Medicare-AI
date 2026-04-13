const ReviewModel = require('../Models/Rewiew.model')
const Appoitment_Model = require('../Models/Appoitment.model')

// POST /review
// Patient submits a review for a completed appointment
const Submit_Review = async (req, res) => {
  try {
    const patient_id = req.PatientId
    const { appointment_id, rating, review } = req.body

    if (!appointment_id || !rating) {
      return res.status(400).json({ success: false, message: 'appointment_id and rating are required' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    // Verify the appointment belongs to this patient and is completed
    const appointment = await Appoitment_Model.findOne({
      _id: appointment_id,
      patient_id,
      status: 'completed'
    })

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Completed appointment not found'
      })
    }

    // Prevent duplicate review for the same appointment
    const existing = await ReviewModel.findOne({ appointment_id })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this appointment'
      })
    }

    const newReview = await ReviewModel.create({
      doctor_id: appointment.doctor_id,
      patient_id,
      appointment_id,
      rating,
      review: review || ''
    })

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: newReview
    })

  } catch (error) {
    console.error('Submit_Review Error:', error)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// GET /review/check/:appointmentId
// Returns whether the patient has already reviewed this appointment
const Check_Review = async (req, res) => {
  try {
    const patient_id = req.PatientId
    const { appointmentId } = req.params

    const existing = await ReviewModel.findOne({
      appointment_id: appointmentId,
      patient_id
    })

    return res.status(200).json({
      success: true,
      reviewed: !!existing,
      data: existing || null
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// GET /review/doctor/:doctorId
// Public — get all reviews for a doctor
const Get_Doctor_Reviews = async (req, res) => {
  try {
    const { doctorId } = req.params

    const reviews = await ReviewModel
      .find({ doctor_id: doctorId })
      .populate('patient_id', 'first_Name last_Name')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

module.exports = { Submit_Review, Check_Review, Get_Doctor_Reviews }
