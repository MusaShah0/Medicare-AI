const express=require('express')
const { P_SignUp, P_LoginIn, logout, verifyPatient } = require('../Controlers/Patient.controller')
const Patient_Check = require('../MiddleWare/Patient.middleware')
const PatientRoutes=express.Router()

PatientRoutes.post('/P_SignUp',P_SignUp)
PatientRoutes.post('/P_Login',P_LoginIn)
PatientRoutes.get('/logout',logout)
PatientRoutes.get('/patient/verify', Patient_Check, verifyPatient)

module.exports=PatientRoutes