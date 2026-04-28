import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. Safe Placeholder Image
const PLACEHOLDER_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect fill='%23f1f5f9' width='150' height='150'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='16' dy='5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EDoctor%3C/text%3E%3C/svg%3E";

const FindDoctors = () => {
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Helper to fix Image URLs
  const getImageUrl = (path) => {
    if (!path) return PLACEHOLDER_IMG;
    if (path.startsWith("data:")) return path; 
    if (path.startsWith("http")) return path; 
    return `${import.meta.env.VITE_API_URL}${path}`;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/View_Doctor`);
        if (response.data.success) {
            setDoctors(response.data.data);
        } else {
            setError("Failed to load doctor list.");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter Logic for Search Bar
  const filteredDoctors = doctors.filter((doc) => 
    doc.first_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.last_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- SKELETON LOADING STATE ---
  if (loading) return (
    <div className="min-h-screen bg-slate-50 p-6">
       <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-80 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
             ))}
          </div>
       </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
            ⚠️ {error}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-teal-700 text-white pb-24 pt-12 px-6 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Find Your Specialist</h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto">
                Browse our list of top-rated doctors, view their profiles, and book an appointment in seconds.
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
                <input 
                    type="text" 
                    placeholder="Search by name or speciality (e.g. Cardiologist)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-4 pl-12 pr-4 rounded-2xl text-slate-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition placeholder-slate-400"
                />
                <svg className="w-6 h-6 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
      </div>

      {/* --- DOCTOR GRID --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-20">
        
        {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-800">No doctors found</h3>
                <p className="text-slate-500">Try adjusting your search terms.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
                <div key={doc._id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                
                {/* Card Top: Gradient Banner */}
                <div className="h-24 bg-gradient-to-r from-teal-50 to-blue-50 relative"></div>
                
                {/* Card Content (Overlapping the banner) */}
                <div className="px-6 flex flex-col items-center -mt-12 flex-1 relative z-10">
                    
                    {/* DOCTOR IMAGE - FIXED */}
                    <img 
                        src={getImageUrl(doc.profile_Picture)} 
                        alt={doc.first_Name} 
                        className="w-24 h-24 rounded-full object-cover object-center border-[4px] border-white shadow-md bg-white"
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} 
                    />
                    
                    <div className="text-center mt-4 mb-4">
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            Dr. {doc.first_Name} {doc.last_Name}
                        </h2>
                        <p className="text-teal-600 font-semibold text-sm uppercase tracking-wide mt-1">
                            {doc.speciality}
                        </p>
                        
                        {/* Qualifications Pill */}
                        <div className="mt-3 inline-flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                            <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                                {Array.isArray(doc.degrees) ? doc.degrees.join(', ') : (doc.degrees || 'Medical Specialist')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card Footer: Action Button */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto z-0">
                    <button 
                        onClick={() => navigate(`/book-appointment/${doc._id}`, { state: { doctor: doc } })}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span>Book Appointment</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </button>
                </div>

                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors;