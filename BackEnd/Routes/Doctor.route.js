const express=require('express')
const { D_SignUp, D_LogIn , View_Doctor , upload, logoutDoctor, Verify_Doctor} = require('../Controlers/Doctor.controller')
const Doctor_Check = require('../MiddleWare/Doctor.middleware')
const D_Router=express.Router()

D_Router.post('/D_SignUP',upload.single('profile_Picture'), D_SignUp)
D_Router.post('/D_Login',D_LogIn)
D_Router.get('/View_Doctor',View_Doctor)
D_Router.get('/Doctor_Logout', logoutDoctor)
D_Router.get('/doctor/verify', Doctor_Check, Verify_Doctor)

module.exports=D_Router