const D_Model = require('../Models/Dooctor.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// --- MULTER SETUP (No changes here) ---
const uploadDir = path.join(__dirname, '../public/pictures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/pictures'); 
    },
    filename: function (req, file, cb) {
        if (!req.generatedId) {
            req.generatedId = new mongoose.Types.ObjectId();
        }
        const ext = path.extname(file.originalname);
        cb(null, `${req.generatedId}-${Date.now()}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Only .png, .jpg and .jpeg formats are allowed!"));
    }
});

// --- CONTROLLERS ---

const D_SignUp = async (req, res) => {
    try {
        const { first_Name, last_Name, ph, email, password, speciality, degrees } = req.body;

        const existingDoctor = await D_Model.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "Email already registered." });
        }

        let parsedDegrees = degrees;
        if (typeof degrees === 'string') {
            try {
                parsedDegrees = JSON.parse(degrees);
            } catch (e) {
                parsedDegrees = degrees.split(',').map(d => d.trim());
            }
        }

        const newDoctor = new D_Model({
            _id: req.generatedId || new mongoose.Types.ObjectId(),
            first_Name,
            last_Name,
            ph,
            email,
            password,
            speciality,
            degrees: parsedDegrees,
            profile_Picture: req.file ? req.file.filename : "default-doctor.png"
        });

        await newDoctor.save();
        const token = await newDoctor.Generate_Token();
        
        // Cookie for persistence
        res.cookie('token', token, { httpOnly: true });

        res.status(201).json({
            success: true,
            // 👇 UPDATED: Added these flags for Frontend Private Route
            login: true,
            role: 'doctor', 
            message: "Doctor registered successfully",
            token,
            doctor: {
                id: newDoctor._id,
                first_Name: newDoctor.first_Name,
                profile_Picture: newDoctor.profile_Picture
            }
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(path.join('public/pictures', req.file.filename));
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
    if(!isMatch) return res.status(401).json({ status: 0, msg: "Invalid email or password" });

    const token = await user.Generate_Token();
    
    res.cookie('token', token, { httpOnly: true });

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
        const doctors = await D_Model.find().select("first_Name last_Name speciality degrees profile_Picture _id");
        if (!doctors || doctors.length === 0) return res.status(404).json({ success: false, message: "No doctors found." });
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

module.exports = { D_SignUp, D_LogIn, View_Doctor, Verify_Doctor, upload, logoutDoctor };