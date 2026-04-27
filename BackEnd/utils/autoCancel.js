const moment = require('moment')
const Sechdule_Model = require('../Models/sechdule.model')
const DoctorModel = require('../Models/Dooctor.model')

/**
 * Increments the doctor's completed_appointments counter by 1.
 * Safe to call multiple times — uses $inc so no race conditions.
 * @param {ObjectId|string} doctorId
 */
const incrementDoctorCompletedCount = async (doctorId) => {
  if (!doctorId) return
  await DoctorModel.findByIdAndUpdate(doctorId, { $inc: { completed_appointments: 1 } })
}

// ── In-memory registry: appointmentId → timeoutHandle ────────────────────────
// Ensures only ONE auto-complete timer exists per appointment regardless of
// how many times /join-meeting is called (doctor + patient both join = 2 calls).
const _autoCompleteTimers = new Map()

/**
 * Schedules a one-time auto-complete for an appointment at its slot end time.
 * Safe to call multiple times — subsequent calls for the same appointmentId
 * are silently ignored.
 *
 * @param {string}   appointmentId
 * @param {string}   doctorId
 * @param {number}   msUntilEnd   - milliseconds from now until slot end
 */
const scheduleAutoComplete = (appointmentId, doctorId, msUntilEnd) => {
  const key = appointmentId.toString()

  // Already registered — do nothing
  if (_autoCompleteTimers.has(key)) return

  const handle = setTimeout(async () => {
    _autoCompleteTimers.delete(key)
    try {
      const Appoitment_Model = require('../Models/Appoitment.model')

      const apt = await Appoitment_Model.findById(appointmentId)
      if (apt && apt.status === 'ongoing') {
        apt.status = 'completed'
        await apt.save()
        await incrementDoctorCompletedCount(doctorId)
      }

      const sch = apt ? await Sechdule_Model.findById(apt.sechdule_Id) : null
      if (sch && sch.status === 'ongoing') {
        sch.status = 'completed'
        await sch.save()
      }

      console.log(`Appointment ${key} auto-completed at slot end`)
    } catch (err) {
      console.error('Auto-complete error:', err)
    }
  }, msUntilEnd)

  _autoCompleteTimers.set(key, handle)
}

/**
 * Auto-resolves stale appointments and schedules:
 *   - 'booked' past end time  → 'cancelled'  (patient never joined)
 *   - 'ongoing' past end time → 'completed'  (meeting ran out of time)
 *
 * Works for both appointment docs (with populated sechdule_Id)
 * and schedule docs directly.
 *
 * @param {Array}  docs - mongoose documents
 * @param {string} mode - 'appointment' | 'schedule'
 */
const autoCancel = async (docs, mode = 'appointment') => {
  const todayMidnight = moment().startOf('day')
  const nowTime = moment().format('HH:mm')

  for (const doc of docs) {
    const schedule = mode === 'appointment' ? doc.sechdule_Id : doc
    if (!schedule || !schedule.date) continue

    const scheduleDate = moment(schedule.date).startOf('day')
    const isPastDay  = scheduleDate.isBefore(todayMidnight)
    const isToday    = scheduleDate.isSame(todayMidnight)
    const endPassed  = isToday && schedule.endTime && schedule.endTime <= nowTime

    if (isPastDay || endPassed) {
      const wasOngoing = doc.status === 'ongoing'
      // ongoing → completed  |  booked/available → cancelled
      doc.status = wasOngoing ? 'completed' : 'cancelled'
      await doc.save()

      // Increment doctor's completed count when an ongoing appointment finishes
      if (wasOngoing && mode === 'appointment') {
        await incrementDoctorCompletedCount(doc.doctor_id)
      }

      // Also update the linked schedule document when in appointment mode
      if (mode === 'appointment' && schedule.status !== 'completed' && schedule.status !== 'cancelled') {
        schedule.status = doc.status
        await schedule.save()
      }
    }
  }
}

/**
 * Cancels all stale 'available' schedule slots for a given query scope,
 * then returns only the truly upcoming ones.
 *
 * A slot is stale if:
 *   - Its date is before today (midnight), OR
 *   - Its date is today AND its endTime has already passed (or equals now)
 *
 * @param {object} query - mongoose filter to scope which slots to check (e.g. { doctor: id })
 * @returns {Promise<Array>} - active upcoming schedule documents, sorted by date + startTime
 */
const cancelStaleAndFetchUpcoming = async (query) => {
  const todayMidnight = moment().startOf('day').toDate()
  const nowTime = moment().format('HH:mm')
  const todayStr = moment().format('YYYY-MM-DD')

  // Cancel all past-day available slots in one bulk write
  await Sechdule_Model.updateMany(
    { ...query, status: 'available', date: { $lt: todayMidnight } },
    { $set: { status: 'cancelled' } }
  )

  // Cancel today's available slots whose endTime has already passed
  const todaySlots = await Sechdule_Model.find({
    ...query,
    status: 'available',
    date: {
      $gte: moment().startOf('day').toDate(),
      $lte: moment().endOf('day').toDate()
    }
  })

  for (const slot of todaySlots) {
    if (slot.endTime && slot.endTime <= nowTime) {
      slot.status = 'cancelled'
      await slot.save()
    }
  }

  // Return only upcoming active slots: future dates + today's slots not yet ended
  const upcoming = await Sechdule_Model.find({
    ...query,
    status: { $in: ['available', 'booked', 'ongoing'] },
    date: { $gte: todayMidnight }
  }).sort({ date: 1, startTime: 1 })

  // Filter out today's slots that have already ended (edge case between save and re-query)
  return upcoming.filter(slot => {
    const slotDateStr = moment.utc(slot.date).format('YYYY-MM-DD')
    if (slotDateStr !== todayStr) return true
    return slot.endTime > nowTime
  })
}

module.exports = autoCancel
module.exports.cancelStaleAndFetchUpcoming = cancelStaleAndFetchUpcoming
module.exports.incrementDoctorCompletedCount = incrementDoctorCompletedCount
module.exports.scheduleAutoComplete = scheduleAutoComplete
