import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FindDoctors = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/View_Doctor`);
        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          setError('Failed to load doctor list.');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.first_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.last_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.speciality?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeciality = specialityFilter
      ? doc.speciality?.toLowerCase() === specialityFilter.toLowerCase()
      : true;
    return matchesSearch && matchesSpeciality;
  });

  const specialities = [...new Set(doctors.map((d) => d.speciality).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9]">
        {/* Navbar skeleton */}
        <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <span className="text-lg font-bold text-[#0A2540]">
              Medicare<span className="font-extrabold">AI</span>
            </span>
          </div>
        </nav>

        {/* Hero skeleton */}
        <div className="bg-[#0A2540] py-14 px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#00B4A0]/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-[#00B4A0]/10 blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto relative">
            <div className="h-4 w-24 bg-white/10 rounded-full animate-pulse mb-4" />
            <div className="h-10 w-72 bg-white/10 rounded-xl animate-pulse mb-3" />
            <div className="h-5 w-96 bg-white/10 rounded-xl animate-pulse mb-8" />
            <div className="h-14 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="h-44 bg-slate-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-40 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded-full animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center max-w-sm">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 bg-[#00B4A0] text-white rounded-xl font-bold text-sm hover:bg-teal-400 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans">

      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-[#0A2540]">
            Medicare<span className="font-extrabold">AI</span>
          </span>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0A2540] font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      {/* ── HERO HEADER ── */}
      <div className="bg-[#0A2540] py-14 px-8 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00B4A0]/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-[#00B4A0]/10 blur-3xl" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">
            Our Specialists
          </p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Find Your Specialist
          </h1>
          <p className="text-white/60 text-base mb-8 max-w-xl">
            Browse top-rated doctors, view their profiles, and book an appointment in seconds.
          </p>

          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white rounded-xl flex items-center px-4 gap-3 shadow-sm">
              <svg className="w-5 h-5 text-[#00B4A0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or speciality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 py-3.5 text-slate-700 placeholder-slate-400 focus:outline-none text-sm bg-transparent"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] shadow-sm min-w-[180px]"
            >
              <option value="">All Specialities</option>
              {specialities.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── DOCTOR GRID ── */}
      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* Results count */}
        {!loading && filteredDoctors.length > 0 && (
          <p className="text-sm text-slate-500 mb-6">
            Showing <span className="font-bold text-[#0A2540]">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? 's' : ''}
            {specialityFilter && <> in <span className="font-bold text-[#00B4A0]">{specialityFilter}</span></>}
          </p>
        )}

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0A2540]">No doctors found</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">Try adjusting your search or filter.</p>
            <button
              onClick={() => { setSearchTerm(''); setSpecialityFilter(''); }}
              className="px-5 py-2.5 bg-[#0A2540] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const imgUrl = getImageUrl(doc.profile_Picture);
              const initials = (doc.first_Name?.charAt(0) || 'D').toUpperCase();

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Avatar top section */}
                  <div className="relative h-44 bg-[#0A2540] flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={`Dr. ${doc.first_Name}`}
                        className="h-44 w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ display: imgUrl ? 'none' : 'flex' }}
                    >
                      <span className="text-white text-6xl font-extrabold opacity-90">{initials}</span>
                    </div>
                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 to-transparent pointer-events-none" />
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-[#0A2540] leading-snug">
                      Dr. {doc.first_Name} {doc.last_Name}
                    </h2>

                    <span className="mt-2 inline-block self-start bg-[#00B4A0]/10 text-[#00B4A0] text-xs font-bold px-2.5 py-1 rounded-full">
                      {doc.speciality}
                    </span>

                    {/* Degree tags */}
                    {doc.degrees && (Array.isArray(doc.degrees) ? doc.degrees : [doc.degrees]).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(Array.isArray(doc.degrees) ? doc.degrees : [doc.degrees]).map((deg, i) => (
                          <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {deg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    {(doc.experience || doc.completed_appointments !== undefined) && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        {doc.experience && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {doc.experience} yrs exp
                          </span>
                        )}
                        {doc.completed_appointments !== undefined && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {doc.completed_appointments} completed
                          </span>
                        )}
                      </div>
                    )}

                    {/* Book button */}
                    <button
                      onClick={() => navigate(`/book-appointment/${doc._id}`, { state: { doctor: doc } })}
                      className="mt-auto w-full bg-[#00B4A0] text-white rounded-xl py-2.5 font-bold hover:bg-teal-400 transition text-sm mt-5 group-hover:shadow-md group-hover:shadow-[#00B4A0]/20"
                    >
                      Book Appointment
                    </button>
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

export default FindDoctors;
