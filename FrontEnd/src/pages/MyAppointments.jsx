import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// ── Star rating component ─────────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <svg
          className={`w-8 h-8 ${star <= value ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
  </div>
);

// ── Review modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ appointment, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const doctor = appointment.doctor_id;

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await axios.post('http://localhost:4000/review', {
        appointment_id: appointment._id,
        rating,
        review: reviewText.trim()
      }, { withCredentials: true });
      onSubmitted(appointment._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Rate your consultation</h3>
            <p className="text-sm text-slate-400 mt-1">
              Dr. {doctor?.first_Name} {doctor?.last_Name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <StarRating value={rating} onChange={setRating} />
          <span className="text-sm text-slate-400 font-medium">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Tap to rate'}
          </span>
        </div>

        {/* Text */}
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Share your experience (optional)..."
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition"
        />
        <div className="text-right text-xs text-slate-300 mt-1 mb-4">{reviewText.length}/1000</div>

        {error && (
          <p className="text-sm text-red-500 font-medium mb-4">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const [reviewedIds, setReviewedIds] = useState(new Set()); // appointment _ids already reviewed
  const [activeReview, setActiveReview] = useState(null);   // appointment object to review

  // Live clock — ticks every 30s
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  // --- HELPERS ---
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [h, m] = timeString.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

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

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked':    return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
      case 'ongoing':   return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/20';
      case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';
      default:          return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/20';
    }
  };

  // --- DATA FETCHING ---
  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:4000/My_Appointments', { withCredentials: true });
      if (res.data.status === 1) {
        const appts = res.data.data;
        setAppointments(appts);

        // Check which completed appointments already have a review
        const completedIds = appts
          .filter(a => a.status === 'completed')
          .map(a => a._id);

        if (completedIds.length > 0) {
          const checks = await Promise.all(
            completedIds.map(id =>
              axios.get(`http://localhost:4000/review/check/${id}`, { withCredentials: true })
                .then(r => r.data.reviewed ? id : null)
                .catch(() => null)
            )
          );
          setReviewedIds(new Set(checks.filter(Boolean)));
        }
      } else {
        setAppointments([]);
      }
    } catch (err) {
      if (err.response?.status === 401) setError('Please log in to view appointments.');
      else setAppointments([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchAppointments();
    window.addEventListener('focus', fetchAppointments);
    return () => window.removeEventListener('focus', fetchAppointments);
  }, []);

  // Called when a review is successfully submitted
  const handleReviewSubmitted = (appointmentId) => {
    setReviewedIds(prev => new Set([...prev, appointmentId]));
    setActiveReview(null);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

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
              const slot   = app.sechdule_Id;
              const alreadyReviewed = reviewedIds.has(app._id);

              return (
                <div key={app._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">

                  {/* Status & Avatar */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-2xl uppercase">
                      {doctor?.first_Name ? doctor.first_Name.charAt(0) : 'D'}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ring-1 ring-inset ${getStatusStyles(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Dr. {doctor?.first_Name || 'Unknown'} {doctor?.last_Name || ''}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">{doctor?.speciality || 'Specialist'}</p>
                  </div>

                  {/* Time Info */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Date</span>
                      <span className="text-sm font-bold text-slate-700">
                        {slot?.date
                          ? new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Time</span>
                      <span className="text-sm font-bold text-slate-700">{formatTime(slot?.startTime)}</span>
                    </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-300">ID: {app._id.slice(-6).toUpperCase()}</span>

                    {/* Active slot — join button */}
                    {(app.status === 'booked' || app.status === 'ongoing') && isJoinable(slot) ? (
                      <Link
                        to={`/room/${app.meeting_id}`}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Join Call
                      </Link>

                    ) : (app.status === 'booked' || app.status === 'ongoing') ? (
                      <span className="text-xs text-slate-400 font-medium">
                        {slot?.startTime ? `Starts at ${formatTime(slot.startTime)}` : 'Upcoming'}
                      </span>

                    ) : app.status === 'completed' ? (
                      alreadyReviewed ? (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveReview(app)}
                          className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Leave a Review
                        </button>
                      )

                    ) : (
                      <span className="text-slate-400 text-sm font-medium capitalize">{app.status}</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {activeReview && (
        <ReviewModal
          appointment={activeReview}
          onClose={() => setActiveReview(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default MyAppointments;
