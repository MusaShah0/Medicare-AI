const express = require('express')
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')
const AnyUser_Check = require('../MiddleWare/AnyUser.middleware')
const { getNoteStatus, downloadPDF, uploadAudio } = require('../Controlers/Notes.controller')

// Save uploaded audio to uploads/audio/ with original extension preserved
const audioDir = path.resolve(__dirname, '../uploads/audio')
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm'
    cb(null, `${req.params.appointmentId}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    // Accept any audio or video mimetype
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  }
})

const Notes_Routes = express.Router()

// Patient checks if notes are ready
Notes_Routes.get('/appointments/:appointmentId/notes', AnyUser_Check, getNoteStatus)

// Patient downloads the PDF
Notes_Routes.get('/notes/:noteId/download', AnyUser_Check, downloadPDF)

// Patient uploads browser-recorded audio after meeting ends
Notes_Routes.post('/appointments/:appointmentId/upload-audio', AnyUser_Check, upload.single('audio'), uploadAudio)

module.exports = Notes_Routes
