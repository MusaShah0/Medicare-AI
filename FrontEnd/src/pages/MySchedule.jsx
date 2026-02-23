import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <--- IMPORT LINK

const MySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use the exact endpoint for your new controller
  const API_URL = 'http://localhost:4000/Show_Doctor_Sechdule';

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      // withCredentials is REQUIRED to send the token/cookie for req.doctorId
      const response = await axios.get(API_URL, { withCredentials: true });
      
      if (response.data.status === 1) {
        setSchedules(response.data.data);
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      // Handle 404 specifically as "No Data" rather than an error
      if (err.response && err.response.status === 404) {
        setSchedules([]); // Empty array means no schedule found
      } else {
        setError('Failed to load schedule. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to group slots by Day (for better UI)
  const groupedSchedules = schedules.reduce((acc, curr) => {
    (acc[curr.day] = acc[curr.day] || []).push(curr);
    return acc;
  }, {});

  // Order of days for display
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading your schedule...</div>;

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Schedule</h1>
            <p className="text-slate-500 mt-1">Manage your availability and booked slots.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-slate-600 border border-slate-200">
            Total Slots: <span className="text-teal-600 font-bold text-lg ml-1">{schedules.length}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && schedules.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h3 className="text-lg font-medium text-slate-900">No Schedule Found</h3>
            <p className="text-slate-500 mt-1 mb-4">You haven't added any available slots yet.</p>
            <Link to="/doctor/schedule/create" className="text-teal-600 font-bold hover:underline">Create Schedule &rarr;</Link>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dayOrder.map(day => {
            const daySlots = groupedSchedules[day];
            if (!daySlots) return null; // Skip days with no slots

            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header */}
                <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-white font-bold">{day}</h3>
                  <span className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded-full">{daySlots.length} Slots</span>
                </div>
                
                {/* Slots List */}
                <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {daySlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((slot) => (
                      <div key={slot._id} className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${slot.status === 'booked' ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100 hover:border-teal-300'}`}>
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{slot.startTime} - {slot.endTime}</p>
                          <p className="text-xs text-slate-500 mt-0.5">${slot.clinic_fee} • {slot.slotDuration} min</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${slot.status === 'booked' ? 'text-red-600 bg-red-100' : 'text-teal-700 bg-teal-200'}`}>
                          {slot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MySchedule;