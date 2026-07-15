const express = require('express')
const { upsertPrescription, getPrescription, getPatientHistory } = require('../Controlers/Prescription.controller')
const Doctor_Check  = require('../MiddleWare/Doctor.middleware')
const AnyUser_Check = require('../MiddleWare/AnyUser.middleware')

const router = express.Router()

router.post('/prescription/:appointmentId',  Doctor_Check,  upsertPrescription)
router.get('/prescription/:appointmentId',   AnyUser_Check, getPrescription)
router.get('/doctor/patient-history/:patientId', Doctor_Check, getPatientHistory)

module.exports = router
