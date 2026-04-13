const moment = require('moment')

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
  const nowTime = moment().format('HH:mm') // "HH:mm" string for simple comparison

  for (const doc of docs) {
    const schedule = mode === 'appointment' ? doc.sechdule_Id : doc
    if (!schedule || !schedule.date) continue

    const scheduleDate = moment(schedule.date).startOf('day')
    const isPastDay  = scheduleDate.isBefore(todayMidnight)
    const isToday    = scheduleDate.isSame(todayMidnight)
    const endPassed  = isToday && schedule.endTime && schedule.endTime < nowTime

    if (isPastDay || endPassed) {
      // ongoing → completed  |  booked → cancelled
      doc.status = doc.status === 'ongoing' ? 'completed' : 'cancelled'
      await doc.save()

      // Also update the linked schedule document when in appointment mode
      if (mode === 'appointment' && schedule.status !== 'completed' && schedule.status !== 'cancelled') {
        schedule.status = doc.status
        await schedule.save()
      }
    }
  }
}

module.exports = autoCancel
