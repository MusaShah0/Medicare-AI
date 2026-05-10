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
    if (!path || path === 'default-doctor.png') return null;
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${API_BASE}${path}`;
    return `${API_BASE}/pictures/${path}`;
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
                <div className="h-1.5 bg-slate-100 animate-pulse" />
                <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-36 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-3.5 w-24 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-3 w-28 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="mx-6 border-t border-slate-100" />
                <div className="px-6 py-3.5 flex gap-2">
                  <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="mx-6 mb-5 grid grid-cols-2 gap-3">
                  <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="px-6 pb-6">
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
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
              const imgUrl    = getImageUrl(doc.profile_Picture);
              const initials  = `${doc.first_Name?.charAt(0) || ''}${doc.last_Name?.charAt(0) || ''}`.toUpperCase() || 'DR';
              const docRating = ratings[doc._id] || { avg: 0, count: 0 };
              const degrees   = Array.isArray(doc.degrees) ? doc.degrees : (doc.degrees ? [doc.degrees] : []);

              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden"
                >
                  {/* ── Teal accent bar ── */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#00B4A0] to-[#0A8A7A]" />

                  {/* ── Header: avatar + name block ── */}
                  <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#0e3460] flex items-center justify-center shadow-md">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Dr. ${doc.first_Name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.initials-fallback').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="initials-fallback w-full h-full items-center justify-center"
                          style={{ display: imgUrl ? 'none' : 'flex' }}
                        >
                          <span className="text-white text-2xl font-extrabold tracking-tight">{initials}</span>
                        </div>
                      </div>
                      {/* Verified badge */}
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#00B4A0] border-2 border-white flex items-center justify-center shadow-sm"
                           title="Verified Doctor">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Name + speciality + rating */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-extrabold text-[#0A2540] leading-tight truncate">
                        Dr. {doc.first_Name} {doc.last_Name}
                      </h2>
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[#00B4A0]/10 text-[#007A6E] text-xs font-bold">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {doc.speciality}
                      </span>

                      {/* Stars */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(docRating.avg) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {docRating.count > 0 ? (
                          <span className="text-xs font-semibold text-slate-500">{docRating.avg.toFixed(1)} <span className="font-normal text-slate-400">({docRating.count})</span></span>
                        ) : (
                          <span className="text-xs text-slate-400">No reviews yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="mx-6 border-t border-slate-100" />

                  {/* ── Qualifications ── */}
                  {degrees.length > 0 && (
                    <div className="px-6 py-3.5 flex items-start gap-3">
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <div className="flex flex-wrap gap-1.5">
                        {degrees.map((deg, i) => (
                          <span key={i} className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {deg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Stats row ── */}
                  <div className="mx-6 mb-5 grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium leading-none mb-0.5">Completed</p>
                        <p className="text-sm font-extrabold text-[#0A2540]">{doc.completed_appointments ?? 0}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium leading-none mb-0.5">Rating</p>
                        <p className="text-sm font-extrabold text-[#0A2540]">
                          {docRating.count > 0 ? docRating.avg.toFixed(1) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Book button ── */}
                  <div className="px-6 pb-6 mt-auto">
                    <button
                      onClick={() => navigate(`/book-appointment/${doc._id}`, { state: { doctor: doc } })}
                      className="w-full flex items-center justify-center gap-2 bg-[#0A2540] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#00B4A0] transition-all duration-200 group-hover:shadow-lg group-hover:shadow-[#00B4A0]/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
