import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Format ISO date → "Mon, Jul 14, 2025"
const formatDateLabel = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

// Format "YYYY-MM-DD" for API call
const toDateStr = (isoDate) => new Date(isoDate).toISOString().split('T')[0];

const statusStyle = {
  available: 'text-teal-700 bg-teal-100',
  booked: 'text-blue-700 bg-blue-100',
  cancelled: 'text-red-600 bg-red-100',
  completed: 'text-slate-500 bg-slate-100',
  ongoing: 'text-amber-700 bg-amber-100'
};

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
      const response = await axios.get('http://localhost:4000/Show_Doctor_Sechdule', {
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
      await axios.delete(`http://localhost:4000/Delete_Sechdule/${slotId}`, {
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
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
      Loading your schedule...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <Link to="/doctor-dashboard" className="inline-flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Schedule</h1>
            <p className="text-slate-500 mt-1">Manage your upcoming availability.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-slate-600 border border-slate-200">
            Total Slots: <span className="text-teal-600 font-bold text-lg ml-1">{schedules.length}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>
        )}

        {!loading && schedules.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900">No Upcoming Schedule</h3>
            <p className="text-slate-500 mt-1 mb-4">You haven't added any slots yet.</p>
            <Link to="/doctor/schedule/create" className="text-teal-600 font-bold hover:underline">
              Create Schedule →
            </Link>
          </div>
        )}

        {sortedDates.length > 0 && (
          <div className="flex gap-6">

            {/* Date Sidebar */}
            <div className="w-48 flex-shrink-0 space-y-2">
              {sortedDates.map(dateKey => {
                const isActive = dateKey === activeDateKey;
                const slotCount = grouped[dateKey].length;
                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all font-medium text-sm
                      ${isActive
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                  >
                    <div className="font-bold">
                      {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })} · {slotCount} slot{slotCount !== 1 ? 's' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Slots Panel */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {activeDateKey && (
                <>
                  <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">{formatDateLabel(activeDateKey + 'T00:00:00')}</h3>
                    <span className="text-xs bg-slate-700 text-slate-200 px-3 py-1 rounded-full">
                      {grouped[activeDateKey].length} slot(s)
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    {grouped[activeDateKey]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(slot => (
                        <div
                          key={slot._id}
                          className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50 transition"
                        >
                          <div>
                            <p className="font-bold text-slate-700">{slot.startTime} – {slot.endTime}</p>
                            <p className="text-xs text-slate-500 mt-0.5">${slot.clinic_fee} · {slot.slotDuration} min</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${statusStyle[slot.status] || 'text-slate-500 bg-slate-100'}`}>
                              {slot.status}
                            </span>
                            {slot.status === 'available' && (
                              <button
                                onClick={() => handleDelete(slot._id)}
                                className="text-slate-400 hover:text-red-500 transition"
                                title="Delete slot"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default MySchedule;
