import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [stats, setStats] = useState(null);
  const pollRef = useRef(null);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/doctor/dashboard-stats`, { withCredentials: true });
      if (data.success) setStats(data.data);
    } catch {
      // silently ignore — values stay as last known
    }
  };

  useEffect(() => {
    const name = localStorage.getItem('doctorName');
    if (name) setDoctorName(name);

    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    fetchStats();
    pollRef.current = setInterval(fetchStats, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:4000/Doctor_Logout', { withCredentials: true });
      localStorage.removeItem('doctorName');
      localStorage.removeItem('doctorId');
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans flex">

      {/* ── SIDEBAR ── */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#0A2540] flex flex-col z-30">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="w-9 h-9 bg-[#00B4A0] rounded-xl flex items-center justify-center text-white font-extrabold text-lg mr-3 shadow-lg">
            M
          </div>
          <div>
            <span className="text-white font-extrabold text-lg leading-none">MediCare</span>
            <p className="text-[#00B4A0] text-[10px] font-bold uppercase tracking-widest mt-0.5">Doctor Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {/* Dashboard — active */}
          <Link
            to="/doctor/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/15 text-white font-semibold border-l-4 border-[#00B4A0] transition-all duration-200"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/doctor/appointments"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Appointments
          </Link>

          <Link
            to="/doctor/schedule"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Schedule
          </Link>

          <Link
            to="/doctor/schedule/create"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Schedule
          </Link>

          <Link
            to="/doctor/edit-profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* Hero Strip */}
        <div className="relative bg-[#0A2540] overflow-hidden px-10 py-10">
          {/* Glow blobs */}
          <div className="absolute top-[-40px] right-[-60px] w-72 h-72 bg-[#00B4A0]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-60px] left-[30%] w-64 h-64 bg-[#00B4A0]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-2">Doctor Dashboard</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Dr. {doctorName}
              </h1>
              <p className="text-white/50 mt-2 text-sm">Manage your practice and appointments efficiently.</p>
            </div>
            <div className="text-right hidden md:flex flex-col items-end gap-1">
              <p className="text-white/80 text-sm font-semibold">{currentDate}</p>
              <span className="inline-flex items-center gap-1.5 text-[#00B4A0] text-xs font-bold">
                <span className="w-2 h-2 bg-[#00B4A0] rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 p-8 space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {[
              {
                label: 'Total Appointments',
                value: stats?.total,
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              },
              {
                label: 'Upcoming',
                value: stats?.upcoming,
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              },
              {
                label: 'Completed',
                value: stats?.completed,
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              },
              {
                label: 'Available Slots',
                value: stats?.availableSlots,
                icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
                <div>
                  {stat.value == null ? (
                    <div className="w-8 h-6 bg-slate-100 rounded animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-extrabold text-[#0A2540]">{stat.value}</p>
                  )}
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-5">Quick Actions</p>
            <div className="grid md:grid-cols-3 gap-5">

              {/* Appointments */}
              <Link
                to="/doctor/appointments"
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-300 block"
              >
                <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-[#0A2540] font-bold text-lg mb-2">Appointments</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">View upcoming booked sessions, patient details, and join video consultations directly.</p>
                <span className="inline-flex items-center gap-2 text-[#00B4A0] font-bold text-sm group-hover:gap-3 transition-all duration-200">
                  View Calendar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              {/* My Schedule */}
              <Link
                to="/doctor/schedule"
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-300 block"
              >
                <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-[#0A2540] font-bold text-lg mb-2">My Schedule</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">Review your existing schedule, check booked slots, and manage your working hours.</p>
                <span className="inline-flex items-center gap-2 text-[#00B4A0] font-bold text-sm group-hover:gap-3 transition-all duration-200">
                  Manage Slots
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              {/* Create Schedule */}
              <Link
                to="/doctor/schedule/create"
                className="group bg-[#0A2540] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 block relative overflow-hidden"
              >
                <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-[#00B4A0]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#00B4A0]/20 rounded-xl flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Create Schedule</h3>
                  <p className="text-white/50 text-sm mb-5 leading-relaxed">Set your weekly availability. Add new time slots so patients can book appointments with you.</p>
                  <span className="inline-flex items-center gap-2 text-[#00B4A0] font-bold text-sm group-hover:gap-3 transition-all duration-200">
                    Add Slots
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>

            </div>
          </div>

          {/* Info bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00B4A0]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A2540]">Platform Notice</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Keep your schedule up to date so patients can find your availability. Video consultations are enabled automatically when a patient books a confirmed slot.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
