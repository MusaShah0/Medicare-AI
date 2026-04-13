const moment = require('moment')
const axios = require('axios')
const Sechdule_Model = require('../Models/sechdule.model')
const Appoitment_Model = require('../Models/Appoitment.model')
const { generateToken } = require('../utils/videoSDK')
const autoCancel = require('../utils/autoCancel')

// GET /Show_Appoitment_Sechdule/:id  — :id = doctorId
// Returns available future slots grouped by date
const Show_Appoitment_Sechdule = async (req, res) => {
  try {
    const doctorId = req.params.id
    const todayMidnight = moment().startOf('day').toDate()

    const slots = await Sechdule_Model.find({
      doctor: doctorId,
      status: 'available',
      date: { $gte: todayMidnight }
    }).sort({ date: 1, startTime: 1 })

    if (!slots || slots.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No available slots found' })
    }

    // Group by date string (YYYY-MM-DD)
    const grouped = {}
    for (const slot of slots) {
      const key = moment(slot.date).format('YYYY-MM-DD')
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

    // Step 2 — Fetch all active appointments for this patient
    const existingAppointments = await Appoitment_Model.find({
      patient_id,
      status: { $in: ['booked', 'ongoing'] }
    }).populate('sechdule_Id')

    // Step 3 — Check date + time overlap
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }

    const requestedDate = moment(schedule.date).startOf('day')
    const requestedStart = toMinutes(schedule.startTime)
    const requestedEnd = toMinutes(schedule.endTime)

    const conflicting = existingAppointments.find(appt => {
      if (!appt.sechdule_Id) return false
      const existingDate = moment(appt.sechdule_Id.date).startOf('day')
      if (!requestedDate.isSame(existingDate)) return false

      const existingStart = toMinutes(appt.sechdule_Id.startTime)
      const existingEnd = toMinutes(appt.sechdule_Id.endTime)

      // Overlap: not (requestedEnd <= existingStart || requestedStart >= existingEnd)
      return !(requestedEnd <= existingStart || requestedStart >= existingEnd)
    })

    // Step 4 — Reject if overlap found
    if (conflicting) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment on this date that overlaps with this time slot'
      })
    }

    // Step 5 — No conflict, proceed with booking
    const token = generateToken()
    const roomResponse = await axios.post('https://api.videosdk.live/v2/rooms', {}, {
      headers: { Authorization: token }
    })
    const validMeetingId = roomResponse.data.roomId

    const appointment = new Appoitment_Model({
      patient_id,
      doctor_id: schedule.doctor,
      sechdule_Id: scheduleId,
      status: 'booked',
      meeting_id: validMeetingId
    })
    await appointment.save()

    schedule.status = 'booked'
    await schedule.save()

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
      status: { $in: ['booked', 'ongoing'] }
    })
      .populate('doctor_id', 'first_Name last_Name speciality')
      .populate('sechdule_Id')
      .sort({ createdAt: -1 })

    if (!updatedAppointments || updatedAppointments.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No active appointments found' })
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
      doctor_id,
      status: { $in: ['booked', 'ongoing'] }
    })
      .populate('patient_id', 'first_Name last_Name')
      .populate('sechdule_Id')
      .sort({ createdAt: -1 })

    if (!updatedAppointments || updatedAppointments.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No active appointments found' })
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
      // Mark both documents completed right now
      if (appointment.status !== 'completed') {
        appointment.status = 'completed'
        await appointment.save()
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
    }

    const remainingMs = endMoment.diff(now)
    const remainingSecs = Math.floor(remainingMs / 1000)

    // ── Schedule auto-complete for BOTH documents at exact end time ────────
    // Use the absolute end timestamp so even if this fires slightly late it's correct
    const msUntilEnd = endMoment.diff(moment())
    setTimeout(async () => {
      try {
        const apt = await Appoitment_Model.findById(appointment._id)
        if (apt && apt.status === 'ongoing') {
          apt.status = 'completed'
          await apt.save()
        }
        const sch = await Sechdule_Model.findById(schedule._id)
        if (sch && sch.status === 'ongoing') {
          sch.status = 'completed'
          await sch.save()
        }
        console.log(`Appointment ${appointment._id} auto-completed at slot end`)
      } catch (err) {
        console.error('Auto-complete error:', err)
      }
    }, msUntilEnd)

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
      validUntil: endMoment.toDate(),
      remainingTime: remainingSecs
    })

  } catch (error) {
    console.error('Join Error:', error)
    return res.status(500).json({ status: 0, msg: 'Server validation error' })
  }
}

module.exports = {
  Show_Appoitment_Sechdule,
  Book_Appointment,
  My_Appointments,
  Doctor_Appointments,
  Get_Video_Token,
  Validate_And_Join_Meeting
}
