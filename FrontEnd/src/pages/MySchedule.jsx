import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Format ISO date → "Mon, Jul 14, 2025"
const formatDateLabel = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

// Format "YYYY-MM-DD" for grouping key
const toDateStr = (isoDate) => new Date(isoDate).toISOString().split('T')[0];

// ── Sidebar shared component ───────────────────────────────────────────────────
const Sidebar = ({ active }) => (
  <aside className="bg-[#0A2540] w-64 fixed inset-y-0 left-0 flex flex-col z-20">
    {/* Brand */}
    <div className="px-6 py-6 border-b border-white/10">
      <span className="text-white font-extrabold text-xl tracking-tight">
        Medi<span className="text-[#00B4A0]">Care</span> AI
      </span>
    </div>

    {/* Nav links */}
    <nav className="flex-1 px-4 py-6 space-y-1">
      <Link
        to="/doctor-dashboard"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${
          active === 'dashboard'
            ? 'bg-white/15 text-white font-semibold border-[#00B4A0]'
            : 'text-white/70 hover:text-white hover:bg-white/10 border-transparent'
        }`}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </Link>
      <Link
        to="/doctor/appointments"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${
          active === 'appointments'
            ? 'bg-white/15 text-white font-semibold border-[#00B4A0]'
            : 'text-white/70 hover:text-white hover:bg-white/10 border-transparent'
        }`}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Appointments
      </Link>
      <Link
        to="/doctor/schedule"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${
          active === 'schedule'
            ? 'bg-white/15 text-white font-semibold border-[#00B4A0]'
            : 'text-white/70 hover:text-white hover:bg-white/10 border-transparent'
        }`}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        My Schedule
      </Link>
      <Link
        to="/doctor/schedule/create"
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${
          active === 'create'
            ? 'bg-white/15 text-white font-semibold border-[#00B4A0]'
            : 'text-white/70 hover:text-white hover:bg-white/10 border-transparent'
        }`}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Schedule
      </Link>

      <Link
        to="/doctor/edit-profile"
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm font-medium border-l-2 border-transparent text-white/70 hover:text-white hover:bg-white/10"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Profile
      </Link>
    </nav>

    {/* Logout */}
    <div className="px-4 pb-6">
      <Link
        to="/logout"
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/10 transition text-sm font-medium border-l-2 border-transparent"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </Link>
    </div>
  </aside>
);

// ── SlotCard ──────────────────────────────────────────────────────────────────
const SlotCard = ({ slot, onDelete }) => {
  const badgeStyle = {
    available:  'text-[#00B4A0] bg-[#00B4A0]/10 border border-[#00B4A0]/20',
    booked:     'text-amber-700 bg-amber-100 border border-amber-200',
    cancelled:  'text-red-600 bg-red-50 border border-red-200',
    completed:  'text-slate-500 bg-slate-100 border border-slate-200',
    ongoing:    'text-amber-700 bg-amber-100 border border-amber-200',
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
      <div>
        <p className="font-bold text-[#0A2540] text-base tabular-nums">{slot.startTime} &ndash; {slot.endTime}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">${slot.clinic_fee} &middot; {slot.slotDuration} min</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide ${badgeStyle[slot.status] || 'text-slate-500 bg-slate-100 border border-slate-200'}`}>
          {slot.status}
        </span>
        {slot.status === 'available' && (
          <button
            onClick={() => onDelete(slot._id)}
            className="border border-red-200 text-red-500 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-red-50 hover:border-red-300 transition-all"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const MySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/Show_Doctor_Sechdule`, {
        withCredentials: true
      });
      if (response.data.status === 1) {
        setSchedules(response.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to load schedule. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/Delete_Sechdule/${slotId}`, {
        withCredentials: true
      });
      setSchedules(prev => prev.filter(s => s._id !== slotId));
    } catch {
      alert('Failed to delete slot.');
    }
  };

  // Group by YYYY-MM-DD
  const grouped = schedules.reduce((acc, slot) => {
    const key = toDateStr(slot.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();
  const activeDateKey = selectedDate || sortedDates[0] || null;

  if (loading) return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading your schedule...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex">
      <Sidebar active="schedule" />

      <main className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-1">Doctor Portal</p>
            <h1 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">My Schedule</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage your upcoming availability slots.</p>
          </div>
          <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-500 flex-shrink-0 flex items-center gap-2">
            Total Slots:
            <span className="text-[#00B4A0] font-extrabold text-xl">{schedules.length}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100 text-sm font-medium">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && schedules.length === 0 && !error && (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#0A2540]">No Upcoming Schedule</h3>
            <p className="text-slate-400 mt-2 text-sm mb-6">You haven't added any availability slots yet.</p>
            <Link
              to="/doctor/schedule/create"
              className="inline-block bg-[#0A2540] hover:bg-slate-800 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all"
            >
              Create Schedule
            </Link>
          </div>
        )}

        {/* Date Filter + Slot Grid */}
        {sortedDates.length > 0 && (
          <div className="flex gap-6">

            {/* Date filter sidebar */}
            <div className="w-52 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-1.5">
                <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Filter by Date</p>

                {/* All Dates */}
                <button
                  onClick={() => setSelectedDate(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    !selectedDate
                      ? 'bg-[#0A2540] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Dates
                </button>

                {sortedDates.map(dateKey => {
                  const isActive = dateKey === activeDateKey && selectedDate !== null;
                  const slotCount = grouped[dateKey].length;
                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                        isActive
                          ? 'bg-[#0A2540] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">
                        {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className={`text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                        {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })} &middot; {slotCount} slot{slotCount !== 1 ? 's' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots grid */}
            <div className="flex-1 min-w-0">
              {selectedDate === null ? (
                // Show all dates
                <div className="space-y-6">
                  {sortedDates.map(dateKey => (
                    <div key={dateKey} className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Date group header */}
                      <div className="bg-[#0A2540] px-6 py-4 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm">{formatDateLabel(dateKey + 'T00:00:00')}</h3>
                        <span className="text-xs bg-[#00B4A0]/20 text-[#00B4A0] font-bold px-3 py-1 rounded-full border border-[#00B4A0]/30">
                          {grouped[dateKey].length} slot{grouped[dateKey].length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {grouped[dateKey]
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(slot => (
                            <SlotCard key={slot._id} slot={slot} onDelete={handleDelete} />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                activeDateKey && (
                  <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-[#0A2540] px-6 py-4 flex justify-between items-center">
                      <h3 className="text-white font-bold">{formatDateLabel(activeDateKey + 'T00:00:00')}</h3>
                      <span className="text-xs bg-[#00B4A0]/20 text-[#00B4A0] font-bold px-3 py-1 rounded-full border border-[#00B4A0]/30">
                        {grouped[activeDateKey].length} slot{grouped[activeDateKey].length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {grouped[activeDateKey]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => (
                          <SlotCard key={slot._id} slot={slot} onDelete={handleDelete} />
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default MySchedule;
