const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  patient_Id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true,
    index: true // Helps you fetch history faster later
  },
  messages: [
    {
      sender: { type: String, enum: ['patient', 'ai'], required: true },
      text: { type: String, required: true },
      sources: [String],
      timestamp: { type: Date, default: Date.now }
    }
  ],
  // MongoDB automatically adds createdAt and updatedAt
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);