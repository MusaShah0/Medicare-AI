import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState({ name: "Patient", id: "" });
  const [loading, setLoading] = useState(true);

  // --- 1. LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/logout`, { withCredentials: true });
      localStorage.removeItem('patientData');
      navigate('/patient/login');
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem('patientData');
      navigate('/patient/login');
    }
  };

  // --- 2. FETCH DATA LOGIC ---
  useEffect(() => {
    // Only fetching user name from local storage now
    const storedData = localStorage.getItem('patientData');
    if (storedData) {
      setPatient(JSON.parse(storedData));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">M</div>
          <span className="text-xl font-bold text-slate-800">MediCare</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/patient/dashboard" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </Link>
          <Link to="/my-appointments" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            My Appointments
          </Link>
          <Link to="/doctors" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Find Doctor
          </Link>
          <Link to="/ai-chat" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Symptom Chat
          </Link>
        </nav>

        {/* --- LOGOUT BUTTON --- */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium w-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {patient.first_Name || patient.name} 👋</h1>
            <p className="text-slate-500 mt-1">Here is your health overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/doctors" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-slate-900/20">
               Book Appointment
             </Link>
             <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold border-2 border-white shadow-sm">
                {patient.first_Name ? patient.first_Name.charAt(0) : "P"}
             </div>
          </div>
        </header>

        {/* --- STATS GRID REMOVED HERE --- */}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8">
           {/* Card 1 */}
           <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/20 group cursor-pointer" onClick={() => navigate('/ai-chat')}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition"></div>
              <div className="relative z-10">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block backdrop-blur-sm">New Feature</span>
                <h2 className="text-3xl font-bold mb-2">AI Symptom Checker</h2>
                <p className="text-teal-100 mb-8 max-w-sm">Not feeling well? Chat with our advanced AI to understand your symptoms before seeing a doctor.</p>
                <button className="bg-white text-teal-800 px-6 py-3 rounded-xl font-bold hover:bg-teal-50 transition flex items-center gap-2">
                  Start Chat
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
              </div>
           </div>

           {/* Card 2 */}
           <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer" onClick={() => navigate('/doctors')}>
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">👨‍⚕️</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Find a Specialist</h2>
              <p className="text-slate-500 mb-8">Browse top-rated doctors, read reviews, and book appointments instantly.</p>
              <span className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Search Doctors
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </span>
           </div>
        </div>

      </main>
    </div>
  );
};

export default PatientDashboard;