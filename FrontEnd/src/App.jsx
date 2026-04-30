import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// --- DOCTOR PAGES ---
import Home from './pages/Home';
import DoctorLogin from './pages/DoctorLogin';
import DoctorSignup from './pages/DoctorSignup';
import DoctorDashboard from './pages/DoctorDashboard';
import ScheduleGenerator from './pages/ScheduleGenerator';
import DoctorAppointments from './pages/DoctorAppointments';
import MySchedule from './pages/MySchedule';
import VideoCall from './pages/VideoCall';
import DoctorEditProfile from './pages/DoctorEditProfile';

// --- ADMIN PAGES ---
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// --- PATIENT PAGES ---
import PatientSignup from './pages/PatientSignup';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import FindDoctors from './pages/FindDoctors';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import AIChat from './pages/AIChat';
import PatientEditProfile from './pages/PatientEditProfile';

// ─── Spinner shown while cookie is being verified ────────────────────────────
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
  </div>
);

// ─── Doctor private route ─────────────────────────────────────────────────────
// Verifies the JWT cookie; redirects to /login if invalid/expired
const DoctorRoute = ({ children }) => {
  const status = useAuth('doctor');
  if (status === 'loading') return <AuthLoader />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return children;
};

// ─── Patient private route ────────────────────────────────────────────────────
// Verifies the JWT cookie; redirects to /patient/login if invalid/expired
const PatientRoute = ({ children }) => {
  const status = useAuth('patient');
  if (status === 'loading') return <AuthLoader />;
  if (status === 'unauthenticated') return <Navigate to="/patient/login" replace />;
  return children;
};

// ─── Any-role private route (doctor OR patient) ──────────────────────────────
// Used for the video call room — either role can join
const AnyRoute = ({ children }) => {
  const status = useAuth('any');
  if (status === 'loading') return <AuthLoader />;
  if (status === 'unauthenticated') return <Navigate to="/" replace />;
  return children;
};
// Redirects already-authenticated users away from login/signup pages
const GuestRoute = ({ children, role }) => {
  const status = useAuth(role);
  if (status === 'loading') return <AuthLoader />;
  if (status === 'authenticated') {
    return <Navigate to={role === 'doctor' ? '/doctor-dashboard' : '/patient/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<Home />} />

        {/* ── Doctor Auth (guest-only) ── */}
        <Route path="/login" element={
          <GuestRoute role="doctor"><DoctorLogin /></GuestRoute>
        } />
        <Route path="/doctor/signup" element={
          <GuestRoute role="doctor"><DoctorSignup /></GuestRoute>
        } />

        {/* ── Patient Auth (guest-only) ── */}
        <Route path="/patient/signup" element={
          <GuestRoute role="patient"><PatientSignup /></GuestRoute>
        } />
        <Route path="/patient/login" element={
          <GuestRoute role="patient"><PatientLogin /></GuestRoute>
        } />

        {/* ── Doctor Private ── */}
        <Route path="/doctor-dashboard"        element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
        <Route path="/doctor/schedule/create"  element={<DoctorRoute><ScheduleGenerator /></DoctorRoute>} />
        <Route path="/doctor/schedule"         element={<DoctorRoute><MySchedule /></DoctorRoute>} />
        <Route path="/doctor/appointments"     element={<DoctorRoute><DoctorAppointments /></DoctorRoute>} />
        <Route path="/doctor/edit-profile"    element={<DoctorRoute><DoctorEditProfile /></DoctorRoute>} />

        {/* ── Patient Private ── */}
        <Route path="/patient/dashboard"       element={<PatientRoute><PatientDashboard /></PatientRoute>} />
        <Route path="/doctors"                 element={<PatientRoute><FindDoctors /></PatientRoute>} />
        <Route path="/book-appointment/:id"    element={<PatientRoute><BookAppointment /></PatientRoute>} />
        <Route path="/my-appointments"         element={<PatientRoute><MyAppointments /></PatientRoute>} />
        <Route path="/ai-chat"                 element={<PatientRoute><AIChat /></PatientRoute>} />
        <Route path="/patient/edit-profile"    element={<PatientRoute><PatientEditProfile /></PatientRoute>} />

        {/* ── Video call — requires any authenticated user ── */}
        <Route path="/room/:roomId" element={<AnyRoute><VideoCall /></AnyRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
