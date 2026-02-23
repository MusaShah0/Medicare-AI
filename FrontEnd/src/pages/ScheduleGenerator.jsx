import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <--- IMPORT LINK

const ScheduleGenerator = () => {
  // --- STATE ---
  const [setup, setSetup] = useState({
    startTime: '09:00',
    endTime: '17:00',
    duration: 30,
    clinic_fee: 0
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // --- LOGIC: TIME SPLITTER ---
  const generateTimeSlots = () => {
    setMessage({ type: '', text: '' });
    const { startTime, endTime, duration } = setup;

    const parseMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMin = parseMinutes(startTime);
    const endMin = parseMinutes(endTime);

    if (startMin >= endMin) {
      setMessage({ type: 'error', text: 'Start time must be before End time.' });
      return;
    }
    if (selectedDays.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one day.' });
      return;
    }

    let slots = [];
    let current = startMin;

    while (current + Number(duration) <= endMin) {
      const slotStart = formatTime(current);
      const slotEnd = formatTime(current + Number(duration));
      
      slots.push({
        id: Date.now() + Math.random(),
        startTime: slotStart,
        endTime: slotEnd,
        status: 'available'
      });

      current += Number(duration);
    }

    setGeneratedSlots(slots);
  };

  // --- HANDLERS ---
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const removeSlot = (idToRemove) => {
    setGeneratedSlots(generatedSlots.filter(slot => slot.id !== idToRemove));
  };

  const handleSave = async () => {
    if (generatedSlots.length === 0 || selectedDays.length === 0) {
      setMessage({ type: 'error', text: "Please generate slots first." });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const payload = {
      days: selectedDays,
      slots: generatedSlots.map(({ startTime, endTime }) => ({ startTime, endTime })),
      clinic_fee: Number(setup.clinic_fee),
      slotDuration: Number(setup.duration)
    };

    try {
      const response = await axios.post('http://localhost:4000/Add_Sechdule', payload, {
        withCredentials: true 
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setGeneratedSlots([]);
        setSelectedDays([]);
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to save schedule";
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
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
      
      {/* --- BACK BUTTON --- */}
      <div className="mb-6">
        <Link to="/doctor-dashboard" className="inline-flex items-center text-slate-500 hover:text-teal-600 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Dashboard
        </Link>
      </div>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Schedule Manager</h1>
        <p className="text-slate-500 mt-2 text-lg">Define your availability and consultation fees.</p>
      </div>

      {/* MESSAGES */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 shadow-sm animate-fade-in-down ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
          {message.type === 'error' ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CONFIGURATION */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Time & Fee Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Time Configuration
            </h3>
            
            <div className="space-y-5">
              <InputWrapper label="Start Time" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}>
                <input type="time" value={setup.startTime} onChange={(e) => setSetup({...setup, startTime: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700" />
              </InputWrapper>

              <InputWrapper label="End Time" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>}>
                <input type="time" value={setup.endTime} onChange={(e) => setSetup({...setup, endTime: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700" />
              </InputWrapper>

              <InputWrapper label="Slot Duration" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}>
                <select value={setup.duration} onChange={(e) => setSetup({...setup, duration: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700 appearance-none">
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </InputWrapper>

              <InputWrapper label="Consultation Fee ($)" icon={<span className="text-lg font-bold text-slate-400">$</span>}>
                <input 
                  type="number" 
                  value={setup.clinic_fee} 
                  onChange={(e) => setSetup({...setup, clinic_fee: e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-medium text-slate-700" 
                  placeholder="0"
                />
              </InputWrapper>
            </div>
          </div>

          {/* 2. Days Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Select Days
            </h3>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button 
                    key={day} 
                    onClick={() => toggleDay(day)} 
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border 
                      ${isSelected 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-200 transform scale-105' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50'}`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Generate Button */}
          <button 
            onClick={generateTimeSlots} 
            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
             <span>Generate Schedule</span>
             <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>

        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Preview Slots</h3>
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {generatedSlots.length > 0 ? `${generatedSlots.length} Slots Generated` : 'No Slots Yet'}
              </span>
            </div>

            {generatedSlots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                 </div>
                 <h4 className="text-lg font-bold text-slate-700">Ready to Plan?</h4>
                 <p className="text-slate-500 max-w-xs mt-2">Set your time and days on the left, then click Generate to preview your schedule here.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8 content-start">
                  {generatedSlots.map((slot) => (
                    <div key={slot.id} className="group relative bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700 hover:shadow-md transition-all rounded-lg py-2 px-1 text-center cursor-pointer overflow-hidden" onClick={() => removeSlot(slot.id)}>
                      <span className="text-sm font-semibold">{slot.startTime} - {slot.endTime}</span>
                      {/* Delete Overlay */}
                      <div className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs font-bold uppercase tracking-wider">Remove</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-teal-500/20 transition-all duration-300 transform 
                      ${loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-1 active:scale-95'}`}
                  >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Syncing with Database...
                        </span>
                    ) : (
                      "Confirm & Save Schedule"
                    )}
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