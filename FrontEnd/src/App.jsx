import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- DOCTOR PAGE IMPORTS ---
import Home from './pages/Home';
import DoctorLogin from './pages/DoctorLogin';
import DoctorSignup from './pages/DoctorSignup';
import DoctorDashboard from './pages/DoctorDashboard';
import ScheduleGenerator from './pages/ScheduleGenerator';
import DoctorAppointments from './pages/DoctorAppointments';
import MySchedule from './pages/MySchedule';
import VideoCall from './pages/VideoCall'; 

// --- PATIENT PAGE IMPORTS ---
import PatientSignup from './pages/PatientSignup';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard'; 
import FindDoctors from './pages/FindDoctors'; 
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import AIChat from './pages/AIChat'; // <--- NEW IMPORT

// --- 🔒 DOCTOR PROTECTED ROUTE ---
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('doctorName');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// --- 🔒 PATIENT PROTECTED ROUTE ---
const PatientRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('patientData');
  return isAuthenticated ? children : <Navigate to="/patient/login" />;
};

function App() {
  const [role, setRole] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- 🏠 PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        
        {/* Doctor Auth */}
        <Route path="/login" element={<DoctorLogin setRole={setRole} />} />
        <Route path="/doctor/signup" element={<DoctorSignup setRole={setRole} />} />

        {/* Patient Auth */}
        <Route path="/patient/signup" element={<PatientSignup />} />
        <Route path="/patient/login" element={<PatientLogin />} />

        {/* --- 👨‍⚕️ DOCTOR PRIVATE ROUTES --- */}
        <Route path="/doctor-dashboard" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/schedule/create" element={<PrivateRoute><ScheduleGenerator /></PrivateRoute>} />
        <Route path="/doctor/schedule" element={<PrivateRoute><MySchedule /></PrivateRoute>} />
        <Route path="/doctor/appointments" element={<PrivateRoute><DoctorAppointments /></PrivateRoute>} />

        {/* --- 🤒 PATIENT PRIVATE ROUTES --- */}
        
        {/* Dashboard */}
        <Route path="/patient/dashboard" element={<PatientRoute><PatientDashboard /></PatientRoute>} />

        {/* Find Doctors */}
        <Route path="/doctors" element={<PatientRoute><FindDoctors /></PatientRoute>} />

        {/* Book Appointment */}
        <Route path="/book-appointment/:id" element={<PatientRoute><BookAppointment /></PatientRoute>} />

        {/* My Appointments */}
        <Route path="/my-appointments" element={<PatientRoute><MyAppointments /></PatientRoute>} />

        {/* AI Chat (Now using real component) */}
        <Route path="/ai-chat" element={<PatientRoute><AIChat /></PatientRoute>} />

        {/* --- 🎥 VIDEO CALL --- */}
        <Route path="/room/:roomId" element={<VideoCall />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;