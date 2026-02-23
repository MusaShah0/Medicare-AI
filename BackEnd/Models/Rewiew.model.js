const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId, // Fixed: Removed trailing dot
        ref: "Doctor"
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId, // Fixed: Added missing type
        ref: "Patient"
    },
    review: {
        type: String
    }
}, { timestamps: true }); // Added timestamps to show when the review was written



const ReviewModel = mongoose.model("Review", ReviewSchema);
module.exports = ReviewModel;