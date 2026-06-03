const D_Model = require('../Models/Dooctor.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// --- MULTER SETUP ---
const uploadDir = path.join(__dirname, '../public/pictures');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const degreeDir = path.join(__dirname, '../public/degrees');
if (!fs.existsSync(degreeDir)) fs.mkdirSync(degreeDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, file.fieldname === 'degreeFile' ? 'public/degrees' : 'public/pictures');
    },
    filename: function (req, file, cb) {
        if (!req.generatedId) req.generatedId = new mongoose.Types.ObjectId();
        const ext = path.extname(file.originalname);
        cb(null, `${req.generatedId}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB covers both fields
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profile_Picture') {
            const ok = /jpeg|jpg|png/.test(file.mimetype) && /\.(jpeg|jpg|png)$/i.test(file.originalname);
            return ok ? cb(null, true) : cb(new Error('Profile picture must be JPG or PNG.'));
        }
        if (file.fieldname === 'degreeFile') {
            const ok = /\.(jpeg|jpg|png|pdf)$/i.test(file.originalname) &&
                       (/image\/(jpeg|png)/.test(file.mimetype) || file.mimetype === 'application/pdf');
            return ok ? cb(null, true) : cb(new Error('Degree file must be PDF, JPG, or PNG.'));
        }
        cb(null, false);
    }
});

const VALID_SPECIALITIES = ['Cardiologist','Dermatologist','Neurologist','Pediatrician','General Surgeon','Psychiatrist','Orthopedic']

// --- CONTROLLERS ---

const D_SignUp = async (req, res) => {
    try {
        const { first_Name, last_Name, ph, email, password, speciality, degrees, licenseNumber } = req.body;

        // Input validation
        if (!first_Name || !last_Name || !email || !password || !speciality || !ph || !licenseNumber) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (first_Name.length > 50 || last_Name.length > 50) {
            return res.status(400).json({ message: "Name must be 50 characters or fewer." });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email address." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        if (!VALID_SPECIALITIES.includes(speciality)) {
            return res.status(400).json({ message: "Invalid speciality." });
        }
        const phRegex = /^[+\d\s\-()]{7,20}$/;
        if (!phRegex.test(ph)) {
            return res.status(400).json({ message: "Invalid phone number." });
        }

        const existingDoctor = await D_Model.findOne({ email });
        if (existingDoctor) {
            return res.status(409).json({ message: "Email already registered." });
        }

        let parsedDegrees = degrees;
        if (typeof degrees === 'string') {
            try {
                parsedDegrees = JSON.parse(degrees);
            } catch (e) {
                parsedDegrees = degrees.split(',').map(d => d.trim());
            }
        }

        const profilePic = req.files?.profile_Picture?.[0]?.filename || 'default-doctor.png';
        const degreeFile = req.files?.degreeFile?.[0]?.filename || null;

        const newDoctor = new D_Model({
            _id: req.generatedId || new mongoose.Types.ObjectId(),
            first_Name,
            last_Name,
            ph,
            email,
            password,
            speciality,
            degrees: parsedDegrees,
            licenseNumber,
            degreeFile,
            profile_Picture: profilePic,
            isApproved: null  // pending admin review
        });

        await newDoctor.save();

        // Do NOT issue token — doctor cannot log in until approved
        res.status(201).json({
            success: true,
            pending: true,
            message: "Your registration request has been forwarded to the administrator. You will be notified once your account is reviewed."
        });

    } catch (error) {
        if (req.files?.profile_Picture?.[0]) {
            const p = path.join('public/pictures', req.files.profile_Picture[0].filename);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        if (req.files?.degreeFile?.[0]) {
            const p = path.join('public/degrees', req.files.degreeFile[0].filename);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const D_LogIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await D_Model.findOne({ email });
    
    if (!user) return res.status(404).json({ status: 0, msg: "Invalid password or email" });

    const isMatch = await user.Password_Check(password);
    if (!isMatch) return res.status(401).json({ status: 0, msg: "Invalid email or password" });

    // Approval gate
    if (user.isApproved === null) {
        return res.status(403).json({
            status: 0,
            approval_status: 'pending',
            msg: 'Your registration is under review. Kindly wait for admin approval.'
        });
    }
    if (user.isApproved === false) {
        return res.status(403).json({
            status: 0,
            approval_status: 'rejected',
            msg: 'Your registration request has been denied by the administrator.'
        });
    }

    const token = await user.Generate_Token();
    
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });

    return res.status(200).json({
      status: 1,
      // 👇 UPDATED: Added these flags for Frontend Private Route
      login: true,
      role: 'doctor',
      msg: `Welcome ${user.first_Name}`,
      doctor: {
        id: user._id, 
        firstName: user.first_Name,
        lastName: user.last_Name,
        speciality: user.speciality,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({ status: 0, msg: "Server error", error: error.message });
  }
};

const View_Doctor = async (req, res) => {
    try {
        // Include legacy doctors (no isApproved field) + explicitly approved ones; exclude pending (null) and rejected (false)
        const doctors = await D_Model.find({ isApproved: { $nin: [false, null] } }).select("first_Name last_Name speciality degrees profile_Picture _id");
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching doctors", error: error.message });
    }
};

// 👇 KEEP THIS: You still need this specifically to fix the "Refresh" issue
const Verify_Doctor = async (req, res) => {
    return res.status(200).json({ 
        login: true, 
        role: 'doctor', 
        user: req.doctor 
    });
};
const logoutDoctor = (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure in production
            sameSite: 'strict'
        });

        return res.status(200).json({ 
            status: 1, 
            message: "Logged out successfully" 
        });
    } catch (error) {
        return res.status(500).json({ 
            status: 0, 
            message: "Logout failed", 
            error: error.message 
        });
    }
};

// ── Get own profile ────────────────────────────────────────────────────────
const Get_Profile = async (req, res) => {
    try {
        const doctor = await D_Model.findById(req.doctorId).select('-password');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
        res.json({ success: true, data: doctor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Update own profile (email cannot be changed) ───────────────────────────
const Update_Profile = async (req, res) => {
    try {
        const { first_Name, last_Name, ph, speciality, degrees, password } = req.body;

        if (first_Name && first_Name.length > 50)
            return res.status(400).json({ success: false, message: 'First name must be 50 characters or fewer.' });
        if (last_Name && last_Name.length > 50)
            return res.status(400).json({ success: false, message: 'Last name must be 50 characters or fewer.' });
        if (ph) {
            const phRegex = /^[+\d\s\-()]{7,20}$/;
            if (!phRegex.test(ph))
                return res.status(400).json({ success: false, message: 'Invalid phone number.' });
        }
        if (speciality && !VALID_SPECIALITIES.includes(speciality))
            return res.status(400).json({ success: false, message: 'Invalid speciality.' });
        if (password && password.length < 8)
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

        const doctor = await D_Model.findById(req.doctorId);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

        if (first_Name) doctor.first_Name = first_Name;
        if (last_Name)  doctor.last_Name  = last_Name;
        if (ph)         doctor.ph         = ph;
        if (speciality) doctor.speciality = speciality;

        if (degrees) {
            let parsed = degrees;
            if (typeof degrees === 'string') {
                try { parsed = JSON.parse(degrees); }
                catch { parsed = degrees.split(',').map(d => d.trim()).filter(Boolean); }
            }
            doctor.degrees = parsed;
        }

        if (password) doctor.password = password; // pre-save hook hashes it

        // New profile picture uploaded (licenseNumber and degreeFile are locked — ignored)
        const newPic = req.files?.profile_Picture?.[0]?.filename || req.file?.filename;
        if (newPic) {
            if (doctor.profile_Picture && doctor.profile_Picture !== 'default-doctor.png') {
                const old = path.join(__dirname, '../public/pictures', doctor.profile_Picture);
                if (fs.existsSync(old)) fs.unlinkSync(old);
            }
            doctor.profile_Picture = newPic;
        }

        await doctor.save();
        const updated = doctor.toObject();
        delete updated.password;
        res.json({ success: true, message: 'Profile updated successfully.', data: updated });
    } catch (err) {
        const newPic = req.files?.profile_Picture?.[0]?.filename || req.file?.filename;
        if (newPic) {
            const p = path.join('public/pictures', newPic);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { D_SignUp, D_LogIn, View_Doctor, Verify_Doctor, upload, logoutDoctor, Get_Profile, Update_Profile };