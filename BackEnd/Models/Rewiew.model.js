const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appoitment',
        required: true,
        unique: true   // one review per completed appointment
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

const ReviewModel = mongoose.model('Review', ReviewSchema);
module.exports = ReviewModel;
