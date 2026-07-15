const express  = require('express');
const router   = express.Router();
const AdminMW  = require('../MiddleWare/Admin.middleware');
const {
  adminLogin, adminLogout, adminVerify,
  getStats,
  getDoctors,    removeDoctor,
  getPatients,   removePatient,
  getAppointments, removeAppointment,
  getSchedules,  removeSchedule,
  getMeetingNotes, removeMeetingNote,
  getReviews,    removeReview,
  getPendingDoctors, approveDoctor, rejectDoctor,
} = require('../Controlers/AdminControler');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/admin/login',  adminLogin);
router.post('/admin/logout', adminLogout);

// ── Protected (adminToken cookie required) ────────────────────────────────────
router.get('/admin/verify', AdminMW, adminVerify);
router.get('/admin/stats',  AdminMW, getStats);

// Doctors
router.get('/admin/doctors',        AdminMW, getDoctors);
router.delete('/admin/doctor/:id',  AdminMW, removeDoctor);

// Patients
router.get('/admin/patients',       AdminMW, getPatients);
router.delete('/admin/patient/:id', AdminMW, removePatient);

// Appointments
router.get('/admin/appointments',          AdminMW, getAppointments);
router.delete('/admin/appointment/:id',   AdminMW, removeAppointment);

// Schedules
router.get('/admin/schedules',        AdminMW, getSchedules);
router.delete('/admin/schedule/:id',  AdminMW, removeSchedule);

// Meeting Notes
router.get('/admin/meeting-notes',        AdminMW, getMeetingNotes);
router.delete('/admin/meeting-note/:id',  AdminMW, removeMeetingNote);

// Reviews
router.get('/admin/reviews',       AdminMW, getReviews);
router.delete('/admin/review/:id', AdminMW, removeReview);

// Doctor approval
router.get('/admin/pending-doctors',          AdminMW, getPendingDoctors);
router.patch('/admin/doctor/:id/approve',     AdminMW, approveDoctor);
router.patch('/admin/doctor/:id/reject',      AdminMW, rejectDoctor);

module.exports = router;
