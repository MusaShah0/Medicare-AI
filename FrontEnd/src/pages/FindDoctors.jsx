import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const SPECIALITIES = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'General Surgeon',
  'Psychiatrist',
  'Orthopedic',
];

const StarDisplay = ({ rating, count }) => {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex">
        {Array.from({ length: full }).map((_, i) => (
          <svg key={`f${i}`} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {half && (
          <svg key="half" className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="hg">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            <path fill="url(#hg)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`e${i}`} className="w-3.5 h-3.5 text-slate-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 ? (
        <span className="text-xs text-slate-500 font-medium">{rating.toFixed(1)} ({count})</span>
      ) : (
        <span className="text-xs text-slate-400 font-medium">No reviews yet</span>
      )}
    </div>
  );
};

const FindDoctors = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors]               = useState([]);
  const [ratings, setRatings]               = useState({});   // { [doctorId]: { avg, count } }
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm]         = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('');
  const [minRating, setMinRating]           = useState('');   // '', '4', '4.5', '5'
  const [sortBy, setSortBy]                 = useState('');   // '', 'rating', 'name'

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  // ── Fetch doctors then fetch reviews in parallel ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_BASE}/View_Doctor`);
        if (!res.data.success) { setError('Failed to load doctor list.'); return; }

        const docs = res.data.data;
        setDoctors(docs);

        // Fetch reviews for all doctors in parallel
        const reviewResults = await Promise.allSettled(
          docs.map((d) =>
            axios.get(`${API_BASE}/review/doctor/${d._id}`)
              .then((r) => {
                const reviews = r.data?.data || [];
                const count   = reviews.length;
                const avg     = count > 0
                  ? reviews.reduce((sum, rv) => sum + (rv.rating || 0), 0) / count
                  : 0;
                return { id: d._id, avg, count };
              })
              .catch(() => ({ id: d._id, avg: 0, count: 0 }))
          )
        );

        const ratingMap = {};
        reviewResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { id, avg, count } = result.value;
            ratingMap[id] = { avg, count };
          }
        });
        setRatings(ratingMap);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Filter + sort ──
  const filteredDoctors = doctors
    .filter((doc) => {
      const name = `${doc.first_Name || ''} ${doc.last_Name || ''}`.toLowerCase();
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        doc.speciality?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpeciality = specialityFilter
        ? doc.speciality?.toLowerCase() === specialityFilter.toLowerCase()
        : true;

      const docRating = ratings[doc._id]?.avg || 0;
      const matchesRating =
        minRating === ''     ? true :
        minRating === '4'    ? docRating >= 4 :
        minRating === '4.5'  ? docRating >= 4.5 :
        minRating === '5'    ? docRating >= 5 :
        true;

      return matchesSearch && matchesSpeciality && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (ratings[b._id]?.avg || 0) - (ratings[a._id]?.avg || 0);
      }
      if (sortBy === 'name') {
        const nameA = `${a.first_Name || ''} ${a.last_Name || ''}`.toLowerCase();
        const nameB = `${b.first_Name || ''} ${b.last_Name || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialityFilter('');
    setMinRating('');
    setSortBy('');
  };

  const hasFilters = searchTerm || specialityFilter || minRating || sortBy;

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9]">
        <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <span className="text-lg font-bold text-[#0A2540]">
              Medicare<span className="font-extrabold">AI</span>
            </span>
          </div>
        </nav>
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

  // ── ERROR ──
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00B4A0]/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-[#00B4A0]/10 blur-3xl" />
        </div>
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

          {/* Search bar */}
          <div className="bg-white rounded-xl flex items-center px-4 gap-3 shadow-sm">
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
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-3 flex flex-wrap items-center gap-3">
          {/* Speciality */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Speciality</label>
            <select
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] min-w-[170px]"
            >
              <option value="">All Specialities</option>
              {SPECIALITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-slate-200 hidden sm:block" />

          {/* Min rating */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] min-w-[130px]"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
              <option value="5">5 stars only</option>
            </select>
          </div>

          <div className="w-px h-5 bg-slate-200 hidden sm:block" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] min-w-[160px]"
            >
              <option value="">Default</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#00B4A0] hover:text-teal-600 transition px-3 py-1.5 rounded-lg border border-[#00B4A0]/30 hover:bg-[#00B4A0]/5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── DOCTOR GRID ── */}
      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* Results count */}
        {filteredDoctors.length > 0 && (
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
            <h3 className="text-xl font-bold text-[#0A2540]">No doctors match your filters</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">Try adjusting your search, speciality, or rating filter.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[#0A2540] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => {
              const imgUrl  = getImageUrl(doc.profile_Picture);
              const initials = (doc.first_Name?.charAt(0) || 'D').toUpperCase();
              const docRating = ratings[doc._id] || { avg: 0, count: 0 };

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Avatar top */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 to-transparent pointer-events-none" />
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-[#0A2540] leading-snug">
                      Dr. {doc.first_Name} {doc.last_Name}
                    </h2>

                    {/* Star rating */}
                    <StarDisplay rating={docRating.avg} count={docRating.count} />

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
                      className="mt-5 w-full bg-[#00B4A0] text-white rounded-xl py-2.5 font-bold hover:bg-teal-400 transition text-sm group-hover:shadow-md group-hover:shadow-[#00B4A0]/20"
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
