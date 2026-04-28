const express = require('express');

const { 
  Show_Appoitment_Sechdule, 
  Book_Appointment, 
  My_Appointments, 
  Doctor_Appointments,
  Get_Video_Token,
  Validate_And_Join_Meeting,
  Reschedule_Appointment,
  Redeem_Reschedule,
  End_Meeting_Early
} = require('../Controlers/Appoitment.controller');

const Patient_Check = require('../MiddleWare/Patient.middleware');
const Doctor_Check  = require('../MiddleWare/Doctor.middleware');
const AnyUser_Check = require('../MiddleWare/AnyUser.middleware');

const Apppoitment_Routes = express.Router();

Apppoitment_Routes.get('/Show_Appoitment_Sechdule/:id', Show_Appoitment_Sechdule);
Apppoitment_Routes.post('/Book_Appointment/:id', Patient_Check, Book_Appointment);
Apppoitment_Routes.get('/My_Appointments', Patient_Check, My_Appointments);
Apppoitment_Routes.get('/Doctor_Appointments', Doctor_Check, Doctor_Appointments);
Apppoitment_Routes.get('/get-video-token', Get_Video_Token);

// join-meeting now requires auth so we can identify who is joining
Apppoitment_Routes.get('/join-meeting/:roomId', AnyUser_Check, Validate_And_Join_Meeting);

// Doctor cancels a booked appointment and issues a free rebook token to the patient
Apppoitment_Routes.post('/Reschedule_Appointment/:appointmentId', Doctor_Check, Reschedule_Appointment);

// Patient redeems their free rebook token to book a new slot
Apppoitment_Routes.post('/Redeem_Reschedule/:appointmentId/:scheduleId', Patient_Check, Redeem_Reschedule);

// End meeting early (when participants leave before scheduled end time)
Apppoitment_Routes.post('/end-meeting/:appointmentId', AnyUser_Check, End_Meeting_Early);

module.exports = Apppoitment_Routes;