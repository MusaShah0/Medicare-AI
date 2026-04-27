const moment = require('moment')
const Sechdule_Model = require('../Models/sechdule.model')
const autoCancel = require('../utils/autoCancel')
const { cancelStaleAndFetchUpcoming } = require('../utils/autoCancel')

// POST /Add_Sechdule
// Body: { dates: ["2025-07-14", "2025-07-16"], slots: [{startTime, endTime}], clinic_fee, slotDuration }
const Add_Sechdule = async (req, res) => {
  try {
    const { dates, slots, clinic_fee, slotDuration } = req.body
    const doctorId = req.doctorId

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one date.' })
    }
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one time slot.' })
    }

    const todayMidnight = moment().startOf('day')

    // Step 1 — Reject past dates upfront, collect ALL invalid ones before responding
    const invalidDates = []
    for (const dateStr of dates) {
      const d = moment(dateStr, 'YYYY-MM-DD', true)
      if (!d.isValid()) {
        return res.status(400).json({ success: false, message: `Invalid date format: ${dateStr}. Use YYYY-MM-DD.` })
      }
      if (d.isBefore(todayMidnight)) {
        invalidDates.push(dateStr)
      }
    }
    if (invalidDates.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add schedule for past dates',
        invalidDates
      })
    }

    // Step 2 — Check ALL date×slot combos for conflicts before inserting anything
    const conflicts = []
    const schedulesToSave = []

    for (const dateStr of dates) {
      const dateObj = moment(dateStr, 'YYYY-MM-DD').toDate()

      for (const slot of slots) {
        const existing = await Sechdule_Model.findOne({
          doctor: doctorId,
          date: dateObj,
          startTime: slot.startTime,
          status: { $in: ['available', 'booked', 'ongoing'] }
        })

        if (existing) {
          conflicts.push({ date: dateStr, startTime: slot.startTime })
        } else {
          schedulesToSave.push({
            doctor: doctorId,
            date: dateObj,
            startTime: slot.startTime,
            endTime: slot.endTime,
            clinic_fee,
            slotDuration,
            status: 'available'
          })
        }
      }
    }

    // If ANY conflict found — reject the entire batch, never partial insert
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Some slots already exist for the selected dates and times',
        conflicts
      })
    }

    // Step 3 — No conflicts, bulk insert
    await Sechdule_Model.insertMany(schedulesToSave)

    return res.status(201).json({
      success: true,
      message: 'Schedule added successfully',
      count: schedulesToSave.length
    })

  } catch (error) {
    console.error('Add_Sechdule Error:', error)
    return res.status(500).json({ success: false, message: 'Failed to add schedule', error: error.message })
  }
}

// GET /Show_Doctor_Sechdule
// Cancels all stale slots on the fly, then returns only upcoming active ones
const Show_Doctor_Sechdule = async (req, res) => {
  try {
    const doctorId = req.doctorId

    const activeSchedules = await cancelStaleAndFetchUpcoming({ doctor: doctorId })

    if (!activeSchedules || activeSchedules.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No upcoming schedules found' })
    }

    return res.status(200).json({ status: 1, data: activeSchedules })

  } catch (error) {
    console.error('Show_Doctor_Sechdule Error:', error)
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

// GET /Show_Doctor_Sechdule/:id  — :id is now a date string (YYYY-MM-DD)
const Show_Doctor_Sechdule_Day = async (req, res) => {
  try {
    const dateStr = req.params.id
    const doctorId = req.doctorId

    const d = moment(dateStr, 'YYYY-MM-DD', true)
    if (!d.isValid()) {
      return res.status(400).json({ status: 0, msg: 'Invalid date format. Use YYYY-MM-DD.' })
    }

    const startOfDay = d.startOf('day').toDate()
    const endOfDay = moment(dateStr, 'YYYY-MM-DD').endOf('day').toDate()

    const schedules = await Sechdule_Model.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ startTime: 1 })

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No schedules found for this date' })
    }

    return res.status(200).json({ status: 1, data: schedules })

  } catch (error) {
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

// DELETE /Delete_Sechdule/:id  — deletes by _id, no change needed
const Delete_Sechdule = async (req, res) => {
  try {
    const sechduleId = req.params.id
    const doctorId = req.doctorId

    const sechdule = await Sechdule_Model.findOneAndDelete({
      _id: sechduleId,
      doctor: doctorId
    })

    if (!sechdule) {
      return res.status(404).json({ status: 0, msg: 'Schedule not found or unauthorized' })
    }

    return res.status(200).json({ status: 1, msg: 'Schedule deleted successfully' })

  } catch (error) {
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

// GET /Show_Sechdule_Status/:status  — no change needed
const Show_Sechdule_Status = async (req, res) => {
  try {
    const status = req.params.status
    const doctorId = req.doctorId

    const sechdule = await Sechdule_Model.find({ status, doctor: doctorId })

    if (!sechdule || sechdule.length === 0) {
      return res.status(404).json({ status: 0, msg: 'No schedules found for this status' })
    }

    return res.status(200).json({ status: 1, data: sechdule })

  } catch (error) {
    return res.status(500).json({ status: 0, msg: 'Server error', error: error.message })
  }
}

module.exports = { Add_Sechdule, Show_Doctor_Sechdule, Show_Doctor_Sechdule_Day, Delete_Sechdule, Show_Sechdule_Status }
