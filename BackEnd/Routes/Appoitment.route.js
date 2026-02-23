const express = require('express');

// 1. Import the new Get_Video_Token controller
const { 
  Show_Appoitment_Sechdule, 
  Book_Appointment, 
  My_Appointments, 
  Doctor_Appointments,
  Get_Video_Token  , Validate_And_Join_Meeting    // <--- ADD THIS
} = require('../Controlers/Appoitment.controller');

const Patient_Check = require('../MiddleWare/Patient.middleware');
const Doctor_Check = require('../MiddleWare/Doctor.middleware');

const Apppoitment_Routes = express.Router();

Apppoitment_Routes.get('/Show_Appoitment_Sechdule/:id', Show_Appoitment_Sechdule);
Apppoitment_Routes.post('/Book_Appointment/:id', Patient_Check, Book_Appointment);
Apppoitment_Routes.get('/My_Appointments', Patient_Check, My_Appointments);
Apppoitment_Routes.get('/Doctor_Appointments', Doctor_Check, Doctor_Appointments);

// 2. Add the new route here
// This allows the frontend (VideoCall.jsx) to ask for a secure key
Apppoitment_Routes.get('/get-video-token', Get_Video_Token); 
Apppoitment_Routes.get('/join-meeting/:roomId', Validate_And_Join_Meeting);

module.exports = Apppoitment_Routes;