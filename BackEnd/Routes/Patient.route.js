const express=require('express')
const { rateLimit } = require('express-rate-limit')
const { P_SignUp, P_LoginIn, logout, verifyPatient } = require('../Controlers/Patient.controller')
const Patient_Check = require('../MiddleWare/Patient.middleware')
const PatientRoutes=express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 0, msg: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

PatientRoutes.post('/P_SignUp', authLimiter, P_SignUp)
PatientRoutes.post('/P_Login', authLimiter, P_LoginIn)
PatientRoutes.get('/logout',logout)
PatientRoutes.get('/patient/verify', Patient_Check, verifyPatient)

module.exports=PatientRoutes