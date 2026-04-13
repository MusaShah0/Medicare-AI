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

// ── Inline multi-select calendar ──────────────────────────────────────────────
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const CalendarPicker = ({ selectedDates, onToggle }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Can't go before current month
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  // Build grid: leading blanks + days of month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm font-bold text-slate-700">
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
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
                mx-auto w-8 h-8 rounded-full text-xs font-semibold transition-all duration-150 flex items-center justify-center
                ${past ? 'text-slate-300 cursor-not-allowed' : ''}
                ${!past && !selected && !isToday ? 'text-slate-700 hover:bg-teal-50 hover:text-teal-700' : ''}
                ${isToday && !selected ? 'ring-2 ring-teal-400 text-teal-600' : ''}
                ${selected ? 'bg-teal-600 text-white shadow-md shadow-teal-200' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-teal-600 font-semibold">{selectedDates.length} date(s) selected</span>
          <button
            onClick={() => selectedDates.forEach(d => onToggle(d))}
            className="text-xs text-slate-400 hover:text-red-500 transition font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

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
      const response = await axios.post('http://localhost:4000/Add_Sechdule', payload, {
        withCredentials: true
      });
      // 201 success
      setMessage({ type: 'success', text: `Schedule added successfully (${response.data.count} slot${response.data.count !== 1 ? 's' : ''} created)` });
      setGeneratedSlots([]);
      setSelectedDates([]);
    } catch (error) {
      const data = error.response?.data;
      const status = error.response?.status;

      if (status === 409 && data?.conflicts?.length) {
        // Conflict: existing slots — keep form intact
        setMessage({ type: 'conflict', conflicts: data.conflicts });
      } else if (status === 400 && data?.invalidDates?.length) {
        // Past dates
        setMessage({ type: 'pastDates', invalidDates: data.invalidDates });
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to save schedule' });
      }
    } finally {
      setLoading(false);
    }
  };

  const InputWrapper = ({ label, icon, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">

      <div className="mb-6">
        <Link to="/doctor-dashboard" className="inline-flex items-center text-slate-500 hover:text-teal-600 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Schedule Manager</h1>
        <p className="text-slate-500 mt-2 text-lg">Pick specific dates and define your consultation slots.</p>
      </div>

      {/* ── Message Banner ── */}
      {message && (
        <div className={`mb-6 rounded-xl border shadow-sm overflow-hidden ${
          message.type === 'success'   ? 'bg-emerald-50 border-emerald-200' :
          message.type === 'conflict'  ? 'bg-rose-50 border-rose-200' :
          message.type === 'pastDates' ? 'bg-amber-50 border-amber-200' :
                                         'bg-red-50 border-red-200'
        }`}>
          {/* Simple text messages */}
          {(message.type === 'error' || message.type === 'success') && (
            <div className="flex items-center gap-3 p-4">
              {message.type === 'success'
                ? <svg className="w-5 h-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
              <span className={`font-medium text-sm ${message.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                {message.text}
              </span>
            </div>
          )}

          {/* Past dates (400) */}
          {message.type === 'pastDates' && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-amber-800 text-sm">Cannot add schedule for past dates:</p>
              </div>
              <ul className="ml-7 space-y-0.5">
                {message.invalidDates.map(d => (
                  <li key={d} className="text-sm text-amber-700">
                    • {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conflicts (409) */}
          {message.type === 'conflict' && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                <p className="font-bold text-rose-800 text-sm">The following slots already exist and were not added:</p>
              </div>
              <ul className="ml-7 space-y-0.5">
                {message.conflicts.map((c, i) => {
                  const dateLabel = new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  const [h, m] = c.startTime.split(':').map(Number);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const timeLabel = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
                  return (
                    <li key={i} className="text-sm text-rose-700">
                      • {dateLabel} — {timeLabel}
                    </li>
                  );
                })}
              </ul>
              <p className="ml-7 mt-2 text-xs text-rose-500">Your selections are unchanged — adjust and try again.</p>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT: Config */}
        <div className="lg:col-span-1 space-y-6">

          {/* Time & Fee */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time Configuration
            </h3>
            <div className="space-y-5">
              <InputWrapper label="Start Time" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <input type="time" value={setup.startTime} onChange={e => setSetup({ ...setup, startTime: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700" />
              </InputWrapper>

              <InputWrapper label="End Time" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}>
                <input type="time" value={setup.endTime} onChange={e => setSetup({ ...setup, endTime: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700" />
              </InputWrapper>

              <InputWrapper label="Slot Duration" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <select value={setup.duration} onChange={e => setSetup({ ...setup, duration: Number(e.target.value) })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700 appearance-none">
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </InputWrapper>

              <InputWrapper label="Consultation Fee ($)" icon={<span className="text-lg font-bold text-slate-400">$</span>}>
                <input type="number" value={setup.clinic_fee} onChange={e => setSetup({ ...setup, clinic_fee: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700" placeholder="0" />
              </InputWrapper>
            </div>
          </div>

          {/* Calendar Date Picker */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Select Dates
            </h3>
            <CalendarPicker
              selectedDates={selectedDates}
              onToggle={toggleDate}
            />
          </div>

          <button
            onClick={generateTimeSlots}
            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>Generate Slots</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* RIGHT: Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">

            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Preview Slots</h3>
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {generatedSlots.length > 0 ? `${generatedSlots.length} Slots` : 'No Slots Yet'}
              </span>
            </div>

            {generatedSlots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-700">Ready to Plan?</h4>
                <p className="text-slate-500 max-w-xs mt-2">Select dates and configure times on the left, then click Generate.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Selected dates summary */}
                {selectedDates.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedDates.map(d => (
                      <span key={d} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                        {formatDateLabel(d)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8 content-start">
                  {generatedSlots.map(slot => (
                    <div
                      key={slot.id}
                      onClick={() => removeSlot(slot.id)}
                      className="group relative bg-white border border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600 hover:shadow-md transition-all rounded-lg py-2 px-1 text-center cursor-pointer overflow-hidden"
                    >
                      <span className="text-sm font-semibold relative z-10">{slot.startTime} – {slot.endTime}</span>
                      <div className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs font-bold uppercase tracking-wider">Remove</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-3 text-center">
                    These {generatedSlots.length} slot(s) will be created for each of the {selectedDates.length} selected date(s) — {generatedSlots.length * selectedDates.length} total entries.
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-teal-500/20 transition-all duration-300 transform
                      ${loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-1 active:scale-95'}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : 'Confirm & Save Schedule'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleGenerator;
