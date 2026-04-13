const express = require('express')
const Patient_Check = require('../MiddleWare/Patient.middleware')
const { Submit_Review, Check_Review, Get_Doctor_Reviews } = require('../Controlers/Rewiew.controller')

const ReviewRoutes = express.Router()

ReviewRoutes.post('/review', Patient_Check, Submit_Review)
ReviewRoutes.get('/review/check/:appointmentId', Patient_Check, Check_Review)
ReviewRoutes.get('/review/doctor/:doctorId', Get_Doctor_Reviews)

module.exports = ReviewRoutes
