const express=require('express')
const { D_SignUp, D_LogIn , View_Doctor , upload, logoutDoctor} = require('../Controlers/Doctor.controller')
const D_Router=express.Router()

D_Router.post('/D_SignUP',upload.single('profile_Picture'), D_SignUp)
D_Router.post('/D_Login',D_LogIn)
D_Router.get('/View_Doctor',View_Doctor)
D_Router.get('/Doctor_Logout', logoutDoctor)

module.exports=D_Router