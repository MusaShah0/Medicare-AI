const Notification = require('../Models/Notification.model')

// Helper used by other controllers to fire a notification
const createNotification = async ({ recipient_id, recipient_role, type, title, message, appointment_id = null }) => {
  try {
    await Notification.create({ recipient_id, recipient_role, type, title, message, appointment_id })
  } catch (err) {
    console.error('Notification create error:', err.message)
  }
}

// GET /notifications  — returns unread count + last 30 for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const id   = req.doctorId || req.PatientId
    const role = req.userRole  // set by Doctor_Check / Patient_Check / AnyUser_Check

    const notifications = await Notification.find({ recipient_id: id })
      .sort({ createdAt: -1 })
      .limit(30)

    const unread = notifications.filter(n => !n.read).length

    res.json({ success: true, unread, data: notifications })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /notifications/read-all  — mark all as read
const markAllRead = async (req, res) => {
  try {
    const id = req.doctorId || req.PatientId
    await Notification.updateMany({ recipient_id: id, read: false }, { read: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /notifications/:id/read  — mark one as read
const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { createNotification, getNotifications, markAllRead, markOneRead }
