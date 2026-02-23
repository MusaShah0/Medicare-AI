import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- HELPERS ---
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [h, m] = timeString.split(':');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
      case 'ongoing': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/20';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/20';
    }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:4000/My_Appointments', {
          withCredentials: true 
        });
        if (res.data.status === 1) {
          setAppointments(res.data.data);
        } else {
          setAppointments([]); 
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Please log in to view appointments.");
        } else {
          setAppointments([]);
        }
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchAppointments();
  }, []);

  // --- SKELETON LOADER ---
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  // --- ERROR STATE ---
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/patient/login" className="px-6 py-2 bg-slate-900 text-white rounded-lg">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <Link to="/doctors" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition">Book New</Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
             <div className="text-6xl mb-4">🗓️</div>
             <h3 className="text-xl font-bold text-slate-800">No Appointments Yet</h3>
             <p className="text-slate-500 mt-2 mb-6">Book your first appointment to see it here.</p>
             <Link to="/doctors" className="text-teal-600 font-bold hover:underline">Find a Doctor</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((app) => {
              const doctor = app.doctor_id;
              const slot = app.sechdule_Id;
              
              return (
                <div key={app._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  
                  {/* Status & Doctor */}
                  <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-2xl uppercase">
                          {doctor?.first_Name ? doctor.first_Name.charAt(0) : "D"}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ring-1 ring-inset ${getStatusStyles(app.status)}`}>
                          {app.status}
                      </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-6">
                      <h2 className="text-xl font-bold text-slate-900">Dr. {doctor?.first_Name || "Unknown"} {doctor?.last_Name}</h2>
                      <p className="text-sm text-slate-400 font-medium">{doctor?.speciality || "Specialist"}</p>
                  </div>

                  {/* Time Info */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Day</span>
                        <span className="text-sm font-bold text-slate-700">{slot?.day || "TBD"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Time</span>
                        <span className="text-sm font-bold text-slate-700">{formatTime(slot?.startTime)}</span>
                      </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-300">ID: {app._id.slice(-6).toUpperCase()}</span>
                      
                      {/* JOIN VIDEO BUTTON */}
                      {app.status !== 'cancelled' && app.status !== 'completed' ? (
                        <Link 
                          to={`/room/${app.meeting_id}`}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          Join Call
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-sm font-medium">Ended</span>
                      )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyAppointments;