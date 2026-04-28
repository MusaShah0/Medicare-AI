import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // 1. Get Doctor Name
    const name = localStorage.getItem('doctorName');
    if (name) setDoctorName(name);

    // 2. Set Current Date
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/Doctor_Logout`, { withCredentials: true });
      localStorage.removeItem('doctorName');
      localStorage.removeItem('doctorId');
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Area - UPDATED NAME */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-teal-200 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Medicare.AI</h1>
              <span className="text-xs text-slate-400 font-medium tracking-wide">DOCTOR PORTAL</span>
            </div>
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-700">Dr. {doctorName}</span>
              <span className="text-xs text-slate-400">General Practitioner</span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full font-bold text-sm transition-all border border-slate-200 hover:border-red-100 shadow-sm"
            >
              <span>Logout</span>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* --- WELCOME HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Good Morning, Dr. {doctorName} 👋</h2>
            <p className="text-slate-500 mt-2">Manage your practice and appointments efficiently.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-700">{currentDate}</p>
            <p className="text-xs text-slate-400">System Status: Online</p>
          </div>
        </header>

        {/* --- MAIN ACTIONS GRID --- */}
        {/* Removed stats section, now showing actions directly */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* 1. Appointments Card */}
            <Link to="/doctor/appointments" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
               
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800 mb-3">Appointments</h3>
                 <p className="text-slate-500 text-sm mb-8 leading-relaxed">View your upcoming booked sessions, patient details, and join video consultations directly.</p>
                 <span className="text-blue-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    View Calendar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                 </span>
               </div>
            </Link>

            {/* 2. Create Schedule Card */}
            <Link to="/doctor/schedule/create" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
               
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800 mb-3">Create Schedule</h3>
                 <p className="text-slate-500 text-sm mb-8 leading-relaxed">Set your weekly availability. Add new time slots so patients can book appointments with you.</p>
                 <span className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    Add Slots <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                 </span>
               </div>
            </Link>

            {/* 3. My Schedule Card */}
            <Link to="/doctor/schedule" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
               
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800 mb-3">My Schedule</h3>
                 <p className="text-slate-500 text-sm mb-8 leading-relaxed">Review your existing schedule, check booked slots, and manage your working hours.</p>
                 <span className="text-purple-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    Manage Slots <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                 </span>
               </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;