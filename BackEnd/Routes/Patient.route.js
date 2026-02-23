const express=require('express')
const { P_SignUp, P_LoginIn, logout } = require('../Controlers/Patient.controller')
const PatientRoutes=express.Router()

PatientRoutes.post('/P_SignUp',P_SignUp)
PatientRoutes.post('/P_Login',P_LoginIn)
PatientRoutes.get('/logout',logout)
module.exports=PatientRoutes