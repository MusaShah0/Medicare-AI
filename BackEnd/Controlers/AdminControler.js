const jwt       = require('jsonwebtoken');
const Doctor    = require('../Models/Dooctor.model');
const Patient   = require('../Models/Patient.model');
const Appointment = require('../Models/Appoitment.model');
const Schedule  = require('../Models/sechdule.model');
const MeetingNote = require('../Models/MeetingNote.model');
const Chat      = require('../Models/Chat.model');
const Review    = require('../Models/Rewiew.model');
const fs        = require('fs');
const path      = require('path');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@medicare.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345678';
const ADMIN_SECRET   = process.env.ADMIN_JWT_SECRET || 'admin_secret_key';

// ── Login ─────────────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ role: 'admin', email }, ADMIN_SECRET, { expiresIn: '8h' });

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure  : process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge  : 8 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: 'Admin authenticated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const adminLogout = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out.' });
};

// ── Verify session (frontend auth check) ──────────────────────────────────────
const adminVerify = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// ── Platform Stats ────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalSchedules,
      totalNotes,
      statusBreakdown,
      recentAppointments,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Schedule.countDocuments(),
      MeetingNote.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.find()
        .populate('doctor_id',  'first_Name last_Name speciality')
        .populate('patient_id', 'first_Name last_Name')
        .populate('sechdule_Id','date startTime endTime')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const statMap = {};
    statusBreakdown.forEach(s => { statMap[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalSchedules,
        totalNotes,
        booked   : statMap.booked    || 0,
        ongoing  : statMap.ongoing   || 0,
        completed: statMap.completed || 0,
        cancelled: statMap.cancelled || 0,
        recentAppointments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Doctors ───────────────────────────────────────────────────────────────────
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach appointment count per doctor
    const withCounts = await Promise.all(
      doctors.map(async (doc) => {
        const count = await Appointment.countDocuments({ doctor_id: doc._id });
        return { ...doc.toObject(), appointment_count: count };
      })
    );

    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    // Cascade delete all linked data
    await Promise.all([
      Doctor.findByIdAndDelete(id),
      Schedule.deleteMany({ doctor_id: id }),
      Appointment.deleteMany({ doctor_id: id }),
      Chat.deleteMany({ doctor_id: id }),
      Review.deleteMany({ doctor_id: id }),
    ]);

    // Remove profile picture from disk if custom
    if (doctor.profile_Picture && doctor.profile_Picture !== 'default-doctor.png') {
      const picPath = path.join(__dirname, '../public/pictures', doctor.profile_Picture);
      if (fs.existsSync(picPath)) fs.unlinkSync(picPath);
    }

    res.json({ success: true, message: `Dr. ${doctor.first_Name} ${doctor.last_Name} and all associated data removed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Patients ──────────────────────────────────────────────────────────────────
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const withCounts = await Promise.all(
      patients.map(async (pat) => {
        const count = await Appointment.countDocuments({ patient_id: pat._id });
        return { ...pat.toObject(), appointment_count: count };
      })
    );

    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    // Free any booked schedule slots belonging to this patient
    const appts = await Appointment.find({ patient_id: id, status: { $in: ['booked', 'ongoing'] } });
    await Promise.all(
      appts.map(a => Schedule.findByIdAndUpdate(a.sechdule_Id, { status: 'available' }))
    );

    await Promise.all([
      Patient.findByIdAndDelete(id),
      Appointment.deleteMany({ patient_id: id }),
      Chat.deleteMany({ patient_id: id }),
      Review.deleteMany({ patient_id: id }),
    ]);

    res.json({ success: true, message: `${patient.first_Name} ${patient.last_Name} and all associated data removed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Appointments ──────────────────────────────────────────────────────────────
const getAppointments = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('doctor_id',  'first_Name last_Name speciality profile_Picture')
      .populate('patient_id', 'first_Name last_Name email ph')
      .populate('sechdule_Id','date startTime endTime clinic_fee slotDuration')
      .sort({ createdAt: -1 });

    // Optional text search across doctor/patient name
    let results = appointments;
    if (search) {
      const q = search.toLowerCase();
      results = appointments.filter(a =>
        a.doctor_id?.first_Name?.toLowerCase().includes(q)  ||
        a.doctor_id?.last_Name?.toLowerCase().includes(q)   ||
        a.patient_id?.first_Name?.toLowerCase().includes(q) ||
        a.patient_id?.last_Name?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // Free the schedule slot back to available
    if (appt.sechdule_Id && appt.status !== 'completed') {
      await Schedule.findByIdAndUpdate(appt.sechdule_Id, { status: 'available' });
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Appointment removed and slot freed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Schedules ─────────────────────────────────────────────────────────────────
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('doctor', 'first_Name last_Name speciality')
      .sort({ date: -1, startTime: 1 });
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Schedule.findById(id);
    if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found.' });

    // Cancel any appointments linked to this slot
    await Appointment.updateMany(
      { sechdule_Id: id, status: { $in: ['booked', 'ongoing'] } },
      { status: 'cancelled' }
    );

    await Schedule.findByIdAndDelete(id);
    res.json({ success: true, message: 'Schedule slot removed and linked appointments cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Meeting Notes ─────────────────────────────────────────────────────────────
const getMeetingNotes = async (req, res) => {
  try {
    const notes = await MeetingNote.find()
      .populate({
        path  : 'appointment_id',
        populate: [
          { path: 'doctor_id',  select: 'first_Name last_Name speciality' },
          { path: 'patient_id', select: 'first_Name last_Name' },
          { path: 'sechdule_Id', select: 'date startTime' },
        ],
      })
      .sort({ created_at: -1 });
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeMeetingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await MeetingNote.findById(id);
    if (!note) return res.status(404).json({ success: false, message: 'Meeting note not found.' });

    // Remove the PDF file from disk if it exists
    if (note.pdf_path && fs.existsSync(note.pdf_path)) {
      fs.unlinkSync(note.pdf_path);
    }

    await MeetingNote.findByIdAndDelete(id);
    res.json({ success: true, message: 'Meeting note and PDF removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Reviews ───────────────────────────────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('doctor_id',      'first_Name last_Name speciality')
      .populate('patient_id',     'first_Name last_Name')
      .populate('appointment_id', 'status meeting_id')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Doctor Approval ───────────────────────────────────────────────────────────
const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: null })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: `Dr. ${doctor.first_Name} ${doctor.last_Name} approved.`, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: `Dr. ${doctor.first_Name} ${doctor.last_Name} rejected.`, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  adminLogin, adminLogout, adminVerify,
  getStats,
  getDoctors,    removeDoctor,
  getPatients,   removePatient,
  getAppointments, removeAppointment,
  getSchedules,  removeSchedule,
  getMeetingNotes, removeMeetingNote,
  getReviews,    removeReview,
  getPendingDoctors, approveDoctor, rejectDoctor,
};
