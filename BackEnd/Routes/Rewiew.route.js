const express = require('express')
const Patient_Check = require('../MiddleWare/Patient.middleware')
const { Submit_Review, Check_Review, Get_Doctor_Reviews, Get_Doctor_Profile } = require('../Controlers/Rewiew.controller')

const ReviewRoutes = express.Router()

ReviewRoutes.post('/review', Patient_Check, Submit_Review)
ReviewRoutes.get('/review/check/:appointmentId', Patient_Check, Check_Review)
ReviewRoutes.get('/review/doctor/:doctorId', Get_Doctor_Reviews)
ReviewRoutes.get('/doctor/profile/:doctorId', Get_Doctor_Profile)

module.exports = ReviewRoutes
