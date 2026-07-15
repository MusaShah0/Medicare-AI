const moment = require('moment')
const axios = require('axios')
const Sechdule_Model = require('../Models/sechdule.model')
const Appoitment_Model = require('../Models/Appoitment.model')
const { createNotification } = require('./Notification.controller')
const { generateToken } = require('../utils/videoSDK')
const autoCancel = require('../utils/autoCancel')
const { cancelStaleAndFetchUpcoming, incrementDoctorCompletedCount, scheduleAutoComplete, cancelAutoComplete } = require('../utils/autoCancel')
const { startRoomRecording, stopRoomRecording } = require('../utils/recordingSDK')

// GET /Show_Appoitment_Sechdule/:id  — :id = doctorId
// Cancels stale slots on the fly, returns only upcoming available ones grouped by date
const Show_Appoitment_Sechdule = async (req, res) => {
  try {
    const doctorId = req.params.id

    const upcomingSlots = await cancelStaleAndFetchUpcoming({ doctor: doctorId, status: 'available' })

    // cancelStaleAndFetchUpcoming returns available+booked+ongoing — filter to available only for patient view
    const availableSlots = upcomingSlots.filter(s => s.status === 'available')

    if (!availableSlots || availableSlots.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No available slots found' })
    }

    // Group by date string (YYYY-MM-DD)
    const grouped = {}
    for (const slot of availableSlots) {
      const key = moment.utc(slot.date).format('YYYY-MM-DD')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({
        _id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        clinic_fee: slot.clinic_fee,
        slotDuration: slot.slotDuration
      })
    }

    return res.status(200).json({ status: 1, data: grouped })

  } catch (error) {
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

// Helper: parse "HH:mm" to total minutes
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// POST /Book_Appointment/:id  — :id = scheduleId
const Book_Appointment = async (req, res) => {
  try {
    const scheduleId = req.params.id
    const patient_id = req.PatientId

    // Step 1 — Fetch and validate the requested slot
    const schedule = await Sechdule_Model.findById(scheduleId)
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule slot not found' })
    }
    if (schedule.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This slot is no longer available' })
    }

    // Step 2 — Fetch all active appointments for this patient (with populated schedule)
    const existingAppointments = await Appoitment_Model.find({
      patient_id,
      status: { $in: ['booked', 'ongoing'] }
    }).populate('sechdule_Id')

    // Step 3 — Check date + time overlap
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }

    // Normalize to YYYY-MM-DD string using UTC to avoid timezone shifts
    const toDateStr = (d) => moment.utc(d).format('YYYY-MM-DD')

    const requestedDateStr = toDateStr(schedule.date)
    const requestedStart = toMinutes(schedule.startTime)
    const requestedEnd = toMinutes(schedule.endTime)

    const conflicting = existingAppointments.find(appt => {
      const slot = appt.sechdule_Id
      if (!slot || !slot.date || !slot.startTime || !slot.endTime) return false

      // Must be the same calendar date
      if (toDateStr(slot.date) !== requestedDateStr) return false

      const existingStart = toMinutes(slot.startTime)
      const existingEnd = toMinutes(slot.endTime)

      // Overlap when intervals intersect (touching boundaries are NOT overlapping)
      // e.g. existing 9:00–9:30 and new 9:30–10:00 → no overlap (allowed)
      return requestedStart < existingEnd && requestedEnd > existingStart
    })

    // Step 4 — Reject if overlap found
    if (conflicting) {
      const slot = conflicting.sechdule_Id
      return res.status(409).json({
        success: false,
        message: `You already have an appointment on this date from ${slot.startTime} to ${slot.endTime}. Please choose a slot after ${slot.endTime}.`
      })
    }

    // Step 5 — Atomically claim the slot (prevents double-booking race condition)
    const claimed = await Sechdule_Model.findOneAndUpdate(
      { _id: scheduleId, status: 'available' },
      { $set: { status: 'booked' } },
      { new: true }
    )
    if (!claimed) {
      return res.status(409).json({ success: false, message: 'This slot was just taken by another patient. Please choose a different time.' })
    }

    let appointment
    try {
      const token = generateToken()
      const roomResponse = await axios.post('https://api.videosdk.live/v2/rooms', {}, {
        headers: { Authorization: token }
      })
      const validMeetingId = roomResponse.data.roomId

      appointment = new Appoitment_Model({
        patient_id,
        doctor_id: schedule.doctor,
        sechdule_Id: scheduleId,
        status: 'booked',
        meeting_id: validMeetingId
      })
      await appointment.save()
    } catch (innerErr) {
      // Roll back the slot claim if appointment creation fails
      await Sechdule_Model.findByIdAndUpdate(scheduleId, { $set: { status: 'available' } })
      throw innerErr
    }

    // Notify doctor that a new appointment was booked
    await createNotification({
      recipient_id  : schedule.doctor,
      recipient_role: 'doctor',
      type          : 'appointment_booked',
      title         : 'New Appointment Booked',
      message       : `A patient has booked your slot on ${moment.utc(schedule.date).format('MMM D, YYYY')} at ${schedule.startTime}.`,
      appointment_id: appointment._id,
    })

    return res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment })

  } catch (error) {
    console.error('Booking Error:', error)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// GET /My_Appointments  — patient's active appointments
const My_Appointments = async (req, res) => {
  try {
    const patient_id = req.PatientId

    // Sweep both 'booked' and 'ongoing' — autoCancel handles each correctly
    const stale = await Appoitment_Model.find({
      patient_id,
      status: { $in: ['booked', 'ongoing'] }
    }).populate('sechdule_Id')

    await autoCancel(stale, 'appointment')

    const updatedAppointments = await Appoitment_Model.find({
      patient_id,
      $or: [
        { status: { $in: ['booked', 'ongoing'] } },
        { status: 'cancelled', is_rescheduled_token: true },
        { status: 'completed' }
      ]
    })
      .populate('doctor_id', 'first_Name last_Name speciality')
      .populate('sechdule_Id')
      .sort({ createdAt: -1 })

    if (!updatedAppointments || updatedAppointments.length === 0) {
      return res.status(200).json({ status: 1, data: [] })
    }

    return res.status(200).json({ status: 1, data: updatedAppointments })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

// GET /Doctor_Appointments  — doctor's active appointments
const Doctor_Appointments = async (req, res) => {
  try {
    const doctor_id = req.doctorId

    // Sweep both 'booked' and 'ongoing'
    const stale = await Appoitment_Model.find({
      doctor_id,
      status: { $in: ['booked', 'ongoing'] }
    }).populate('sechdule_Id')

    await autoCancel(stale, 'appointment')

    const updatedAppointments = await Appoitment_Model.find({
      doctor_id
    })
      .populate('patient_id', 'first_Name last_Name')
      .populate('sechdule_Id')
      .sort({ createdAt: -1 })

    if (!updatedAppointments || updatedAppointments.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No appointments found' })
    }

    return res.status(200).json({ status: 1, data: updatedAppointments })

  } catch (error) {
    console.error('Doctor_Appointments Error:', error)
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

// GET /get-video-token
const Get_Video_Token = (req, res) => {
  try {
    const token = generateToken()
    res.status(200).json({ status: 1, token })
  } catch (error) {
    res.status(500).json({ status: 0, msg: 'Error generating token' })
  }
}

// GET /join-meeting/:roomId  (requires AnyUser_Check middleware)
const Validate_And_Join_Meeting = async (req, res) => {
  try {
    const { roomId } = req.params

    const appointment = await Appoitment_Model
      .findOne({ meeting_id: roomId })
      .populate('sechdule_Id')
      .populate('patient_id', 'first_Name last_Name')
      .populate('doctor_id', 'first_Name last_Name')

    if (!appointment) {
      return res.status(404).json({ status: 0, msg: 'Invalid Meeting ID' })
    }

    // Block re-join if already completed or cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(403).json({ status: 0, msg: 'This meeting has already ended.' })
    }

    if (!appointment.sechdule_Id || !appointment.doctor_id || !appointment.patient_id) {
      return res.status(500).json({ status: 0, msg: 'Appointment data is incomplete. Please contact support.' })
    }

    const schedule = appointment.sechdule_Id
    const todayMidnight = moment().startOf('day')
    const scheduleDate = moment(schedule.date).startOf('day')

    // Must be today
    if (!scheduleDate.isSame(todayMidnight)) {
      const dateLabel = scheduleDate.format('MMM D, YYYY')
      return res.status(403).json({
        status: 0,
        msg: `This meeting is scheduled for ${dateLabel}, not today.`
      })
    }

    // Parse start / end times
    const [startH, startM] = schedule.startTime.split(':').map(Number)
    const startMoment = moment().hours(startH).minutes(startM).seconds(0).milliseconds(0)

    let endMoment
    if (schedule.endTime) {
      const [endH, endM] = schedule.endTime.split(':').map(Number)
      endMoment = moment().hours(endH).minutes(endM).seconds(0).milliseconds(0)
    } else {
      endMoment = moment(startMoment).add(schedule.slotDuration || 30, 'minutes')
    }

    const now = moment()
    const earlyBuffer = moment(startMoment).subtract(5, 'minutes')

    // Too early
    if (now.isBefore(earlyBuffer)) {
      return res.status(403).json({
        status: 0,
        msg: `Meeting has not started yet. Starts at ${schedule.startTime}.`
      })
    }

    // Slot time has passed — mark completed immediately and block entry
    if (now.isAfter(endMoment)) {
      if (appointment.status !== 'completed') {
        appointment.status = 'completed'
        await appointment.save()
        await incrementDoctorCompletedCount(appointment.doctor_id)
      }
      if (schedule.status !== 'completed') {
        schedule.status = 'completed'
        await schedule.save()
      }
      return res.status(403).json({ status: 0, msg: 'This meeting has ended.' })
    }

    // ── Mark BOTH as 'ongoing' on first join ──────────────────────────────
    if (appointment.status === 'booked') {
      appointment.status = 'ongoing'
      await appointment.save()
      schedule.status = 'ongoing'
      await schedule.save()

      // Start VideoSDK cloud recording for this room (both participants, server-side)
      // Note: only works when WEBHOOK_BASE_URL is a public URL (not localhost).
      // For local dev, browser-side audio recording is used instead (see VideoCall.jsx).
      startRoomRecording(appointment.meeting_id, appointment._id).catch(err =>
        console.error('[Notes] VideoSDK recording start failed:', err.message)
      )
    }

    const remainingMs = endMoment.diff(now)
    const remainingSecs = Math.floor(remainingMs / 1000)

    // ── Register auto-complete timer — idempotent, fires only once per appointment ──
    // scheduleAutoComplete ignores duplicate calls for the same appointmentId,
    // so it's safe that both doctor and patient each trigger this on join.
    scheduleAutoComplete(appointment._id, appointment.doctor_id, remainingMs)

    // ── Participant name ───────────────────────────────────────────────────
    const participantName = req.userRole === 'doctor'
      ? `Dr. ${appointment.doctor_id.first_Name} ${appointment.doctor_id.last_Name}`
      : `${appointment.patient_id.first_Name} ${appointment.patient_id.last_Name}`

    const token = generateToken()

    return res.status(200).json({
      status: 1,
      token,
      participantName,
      doctorName: `Dr. ${appointment.doctor_id.first_Name} ${appointment.doctor_id.last_Name}`,
      patientName: `${appointment.patient_id.first_Name} ${appointment.patient_id.last_Name}`,
      userRole: req.userRole,
      appointmentId: appointment._id,
      validUntil: endMoment.toDate(),
      remainingTime: remainingSecs
    })

  } catch (error) {
    console.error('Join Error:', error)
    return res.status(500).json({ status: 0, msg: 'Server validation error' })
  }
}

// POST /Reschedule_Appointment/:appointmentId  — Doctor only
// Cancels a booked appointment and issues a free rebook token to the patient
const Reschedule_Appointment = async (req, res) => {
  try {
    const doctorId = req.doctorId
    const { appointmentId } = req.params

    const appointment = await Appoitment_Model.findOne({
      _id: appointmentId,
      doctor_id: doctorId,
      status: 'booked'
    }).populate('sechdule_Id')

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Booked appointment not found or you are not authorized'
      })
    }

    // Keep the schedule slot as 'booked' so it stays locked —
    // only the token-holding patient can redeem it via Redeem_Reschedule
    // (Redeem_Reschedule will mark it 'booked' for the new appointment)

    // Cancel the appointment and mark it as having an active reschedule token
    appointment.status = 'cancelled'
    appointment.is_rescheduled_token = true
    await appointment.save()

    // Notify patient
    await createNotification({
      recipient_id  : appointment.patient_id,
      recipient_role: 'patient',
      type          : 'appointment_rescheduled',
      title         : 'Appointment Rescheduled by Doctor',
      message       : `Your doctor has rescheduled your appointment. You have a free rebook token — use it to pick a new slot.`,
      appointment_id: appointment._id,
    })

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled. Patient can now rebook any of your available slots for free.',
      appointmentId: appointment._id
    })

  } catch (error) {
    console.error('Reschedule_Appointment Error:', error)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// POST /Redeem_Reschedule/:appointmentId/:scheduleId  — Patient only
// Patient uses their reschedule token to book a new slot for free
// :appointmentId = the original cancelled appointment that has is_rescheduled_token: true
// :scheduleId    = the new slot the patient wants to book
const Redeem_Reschedule = async (req, res) => {
  try {
    const patient_id = req.PatientId
    const { appointmentId, scheduleId } = req.params

    // Atomically consume the token to prevent double-redemption race
    const originalAppointment = await Appoitment_Model.findOneAndUpdate(
      { _id: appointmentId, patient_id, status: 'cancelled', is_rescheduled_token: true },
      { $set: { is_rescheduled_token: false } },
      { new: true }
    )

    if (!originalAppointment) {
      return res.status(404).json({
        success: false,
        message: 'No valid reschedule token found for this appointment'
      })
    }

    // Atomically claim the new slot (prevents double-booking during redeem)
    const newSchedule = await Sechdule_Model.findOneAndUpdate(
      { _id: scheduleId, doctor: originalAppointment.doctor_id, status: 'available' },
      { $set: { status: 'booked' } },
      { new: true }
    )

    if (!newSchedule) {
      // Roll back: restore the token so the patient can try again
      await Appoitment_Model.findByIdAndUpdate(appointmentId, { $set: { is_rescheduled_token: true } })
      return res.status(409).json({
        success: false,
        message: 'Selected slot is not available or does not belong to the same doctor. Please choose another slot.'
      })
    }

    // Check patient has no overlapping appointment on the new slot's date/time
    const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
    const toDateStr = (d) => moment.utc(d).format('YYYY-MM-DD')

    const existingAppointments = await Appoitment_Model.find({
      patient_id,
      status: { $in: ['booked', 'ongoing'] }
    }).populate('sechdule_Id')

    const requestedDateStr = toDateStr(newSchedule.date)
    const requestedStart = toMinutes(newSchedule.startTime)
    const requestedEnd = toMinutes(newSchedule.endTime)

    const conflicting = existingAppointments.find(appt => {
      const slot = appt.sechdule_Id
      if (!slot || !slot.date || !slot.startTime || !slot.endTime) return false
      if (toDateStr(slot.date) !== requestedDateStr) return false
      const existingStart = toMinutes(slot.startTime)
      const existingEnd = toMinutes(slot.endTime)
      return requestedStart < existingEnd && requestedEnd > existingStart
    })

    if (conflicting) {
      // Roll back: release new slot and restore the token
      await Sechdule_Model.findByIdAndUpdate(scheduleId, { $set: { status: 'available' } })
      await Appoitment_Model.findByIdAndUpdate(appointmentId, { $set: { is_rescheduled_token: true } })
      const slot = conflicting.sechdule_Id
      return res.status(409).json({
        success: false,
        message: `You already have an appointment on this date from ${slot.startTime} to ${slot.endTime}. Please choose a slot after ${slot.endTime}.`
      })
    }

    // Create the new appointment — no payment needed, linked to original
    let newAppointment
    try {
      const token = generateToken()
      const roomResponse = await axios.post('https://api.videosdk.live/v2/rooms', {}, {
        headers: { Authorization: token }
      })
      const validMeetingId = roomResponse.data.roomId

      newAppointment = new Appoitment_Model({
        patient_id,
        doctor_id: originalAppointment.doctor_id,
        sechdule_Id: scheduleId,
        status: 'booked',
        meeting_id: validMeetingId,
        rescheduled_from: originalAppointment._id
      })
      await newAppointment.save()
    } catch (innerErr) {
      // Roll back slot claim and restore token on failure
      await Sechdule_Model.findByIdAndUpdate(scheduleId, { $set: { status: 'available' } })
      await Appoitment_Model.findByIdAndUpdate(appointmentId, { $set: { is_rescheduled_token: true } })
      throw innerErr
    }

    // Free the original locked slot back to available so the doctor can offer it to others
    await Sechdule_Model.findByIdAndUpdate(originalAppointment.sechdule_Id, { status: 'available' })

    return res.status(201).json({
      success: true,
      message: 'Appointment rescheduled successfully. No payment required.',
      data: newAppointment
    })

  } catch (error) {
    console.error('Redeem_Reschedule Error:', error)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// POST /end-meeting/:appointmentId  — Called when meeting ends early (participants leave)
const End_Meeting_Early = async (req, res) => {
  try {
    const { appointmentId } = req.params

    // Verify user is authorized (doctor or patient of this appointment)
    const appointment = await Appoitment_Model.findById(appointmentId)
      .populate('sechdule_Id')

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    if (!appointment.doctor_id || !appointment.patient_id) {
      return res.status(500).json({ success: false, message: 'Appointment data is incomplete.' })
    }

    // Verify the caller is either the doctor or patient of this appointment
    const isDoctor  = req.userRole === 'doctor'  && req.doctorId  && appointment.doctor_id.toString()  === req.doctorId.toString()
    const isPatient = req.userRole === 'patient' && req.PatientId && appointment.patient_id.toString() === req.PatientId.toString()

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    // Atomically claim the 'ongoing' → 'completed' transition to prevent double-increment
    // if auto-complete timer fires at the same time
    const updated = await Appoitment_Model.findOneAndUpdate(
      { _id: appointmentId, status: 'ongoing' },
      { $set: { status: 'completed' } },
      { new: true }
    )
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: `Appointment is not currently ongoing (may have already completed)`
      })
    }

    const schedule = appointment.sechdule_Id
    if (schedule && schedule.status === 'ongoing') {
      schedule.status = 'completed'
      await schedule.save()
    }

    // Increment doctor's completed count
    await incrementDoctorCompletedCount(appointment.doctor_id)

    // Cancel the auto-complete timer (no longer needed)
    cancelAutoComplete(appointmentId)

    // Stop the recording if VideoSDK recording was active
    if (appointment.meeting_id) {
      stopRoomRecording(appointment.meeting_id).catch(() => {})
    }

    return res.status(200).json({ success: true, message: 'Meeting ended successfully' })

  } catch (error) {
    console.error('End_Meeting_Early Error:', error)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// POST /cancel-appointment/:appointmentId  — Patient cancels their own booked appointment
const Cancel_Appointment = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const patient_id = req.PatientId

    const appointment = await Appoitment_Model.findOne({
      _id: appointmentId,
      patient_id,
      status: 'booked',
    }).populate('sechdule_Id').populate('doctor_id', 'first_Name last_Name')

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled.' })
    }

    appointment.status = 'cancelled'
    await appointment.save()

    // Free the schedule slot
    await Sechdule_Model.findByIdAndUpdate(appointment.sechdule_Id._id, { status: 'available' })

    // Notify doctor
    await createNotification({
      recipient_id  : appointment.doctor_id._id,
      recipient_role: 'doctor',
      type          : 'appointment_cancelled',
      title         : 'Appointment Cancelled',
      message       : `A patient has cancelled their appointment scheduled for ${moment.utc(appointment.sechdule_Id.date).format('MMM D, YYYY')} at ${appointment.sechdule_Id.startTime}.`,
      appointment_id: appointment._id,
    })

    return res.status(200).json({ success: true, message: 'Appointment cancelled successfully.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// GET /patient/dashboard-stats  — quick stat counts for the logged-in patient
const Patient_Dashboard_Stats = async (req, res) => {
  try {
    const patient_id = req.PatientId
    const [total, upcoming, completed, cancelled] = await Promise.all([
      Appoitment_Model.countDocuments({ patient_id }),
      Appoitment_Model.countDocuments({ patient_id, status: { $in: ['booked', 'ongoing'] } }),
      Appoitment_Model.countDocuments({ patient_id, status: 'completed' }),
      Appoitment_Model.countDocuments({ patient_id, status: 'cancelled' }),
    ])
    res.json({ success: true, data: { total, upcoming, completed, cancelled } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /doctor/dashboard-stats  — quick stat counts for the logged-in doctor
const Doctor_Dashboard_Stats = async (req, res) => {
  try {
    const doctorId = req.doctorId

    const [total, booked, ongoing, completed, cancelled, availableSlots] = await Promise.all([
      Appoitment_Model.countDocuments({ doctor_id: doctorId }),
      Appoitment_Model.countDocuments({ doctor_id: doctorId, status: 'booked' }),
      Appoitment_Model.countDocuments({ doctor_id: doctorId, status: 'ongoing' }),
      Appoitment_Model.countDocuments({ doctor_id: doctorId, status: 'completed' }),
      Appoitment_Model.countDocuments({ doctor_id: doctorId, status: 'cancelled' }),
      Sechdule_Model.countDocuments({ doctor: doctorId, status: 'available' }),
    ])

    res.json({
      success: true,
      data: {
        total,
        upcoming: booked + ongoing,   // "Upcoming" = booked + currently ongoing
        completed,
        cancelled,
        availableSlots,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  Show_Appoitment_Sechdule,
  Book_Appointment,
  My_Appointments,
  Doctor_Appointments,
  Get_Video_Token,
  Validate_And_Join_Meeting,
  Reschedule_Appointment,
  Redeem_Reschedule,
  End_Meeting_Early,
  Doctor_Dashboard_Stats,
  Cancel_Appointment,
  Patient_Dashboard_Stats,
}
