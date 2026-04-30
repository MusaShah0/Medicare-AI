import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState(null);

  // Live clock — ticks every 30s so isJoinable stays accurate
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [h, m] = timeString.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  // Returns true only if slot is today AND current time is within [startTime-5min, endTime)
  const isJoinable = (slot) => {
    if (!slot?.date || !slot?.startTime || !slot?.endTime) return false;
    const slotDate = new Date(slot.date);
    if (
      slotDate.getFullYear() !== now.getFullYear() ||
      slotDate.getMonth()    !== now.getMonth()    ||
      slotDate.getDate()     !== now.getDate()
    ) return false;
    const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= toMins(slot.startTime) - 5 && nowMins < toMins(slot.endTime);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/Doctor_Appointments`, {
          withCredentials: true
        });
        if (res.data.status === 1) {
          setAppointments(res.data.data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in as a doctor.');
        } else {
          setAppointments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Re-fetch when user returns to this tab (e.g. after leaving a video call)
    window.addEventListener('focus', fetchAppointments);
    return () => window.removeEventListener('focus', fetchAppointments);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':   return 'text-[#00B4A0] bg-[#00B4A0]/10 border border-[#00B4A0]/20';
      case 'ongoing':  return 'text-amber-700 bg-amber-100 border border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border border-red-200';
      default:         return 'text-slate-500 bg-slate-100 border border-slate-200';
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget) return;
    setRescheduleLoading(true);
    setRescheduleMsg(null);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/Reschedule_Appointment/${rescheduleTarget._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setRescheduleMsg({ type: 'success', text: 'Appointment cancelled. The patient has been issued a free rebook token.' });
        setTimeout(() => {
          setAppointments(prev => prev.filter(a => a._id !== rescheduleTarget._id));
          setRescheduleTarget(null);
          setRescheduleMsg(null);
        }, 2000);
      }
    } catch (err) {
      setRescheduleMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reschedule. Please try again.' });
    } finally {
      setRescheduleLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading appointments...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#F4F7F9]">

        {/* Sticky Navbar */}
        <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-[#0A2540] tracking-tight">
                Medi<span className="text-[#00B4A0]">Care</span> AI
              </span>
              <span className="hidden sm:block w-px h-5 bg-slate-200" />
              <span className="hidden sm:block text-sm font-semibold text-slate-400">Appointments</span>
            </div>
            <Link
              to="/doctor-dashboard"
              className="group flex items-center gap-2 text-slate-500 hover:text-[#0A2540] font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </nav>

        {/* Navy Hero Strip */}
        <div className="relative bg-[#0A2540] overflow-hidden">
          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#00B4A0]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#00B4A0]/8 rounded-full blur-2xl translate-y-1/2" />

          <div className="relative max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-2">Doctor Portal</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Appointments</h1>
              <p className="text-white/50 mt-2 text-sm">Manage and join your upcoming patient consultations.</p>
            </div>
            <div className="flex-shrink-0">
              <span className="bg-white/10 border border-white/20 backdrop-blur-sm text-white font-bold px-5 py-2.5 rounded-full text-sm">
                {appointments.length} {appointments.length === 1 ? 'Appointment' : 'Appointments'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-5 py-8">

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {appointments.length === 0 && !error ? (
            /* Empty State */
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0A2540]">No Appointments Found</h3>
              <p className="text-slate-400 mt-2 text-sm">You don't have any booked appointments yet.</p>
            </div>
          ) : (
            /* 3-Column Card Grid */
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((app) => {
                const patient = app.patient_id;
                const slot = app.sechdule_Id;
                const joinable = isJoinable(slot);
                const initials = patient?.first_Name?.[0] || '?';

                return (
                  <div
                    key={app._id}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  >
                    {/* Card Header: Patient info + status */}
                    <div className="p-5 flex items-center gap-4 border-b border-slate-50">
                      <div className="w-12 h-12 rounded-full bg-[#00B4A0]/10 text-[#00B4A0] flex items-center justify-center font-extrabold text-lg border border-[#00B4A0]/20 flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-[#0A2540] leading-tight truncate">
                          {patient ? `${patient.first_Name} ${patient.last_Name}` : 'Unknown Patient'}
                        </h2>
                        <div className="mt-1.5">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full uppercase font-bold tracking-wide ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body: Date & Time */}
                    <div className="p-5 flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {slot?.date
                            ? new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatTime(slot?.startTime)} &ndash; {formatTime(slot?.endTime)}
                        </span>
                      </div>
                    </div>

                    {/* Animated accent line */}
                    <div className="h-0.5 w-0 bg-[#00B4A0] group-hover:w-full transition-all duration-500" />

                    {/* Card Footer */}
                    <div className="bg-slate-50/70 px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{app._id.slice(-6).toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Reschedule — only for booked */}
                        {app.status === 'booked' && (
                          <button
                            onClick={() => { setRescheduleTarget(app); setRescheduleMsg(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reschedule
                          </button>
                        )}

                        {/* Join / Upcoming */}
                        {(app.status === 'booked' || app.status === 'ongoing') && joinable ? (
                          <Link
                            to={`/room/${app.meeting_id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4A0] hover:bg-teal-400 text-white text-xs font-bold shadow-sm shadow-teal-200 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Start Consult
                          </Link>
                        ) : (app.status === 'booked' || app.status === 'ongoing') ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {slot?.startTime ? `Starts ${formatTime(slot.startTime)}` : 'Upcoming'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Confirmation Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0A2540]/60 backdrop-blur-sm"
            onClick={() => { if (!rescheduleLoading) { setRescheduleTarget(null); setRescheduleMsg(null); } }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">

            {/* Warning icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0A2540]">Reschedule Appointment?</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                This will cancel the appointment and give the patient a{' '}
                <span className="font-semibold text-[#00B4A0]">free rebook token</span>{' '}
                so they can pick another available slot at no charge.
              </p>
            </div>

            {/* Appointment summary */}
            <div className="bg-[#F4F7F9] rounded-2xl p-4 border border-slate-100 mb-6 space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Patient</span>
                <span className="font-bold text-[#0A2540]">
                  {rescheduleTarget.patient_id?.first_Name} {rescheduleTarget.patient_id?.last_Name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Date</span>
                <span className="font-bold text-[#0A2540]">
                  {rescheduleTarget.sechdule_Id?.date
                    ? new Date(rescheduleTarget.sechdule_Id.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Time</span>
                <span className="font-bold text-[#0A2540]">
                  {formatTime(rescheduleTarget.sechdule_Id?.startTime)} &ndash; {formatTime(rescheduleTarget.sechdule_Id?.endTime)}
                </span>
              </div>
            </div>

            {rescheduleMsg && (
              <div className={`mb-5 p-3 rounded-xl text-sm font-medium text-center ${
                rescheduleMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {rescheduleMsg.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setRescheduleTarget(null); setRescheduleMsg(null); }}
                disabled={rescheduleLoading}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduleLoading || rescheduleMsg?.type === 'success'}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rescheduleLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorAppointments;
