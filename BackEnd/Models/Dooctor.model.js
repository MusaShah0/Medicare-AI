const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const DoctorSchema = mongoose.Schema({
    first_Name: {
        type: String,
        required: true
    },
    last_Name: {
        type: String,
        required: true
    },
    ph: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    // NEW FIELDS
   profile_Picture: { 
        type: String, 
        default: "default-doctor.png" 
    },
    degrees: [{
        type: String,
        required: true
    }],
    completed_appointments: {
        type: Number,
        default: 0
    },
    licenseNumber: {
        type: String   // required enforced in D_SignUp controller; omitted here so existing doctors can still save
    },
    degreeFile: {
        type: String,
        default: null
    },
    isApproved: {
        type: Boolean,
        default: true  // true = existing/approved; new registrations are explicitly set to null (pending)
    }
}, { timestamps: true });

// --- MIDDLEWARE ---

// Optimized: Only hashes password if it is new or being updated
DoctorSchema.pre('save', async function() {
    if (!this.isModified('password')) return ;
    
    this.password = await bcrypt.hash(this.password, 10);
    
});

// --- METHODS (Names kept exactly as your original) ---

DoctorSchema.methods.Generate_Token = async function () {
    return await jwt.sign(
        { id: this._id }, 
        process.env.SecretKey, 
        { expiresIn: process.env.ExpireIn }
    );
};

DoctorSchema.methods.Password_Check = function(pass) {
    // Note: We use 'this.password' which will be available here 
    // even if 'select: false' is used in the schema
    return bcrypt.compare(pass, this.password);
};

const DoctorModel = mongoose.model("Doctor", DoctorSchema);
module.exports = DoctorModel;