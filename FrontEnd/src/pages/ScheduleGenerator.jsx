import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Returns "YYYY-MM-DD" for a Date object (local time safe)
const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const todayStr = toDateStr(new Date());
const isPastDate = (dateStr) => dateStr < todayStr;

const formatDateLabel = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

// ── Sidebar ────────────────────────────────────────────────────────────────────
const Sidebar = ({ active }) => (
  <aside className="bg-[#0A2540] w-64 fixed inset-y-0 left-0 flex flex-col z-20">
    <div className="px-6 py-6 border-b border-white/10">
      <span className="text-white font-extrabold text-xl tracking-tight">
        Medi<span className="text-[#00B4A0]">Care</span> AI
      </span>
    </div>
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

// ── CalendarPicker ─────────────────────────────────────────────────────────────
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarPicker = ({ selectedDates, onToggle }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={isCurrentMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition border border-slate-100"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-extrabold text-[#0A2540]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 transition border border-slate-100"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const past = isPastDate(dateStr);
          const isToday = dateStr === todayStr;
          const selected = selectedDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              disabled={past}
              onClick={() => !past && onToggle(dateStr)}
              className={`
                mx-auto w-9 h-9 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center
                ${past ? 'text-slate-300 cursor-not-allowed' : ''}
                ${!past && !selected && !isToday ? 'text-slate-700 hover:bg-[#00B4A0]/10 hover:text-[#00B4A0]' : ''}
                ${isToday && !selected ? 'bg-[#0A2540] text-white font-bold shadow-sm' : ''}
                ${selected ? 'bg-[#00B4A0] text-white shadow-sm shadow-teal-200' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#00B4A0]">{selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected</span>
          <button
            onClick={() => selectedDates.forEach(d => onToggle(d))}
            className="text-xs text-slate-400 hover:text-red-500 transition font-semibold"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

// ── ScheduleGenerator ──────────────────────────────────────────────────────────
const ScheduleGenerator = () => {
  const [setup, setSetup] = useState({
    startTime: '09:00',
    endTime: '17:00',
    duration: 30,
    clinic_fee: 0
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success'|'conflict'|'pastDates', text, conflicts, invalidDates }

  const parseMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const formatTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const generateTimeSlots = () => {
    setMessage(null);
    const { startTime, endTime, duration } = setup;
    const startMin = parseMinutes(startTime);
    const endMin = parseMinutes(endTime);

    if (startMin >= endMin) {
      setMessage({ type: 'error', text: 'Start time must be before End time.' });
      return;
    }
    if (selectedDates.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one date.' });
      return;
    }

    const slots = [];
    let current = startMin;
    while (current + Number(duration) <= endMin) {
      slots.push({
        id: Date.now() + Math.random(),
        startTime: formatTime(current),
        endTime: formatTime(current + Number(duration))
      });
      current += Number(duration);
    }

    setGeneratedSlots(slots);
  };

  const toggleDate = (dateStr) => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const removeSlot = (id) => setGeneratedSlots(prev => prev.filter(s => s.id !== id));

  const handleSave = async () => {
    if (generatedSlots.length === 0 || selectedDates.length === 0) {
      setMessage({ type: 'error', text: 'Please select dates and generate slots first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      dates: selectedDates,
      slots: generatedSlots.map(({ startTime, endTime }) => ({ startTime, endTime })),
      clinic_fee: Number(setup.clinic_fee),
      slotDuration: Number(setup.duration)
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/Add_Sechdule`, payload, {
        withCredentials: true
      });
      setMessage({ type: 'success', text: `Schedule added successfully (${response.data.count} slot${response.data.count !== 1 ? 's' : ''} created)` });
      setGeneratedSlots([]);
      setSelectedDates([]);
    } catch (error) {
      const data = error.response?.data;
      const status = error.response?.status;

      if (status === 409 && data?.conflicts?.length) {
        setMessage({ type: 'conflict', conflicts: data.conflicts });
      } else if (status === 400 && data?.invalidDates?.length) {
        setMessage({ type: 'pastDates', invalidDates: data.invalidDates });
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to save schedule' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex">
      <Sidebar active="create" />

      <main className="ml-64 flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-1">Doctor Portal</p>
          <h1 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">Create Schedule</h1>
          <p className="text-slate-500 mt-1 text-sm">Pick specific dates and define your consultation slots.</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 rounded-2xl border overflow-hidden ${
            message.type === 'success'   ? 'bg-emerald-50 border-emerald-200' :
            message.type === 'conflict'  ? 'bg-rose-50 border-rose-200' :
            message.type === 'pastDates' ? 'bg-amber-50 border-amber-200' :
                                           'bg-red-50 border-red-200'
          }`}>

            {/* Simple text banner (success / error) */}
            {(message.type === 'success' || message.type === 'error') && (
              <div className="flex items-center gap-3 p-4">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={`font-semibold text-sm ${message.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {message.text}
                </span>
              </div>
            )}

            {/* Past dates warning */}
            {message.type === 'pastDates' && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-bold text-amber-800 text-sm">Cannot add schedule for past dates:</p>
                </div>
                <ul className="ml-7 space-y-1">
                  {message.invalidDates.map(d => (
                    <li key={d} className="text-sm text-amber-700">
                      {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conflict warning */}
            {message.type === 'conflict' && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="font-bold text-rose-800 text-sm">The following slots already exist and were not added:</p>
                </div>
                <ul className="ml-7 space-y-1">
                  {message.conflicts.map((c, i) => {
                    const dateLabel = new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    const [h, m] = c.startTime.split(':').map(Number);
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const timeLabel = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
                    return (
                      <li key={i} className="text-sm text-rose-700">{dateLabel} &mdash; {timeLabel}</li>
                    );
                  })}
                </ul>
                <p className="ml-7 mt-2 text-xs text-rose-500">Your selections are unchanged — adjust and try again.</p>
              </div>
            )}
          </div>
        )}

        {/* Two-column grid */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* LEFT — Select Dates */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-[#0A2540]">Select Dates</h3>
            </div>

            <CalendarPicker selectedDates={selectedDates} onToggle={toggleDate} />

            {/* Teal date chips */}
            {selectedDates.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Selected Dates</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.sort().map(d => (
                    <span
                      key={d}
                      className="bg-[#00B4A0]/10 text-[#00B4A0] border border-[#00B4A0]/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                    >
                      {formatDateLabel(d)}
                      <button
                        onClick={() => toggleDate(d)}
                        className="text-[#00B4A0]/60 hover:text-[#00B4A0] transition font-extrabold leading-none w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#00B4A0]/10"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Time Configuration */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-[#0A2540]">Time Configuration</h3>
            </div>

            {/* 2x2 Input Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest">Start Time</label>
                <input
                  type="time"
                  value={setup.startTime}
                  onChange={e => setSetup({ ...setup, startTime: e.target.value })}
                  className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest">End Time</label>
                <input
                  type="time"
                  value={setup.endTime}
                  onChange={e => setSetup({ ...setup, endTime: e.target.value })}
                  className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest">Duration</label>
                <select
                  value={setup.duration}
                  onChange={e => setSetup({ ...setup, duration: Number(e.target.value) })}
                  className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] transition appearance-none bg-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest">Fee ($)</label>
                <input
                  type="number"
                  value={setup.clinic_fee}
                  onChange={e => setSetup({ ...setup, clinic_fee: e.target.value })}
                  className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] transition"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Generate Slots button */}
            <button
              onClick={generateTimeSlots}
              className="border-2 border-[#00B4A0] text-[#00B4A0] rounded-xl px-6 py-2.5 font-bold text-sm hover:bg-[#00B4A0]/10 transition-all mb-5"
            >
              Generate Slots
            </button>

            {/* Slot Preview */}
            {generatedSlots.length > 0 ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest">
                    Preview &mdash; {generatedSlots.length} slot{generatedSlots.length !== 1 ? 's' : ''}
                  </p>
                  <span className="text-[11px] text-slate-400">Click to remove</span>
                </div>

                {/* Removable slot chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {generatedSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => removeSlot(slot.id)}
                      className="bg-[#F4F7F9] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-600 font-semibold hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all tabular-nums"
                    >
                      {slot.startTime} &ndash; {slot.endTime}
                    </button>
                  ))}
                </div>

                {/* Summary + Save */}
                <div className="mt-auto border-t border-slate-100 pt-5">
                  <p className="text-xs text-slate-400 mb-4 text-center font-medium">
                    {generatedSlots.length} slot{generatedSlots.length !== 1 ? 's' : ''} &times; {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} = <span className="text-[#0A2540] font-bold">{generatedSlots.length * selectedDates.length} total entries</span>
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full bg-[#0A2540] hover:bg-slate-800 text-white rounded-xl px-8 py-3.5 font-bold text-sm transition-all ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Schedule'}
                  </button>
                </div>
              </div>
            ) : (
              /* Empty slot placeholder */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 font-medium">Select dates and click<br /><span className="text-[#00B4A0] font-bold">Generate Slots</span> to preview.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ScheduleGenerator;
