const Sechdule_Model = require("../Models/sechdule.model")
// patinet view doctor pa doctors view krta phr jis doctor pa click kra ga us ki id params ma pass ho 
// jya gi or us doctor ka sechdule show ho jya ga // or phr patient us sechdule pa click kra 
// ga or us sechdule ki id params ma pass ho gi or appoitment model ma chli jya gi 
const moment = require('moment');
const axios = require("axios");
const { generateToken } = require("../utils/videoSDK");
const Appoitment_Model=require('../Models/Appoitment.model')
const crypto = require('crypto');
const Show_Appoitment_Sechdule = async (req, res) => {
  try {
    const id = req.params.id;
    

    const sechdule = await Sechdule_Model.find({ doctor: id, status: 'available' });


    if (!sechdule || sechdule.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "No sechdule found"
      });
    }
    console.log(sechdule)
    return res.status(200).json({
      status: 1,
      data: sechdule
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};

const Book_Appointment = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const patient_id = req.PatientId; 

    const schedule = await Sechdule_Model.findById(scheduleId);
    if (!schedule || schedule.status !== "available") {
      return res.status(400).json({ status: 0, msg: "Schedule not available" });
    }

    // --- 1. GENERATE VIDEOSDK ROOM ID ---
    const token = generateToken();
    
    // Call VideoSDK API to create a room
    const roomResponse = await axios.post("https://api.videosdk.live/v2/rooms", {}, {
        headers: { Authorization: token }
    });
    
    // This gives us a valid ID like "abc-defg-hij"
    const validMeetingId = roomResponse.data.roomId; 

    // --- 2. SAVE APPOINTMENT ---
    const appointment = new Appoitment_Model({
      patient_id: patient_id,
      doctor_id: schedule.doctor,
      sechdule_Id: scheduleId,
      status: "booked",
      meeting_id: validMeetingId // <--- Save the REAL ID
    });

    await appointment.save();

    schedule.status = "booked";
    await schedule.save();

    return res.status(201).json({ status: 1, msg: "Booked", data: appointment });

  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ status: 0, msg: "Server error", error: error.message });
  }
};

const My_Appointments = async (req, res) => {
  try {
    const patient_id = req.PatientId; 

    const appointments = await Appoitment_Model
      .find({ patient_id, status: "booked" })
      .populate("doctor_id", "first_Name speciality")
      .populate("sechdule_Id");

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "No booked appointments found"
      });
    }

    return res.status(200).json({
      status: 1,
      data: appointments
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};

const Doctor_Appointments = async (req, res) => {
  try {
    const doctor_id = req.doctorId; 

    const appointments = await Appoitment_Model
      .find({ doctor_id, status: { $in: ["booked", "ongoing"] } })
      .populate("patient_id", "first_Name last_Name")
      .populate("sechdule_Id")
      .sort({ createdAt: -1 });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "No appointments found"
      });
    }

    return res.status(200).json({
      status: 1,
      data: appointments
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};


const Get_Video_Token = (req, res) => {
  try {
    const token = generateToken();
    res.status(200).json({ status: 1, token: token });
  } catch (error) {
    res.status(500).json({ status: 0, msg: "Error generating token" });
  }
};
  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
};

const Validate_And_Join_Meeting = async (req, res) => {
  try {
    const { roomId } = req.params;

    // 1. Find Appointment by Meeting ID
    const appointment = await Appoitment_Model.findOne({ meeting_id: roomId }).populate('sechdule_Id');

    if (!appointment) {
      return res.status(404).json({ status: 0, msg: "Invalid Meeting ID" });
    }

    const schedule = appointment.sechdule_Id;
    
    // 2. Check Day (e.g., "Monday")
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    if (schedule.day !== today) {
      return res.status(403).json({ 
        status: 0, 
        msg: `This meeting is scheduled for ${schedule.day}, but today is ${today}.` 
      });
    }

    // 3. Check Time Window
    // Assuming startTime is like "14:30" or "02:30 PM"
    // And slotDuration is in minutes (e.g., 30)
    
    const startTimeDate = parseTime(schedule.startTime); 
    const currentTime = new Date();
    
    // Calculate End Time
    const endTimeDate = new Date(startTimeDate.getTime() + schedule.slotDuration * 60000);

    // Buffer: Allow joining 5 minutes early
    const earlyBuffer = new Date(startTimeDate.getTime() - 5 * 60000);

    if (currentTime < earlyBuffer) {
      return res.status(403).json({ 
        status: 0, 
        msg: `Meeting has not started yet. Starts at ${schedule.startTime}` 
      });
    }

    if (currentTime > endTimeDate) {
      return res.status(403).json({ 
        status: 0, 
        msg: "Meeting has ended/expired." 
      });
    }

    // 4. Calculate Remaining Time (in seconds)
    // This tells frontend when to auto-close the window
    const remainingTime = (endTimeDate.getTime() - currentTime.getTime()) / 1000;

    // 5. Generate Token Only if Valid
    const token = generateToken();

    res.status(200).json({ 
      status: 1, 
      token: token,
      validUntil: endTimeDate,
      remainingTime: Math.floor(remainingTime) 
    });

  } catch (error) {
    console.error("Join Error:", error);
    res.status(500).json({ status: 0, msg: "Server validation error" });
  }
};



module.exports={Show_Appoitment_Sechdule, Book_Appointment, My_Appointments, Doctor_Appointments, Get_Video_Token, Validate_And_Join_Meeting }
