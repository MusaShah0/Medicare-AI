import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState({ name: 'Patient', id: '' });
  const [loading, setLoading] = useState(true);

  // Dashboard stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const statsIntervalRef = useRef(null);

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE}/logout`, { withCredentials: true });
      localStorage.removeItem('patientData');
      navigate('/patient/login');
    } catch (err) {
      console.error('Logout failed', err);
      localStorage.removeItem('patientData');
      navigate('/patient/login');
    }
  };

  // --- FETCH STATS ---
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/patient/dashboard-stats`, { withCredentials: true });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // --- FETCH PATIENT DATA & STATS ON MOUNT ---
  useEffect(() => {
    const storedData = localStorage.getItem('patientData');
    if (storedData) {
      setPatient(JSON.parse(storedData));
    }
    setLoading(false);

    // Fetch stats immediately, then poll every 30s
    fetchStats();
    statsIntervalRef.current = setInterval(fetchStats, 30000);

    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00B4A0]/30 border-t-[#00B4A0] rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  const patientFirstName = patient.first_Name || patient.name || 'Patient';

  // Stat card helper
  const StatCard = ({ icon, label, statKey, color = '#00B4A0' }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        {icon}
      </div>
      <div>
        {statsLoading ? (
          <div className="w-8 h-6 bg-slate-100 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-extrabold text-[#0A2540]">
            {stats?.[statKey] ?? '—'}
          </p>
        )}
        <p className="text-slate-500 text-sm font-medium">{label}</p>
      </div>
    </div>
  );

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
            <p className="text-[#00B4A0] text-[10px] font-bold uppercase tracking-widest mt-0.5">Patient Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          <Link
            to="/patient/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/15 text-white font-semibold border-l-4 border-[#00B4A0] transition-all duration-200"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/doctors"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Doctors
          </Link>

          <Link
            to="/my-appointments"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Appointments
          </Link>

          <Link
            to="/ai-chat"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200 border-l-4 border-transparent"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Chat
          </Link>

          <Link
            to="/patient/edit-profile"
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
        <div className="relative bg-[#0A2540] px-10 py-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-40px] right-[-60px] w-72 h-72 bg-[#00B4A0]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-60px] left-[30%] w-64 h-64 bg-[#00B4A0]/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-2">Patient Dashboard</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                Welcome back, {patientFirstName}
              </h1>
              <p className="text-white/50 mt-2 text-sm">Here is your health overview for today.</p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              {/* Notification Bell */}
              <NotificationBell role="patient" />

              <button
                onClick={() => navigate('/doctors')}
                className="bg-[#00B4A0] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-400 transition-all duration-200 shadow-lg shadow-[#00B4A0]/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find a Doctor
              </button>
              <button
                onClick={() => navigate('/ai-chat')}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 border border-white/15"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Symptom Chat
              </button>
            </div>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 p-8 space-y-8">

          {/* Stats Row — 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              statKey="total"
              label="Total Appointments"
              icon={
                <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              statKey="upcoming"
              label="Upcoming"
              icon={
                <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              statKey="completed"
              label="Completed Sessions"
              icon={
                <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              statKey="cancelled"
              label="Cancelled"
              icon={
                <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-5">Quick Actions</p>
            <div className="grid md:grid-cols-3 gap-5">

              {/* Action 1 — AI Chat */}
              <div
                className="group bg-[#0A2540] rounded-2xl p-7 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                onClick={() => navigate('/ai-chat')}
              >
                <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-[#00B4A0]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#00B4A0]/20 rounded-xl flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">AI Symptom Checker</h3>
                  <p className="text-white/50 text-sm mb-5 leading-relaxed">Chat with our AI to understand your symptoms before consulting a doctor.</p>
                  <span className="inline-flex items-center gap-2 text-[#00B4A0] font-bold text-sm group-hover:gap-3 transition-all duration-200">
                    Start Chat
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Action 2 — Find Doctors */}
              <div
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-7 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                onClick={() => navigate('/doctors')}
              >
                <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-[#0A2540] font-bold text-lg mb-2">Find a Specialist</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">Browse top-rated doctors, read reviews, and book appointments instantly.</p>
                <span className="inline-flex items-center gap-2 text-[#00B4A0] font-bold text-sm group-hover:gap-3 transition-all duration-200">
                  Search Doctors
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>

              {/* Action 3 — My Appointments */}
              <div
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-7 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                onClick={() => navigate('/my-appointments')}
              >
                <div className="w-12 h-12 bg-[#00B4A0]/10 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-[#0A2540] font-bold text-lg mb-2">My Appointments</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">View and manage your upcoming and past consultations with your doctors.</p>
                <span className="inline-flex items-center gap-2 text-[#00B4A0] font-bold text-sm group-hover:gap-3 transition-all duration-200">
                  View Appointments
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>

            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00B4A0]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A2540]">Health Disclaimer</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                MediCare AI is for informational purposes only. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
