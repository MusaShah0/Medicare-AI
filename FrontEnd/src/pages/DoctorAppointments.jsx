import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  // Live clock — ticks every 30s so isJoinable stays accurate
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
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
        const res = await axios.get('http://localhost:4000/Doctor_Appointments', {
          withCredentials: true
        });
        if (res.data.status === 1) {
          setAppointments(res.data.data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Please log in as a doctor.");
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

  const getStatusColor = (status) => {
    switch (status) {
        case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'booked': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading appointments...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* --- BACK BUTTON --- */}
        <div className="mb-6">
          <Link to="/doctor-dashboard" className="inline-flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Appointments</h1>
                <p className="text-slate-500 mt-1">Manage your upcoming consultations.</p>
            </div>
            <span className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold shadow-sm">
                {appointments.length} {appointments.length === 1 ? 'Appointment' : 'Appointments'}
            </span>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
            </div>
        )}

        {appointments.length === 0 && !error ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Appointments Found</h3>
                <p className="text-slate-400 mt-1">You don't have any booked appointments yet.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map((app) => {
                    const patient = app.patient_id;
                    const slot = app.sechdule_Id;

                    return (
                        <div key={app._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                            
                            {/* Patient Info */}
                            <div className="p-5 flex items-center gap-4 border-b border-slate-50">
                                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100">
                                    {patient?.first_Name?.[0] || "?"}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                                        {patient ? `${patient.first_Name} ${patient.last_Name}` : "Unknown"}
                                    </h2>
                                    <div className="mt-1">
                                        <span className={`px-2 py-0.5 text-[10px] rounded-md uppercase font-bold tracking-wide ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 flex-1 space-y-3">
                                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    {slot?.date
                                      ? new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                      : "N/A"}
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {formatTime(slot?.startTime)} – {formatTime(slot?.endTime)}
                                </div>
                            </div>

                            {/* FOOTER ACTION */}
                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-400">ID: {app._id.slice(-6).toUpperCase()}</span>

                                {(app.status === 'booked' || app.status === 'ongoing') && isJoinable(slot) ? (
                                    <Link
                                        to={`/room/${app.meeting_id}`}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-teal-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                        Start Consult
                                    </Link>
                                ) : (app.status === 'booked' || app.status === 'ongoing') ? (
                                    <span className="text-xs text-slate-400 font-medium">
                                        {slot?.startTime ? `Starts at ${formatTime(slot.startTime)}` : 'Upcoming'}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;