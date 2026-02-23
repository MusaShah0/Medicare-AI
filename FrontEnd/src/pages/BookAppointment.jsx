import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PLACEHOLDER_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect fill='%23e2e8f0' width='150' height='150'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='16' dy='5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EDoctor%3C/text%3E%3C/svg%3E";

const BookAppointment = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // We get the doctor object passed from the FindDoctors page
  const doctor = location.state?.doctor;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATES FOR BOOKING ---
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  // Helper: Image
  const getImageUrl = (path) => (!path ? PLACEHOLDER_IMG : (path.startsWith("data:") || path.startsWith("http")) ? path : `http://localhost:4000${path}`);

  // Helper: Time Formatter
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [h, m] = timeString.split(':');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  // Helper: Day Sorter
  const dayOrder = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };

  // 1. Fetch Schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/Show_Appoitment_Sechdule/${id}`);
        if (res.data.status === 1 && Array.isArray(res.data.data)) {
            setSchedules(res.data.data);
        } else {
            setSchedules([]);
        }
      } catch (err) {
        if (err.response?.status !== 404) setError("Unable to load appointment slots.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSchedule();
  }, [id]);

  // 2. HANDLE BOOKING 
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    try {
        const response = await axios.post(
            `http://localhost:4000/Book_Appointment/${selectedSlot._id}`, 
            {}, 
            { withCredentials: true } 
        );

        if (response.data.status === 1) {
            setSchedules(prev => prev.filter(slot => slot._id !== selectedSlot._id));
            setSelectedSlot(null);
            alert("Appointment Booked Successfully!"); 
            // Optional: Redirect to My Appointments page after booking
            // navigate('/my-appointments');
        } 
    } catch (err) {
        if (err.response?.status === 401) {
            navigate('/patient/login');
        } else {
            const msg = err.response?.data?.msg || "Booking failed. Please try again.";
            alert(msg);
        }
    } finally {
        setIsBooking(false);
    }
  };

  // --- GROUPING LOGIC ---
  const groupedSchedules = schedules.reduce((acc, slot) => {
    const dayKey = slot.day || "Available Slots"; 
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(slot);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedSchedules).sort((a, b) => {
    return (dayOrder[a] || 8) - (dayOrder[b] || 8);
  });

  if (!doctor) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-700 mb-2">No doctor selected</h2>
        <p className="text-slate-500 mb-6">Please select a doctor from the list first.</p>
        <button onClick={() => navigate('/doctors')} className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition">
            Go to Find Doctors
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      
      {/* --- BACKGROUND HEADER --- */}
      <div className="h-64 bg-teal-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
        
        {/* Navigation Breadcrumb */}
        <div className="relative z-10 max-w-6xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="text-teal-100 hover:text-white flex items-center gap-2 transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to List
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 -mt-32 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* --- LEFT: DOCTOR PROFILE CARD --- */}
            <div className="md:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-slate-100 sticky top-6">
                    {/* Fixed Image Style */}
                    <img 
                        src={getImageUrl(doctor.profile_Picture)} 
                        alt={doctor.first_Name} 
                        className="w-32 h-32 rounded-full object-cover object-center border-[5px] border-white shadow-lg -mt-20 bg-white" 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} 
                    />
                    
                    <div className="mt-4">
                        <h1 className="text-2xl font-bold text-slate-800">Dr. {doctor.first_Name} {doctor.last_Name}</h1>
                        <p className="text-teal-600 font-semibold uppercase tracking-wide text-sm mt-1">{doctor.speciality}</p>
                    </div>

                    <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Experience</span>
                            <span className="font-bold text-slate-800">10+ Years</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Patients</span>
                            <span className="font-bold text-slate-800">1.2k+</span>
                        </div>
                        <div className="bg-teal-50 p-3 rounded-xl mt-4">
                            <p className="text-xs text-teal-800 font-medium">
                                "Highly recommended by patients for {doctor.speciality} treatments."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT: SCHEDULE SLOTS --- */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 min-h-[500px]">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-2xl">📅</span> Available Slots
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 ml-9">Select a time to book your appointment.</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                            Loading schedule...
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">{error}</div>
                    ) : schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p>No slots available right now.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {sortedDays.map((dayName) => {
                                const dailyFee = groupedSchedules[dayName][0]?.clinic_fee || 0;
                                return (
                                <div key={dayName} className="relative pl-6 border-l-2 border-slate-100">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-100 border-2 border-teal-500"></div>

                                    {/* Day Header */}
                                    <div className="flex flex-wrap items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-700">{dayName}</h3>
                                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                                            Consultation Fee: ${dailyFee}
                                        </span>
                                    </div>
                                    
                                    {/* Slots Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {groupedSchedules[dayName]
                                            .sort((a, b) => new Date('1970/01/01 ' + a.startTime) - new Date('1970/01/01 ' + b.startTime)) 
                                            .map((slot) => (
                                            <button 
                                                key={slot._id}
                                                onClick={() => setSelectedSlot(slot)}
                                                className="group relative py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition-all duration-200 text-sm font-medium text-slate-600 hover:text-teal-600 overflow-hidden"
                                            >
                                                <span className="relative z-10">{formatTime(slot.startTime)}</span>
                                                <div className="absolute inset-0 bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => setSelectedSlot(null)}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        🗓️
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Confirm Booking</h3>
                    <p className="text-slate-500 mt-2">You are about to book an appointment.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-3">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Doctor</span>
                        <span className="font-semibold text-slate-800">Dr. {doctor.first_Name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Day</span>
                        <span className="font-semibold text-slate-800">{selectedSlot.day}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Time</span>
                        <span className="font-semibold text-teal-600">{formatTime(selectedSlot.startTime)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="text-slate-500 text-sm">Fee</span>
                        <span className="font-bold text-slate-800">${selectedSlot.clinic_fee || 0}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setSelectedSlot(null)} 
                        disabled={isBooking} 
                        className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmBooking} 
                        disabled={isBooking} 
                        className="flex-1 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex justify-center items-center"
                    >
                        {isBooking ? (
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;