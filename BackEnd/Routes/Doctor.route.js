const express=require('express')
const { rateLimit } = require('express-rate-limit')
const { D_SignUp, D_LogIn , View_Doctor , upload, logoutDoctor, Verify_Doctor, Get_Profile, Update_Profile } = require('../Controlers/Doctor.controller')
const Doctor_Check = require('../MiddleWare/Doctor.middleware')
const D_Router=express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 0, msg: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

D_Router.post('/D_SignUP', authLimiter, upload.fields([
  { name: 'profile_Picture', maxCount: 1 },
  { name: 'degreeFile',      maxCount: 1 },
]), D_SignUp)
D_Router.post('/D_Login', authLimiter, D_LogIn)
D_Router.get('/View_Doctor',View_Doctor)
D_Router.get('/Doctor_Logout', logoutDoctor)
D_Router.get('/doctor/verify',         Doctor_Check, Verify_Doctor)
D_Router.get('/doctor/profile',        Doctor_Check, Get_Profile)
D_Router.put('/doctor/profile/update', Doctor_Check, upload.fields([{ name: 'profile_Picture', maxCount: 1 }]), Update_Profile)

module.exports=D_Router