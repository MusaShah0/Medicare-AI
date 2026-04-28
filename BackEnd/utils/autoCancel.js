const moment = require('moment')
const Sechdule_Model = require('../Models/sechdule.model')
const DoctorModel = require('../Models/Dooctor.model')
const { stopRoomRecording, pollForRecording, isLocalhost } = require('./recordingSDK')

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
    try {
      const Appoitment_Model = require('../Models/Appoitment.model')

      // Atomic update: only complete if still 'ongoing' — prevents double-increment with End_Meeting_Early
      const apt = await Appoitment_Model.findOneAndUpdate(
        { _id: appointmentId, status: 'ongoing' },
        { $set: { status: 'completed' } },
        { new: true }
      )
      if (apt) {
        await incrementDoctorCompletedCount(doctorId)

        if (apt.meeting_id) {
          // Stop the recording
          stopRoomRecording(apt.meeting_id).catch(() => {})

          // If WEBHOOK_BASE_URL is localhost, VideoSDK can't deliver the webhook.
          // Use polling fallback regardless of whether recording start succeeded —
          // VideoSDK may have auto-captured the session even if our start call failed.
          if (isLocalhost()) {
            triggerPollingFallback(apt).catch(err =>
              console.error('[Notes] Polling fallback error:', err.message)
            )
          }
        }
      }

      const sch = apt ? await Sechdule_Model.findById(apt.sechdule_Id) : null
      if (sch && sch.status === 'ongoing') {
        sch.status = 'completed'
        await sch.save()
      }

      console.log(`[Notes] Appointment ${key} auto-completed at slot end`)
    } catch (err) {
      console.error('Auto-complete error:', err)
    } finally {
      _autoCompleteTimers.delete(key)
    }
  }, msUntilEnd)

  _autoCompleteTimers.set(key, handle)
}

/**
 * Cancels a scheduled auto-complete timer.
 * Called when the meeting ends early (participants leave before slot end time).
 *
 * @param {string} appointmentId
 */
const cancelAutoComplete = (appointmentId) => {
  const key = appointmentId.toString()
  const handle = _autoCompleteTimers.get(key)
  
  if (handle) {
    clearTimeout(handle)
    _autoCompleteTimers.delete(key)
  }
}

/**
 * Polling fallback for local development when WEBHOOK_BASE_URL is localhost.
 * VideoSDK cannot deliver webhooks to localhost, so we poll their API instead.
 * Mimics exactly what the webhook handler does.
 */
async function triggerPollingFallback(apt) {
  const { pollForRecording } = require('./recordingSDK')
  const MeetingNote = require('../Models/MeetingNote.model')
  const Appoitment_Model = require('../Models/Appoitment.model')

  // Wait for VideoSDK to process the recording (usually 1-3 min after session ends)
  console.log(`[Notes] Polling fallback started — waiting 90s for VideoSDK to process recording...`)
  await new Promise(r => setTimeout(r, 90000))

  const result = await pollForRecording(apt.meeting_id)
  if (!result) {
    console.error(`[Notes] No recording found for roomId: ${apt.meeting_id} — notes will not be generated`)
    return
  }

  // Re-fetch appointment with populated fields
  const appointment = await Appoitment_Model.findById(apt._id)
    .populate('doctor_id',   'first_Name last_Name')
    .populate('patient_id',  'first_Name last_Name')
    .populate('sechdule_Id', 'date startTime endTime')

  if (!appointment) return
  if (!appointment.doctor_id || !appointment.patient_id || !appointment.sechdule_Id) return

  // Idempotency — skip if note already exists
  const existing = await MeetingNote.findOne({ appointment_id: appointment._id })
  if (existing) return

  let note
  try {
    note = await MeetingNote.create({
      appointment_id: appointment._id,
      status: 'processing',
      recording_url: result.fileUrl
    })
  } catch (err) {
    if (err.code === 11000) return
    throw err
  }

  appointment.meeting_note_id = note._id
  await appointment.save()

  console.log(`[Notes] MeetingNote ${note._id} created via polling — starting pipeline`)

  const { downloadAndProcessFromUrl } = require('../Controlers/Webhook.controller')
  downloadAndProcessFromUrl(note._id.toString(), result.fileUrl, appointment).catch(err =>
    console.error('[Notes] Polling pipeline error:', err.message)
  )
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

      // If an ongoing appointment is auto-completed and has no notes yet,
      // trigger the polling fallback so notes are still generated after a server restart
      if (wasOngoing && mode === 'appointment' && doc.meeting_id && isLocalhost()) {
        const MeetingNote = require('../Models/MeetingNote.model')
        const existing = await MeetingNote.findOne({ appointment_id: doc._id })
        if (!existing) {
          triggerPollingFallback(doc).catch(err =>
            console.error('[Notes] autoCancel polling fallback error:', err.message)
          )
        }
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
module.exports.cancelAutoComplete = cancelAutoComplete
module.exports.triggerPollingFallback = triggerPollingFallback
