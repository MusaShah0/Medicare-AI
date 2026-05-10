import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Star rating (interactive) ─────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
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

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ appointment, onClose, onSubmitted }) => {
  const [rating, setRating]         = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const doctor = appointment.doctor_id;

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(
        `${API_BASE}/review`,
        { appointment_id: appointment._id, rating, review: reviewText.trim() },
        { withCredentials: true }
      );
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">

        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-1">Feedback</p>
            <h3 className="text-xl font-bold text-[#0A2540]">Rate your consultation</h3>
            <p className="text-sm text-slate-400 mt-1">
              Dr. {doctor?.first_Name} {doctor?.last_Name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition flex-shrink-0 ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-6 bg-slate-50 rounded-2xl p-5">
          <StarRating value={rating} onChange={setRating} />
          <span className="text-sm text-slate-400 font-medium mt-1">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Tap to rate'}
          </span>
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience (optional)..."
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4A0] resize-none transition"
        />
        <div className="text-right text-xs text-slate-300 mt-1 mb-4">{reviewText.length}/1000</div>

        {error && <p className="text-sm text-red-500 font-medium mb-4">{error}</p>}

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
            className="flex-1 py-3 rounded-xl bg-[#00B4A0] hover:bg-teal-400 text-white font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
const CancelModal = ({ appointment, onClose, onConfirm, loading }) => {
  const doctor = appointment?.doctor_id;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { if (!loading) onClose(); }} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 z-10">
        {/* Icon */}
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#0A2540] text-center mb-2">Cancel Appointment?</h3>
        <p className="text-sm text-slate-500 text-center mb-1">
          {doctor ? `Dr. ${doctor.first_Name} ${doctor.last_Name}` : 'This appointment'} will be cancelled.
        </p>
        <p className="text-xs text-slate-400 text-center mb-7">This action cannot be undone.</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm disabled:opacity-50"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold border border-white/10 transition-all duration-300
          ${t.type === 'error' ? 'bg-red-600' : 'bg-[#0A2540]'}`}
      >
        {t.type === 'error' ? (
          <svg className="w-4 h-4 flex-shrink-0 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4 flex-shrink-0 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {t.message}
      </div>
    ))}
  </div>
);

// ── Status badge styles ───────────────────────────────────────────────────────
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'booked':    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'ongoing':   return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
    default:          return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

const getStatusDot = (status) => {
  switch (status?.toLowerCase()) {
    case 'booked':    return 'bg-emerald-400';
    case 'ongoing':   return 'bg-blue-400 animate-pulse';
    case 'cancelled': return 'bg-rose-400';
    case 'completed': return 'bg-slate-400';
    default:          return 'bg-slate-300';
  }
};

// ── Status filter config ──────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'booked',    label: 'Upcoming' },
  { key: 'ongoing',   label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments]   = useState([]);
  const [statusFilter, setStatusFilter]   = useState('all');
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [now, setNow]                     = useState(new Date());
  const [reviewedIds, setReviewedIds]     = useState(new Set());
  const [activeReview, setActiveReview]   = useState(null);

  // Cancel state
  const [cancelTarget, setCancelTarget]   = useState(null);   // appointment to cancel
  const [cancelLoading, setCancelLoading] = useState(false);

  // Toast state
  const [toasts, setToasts]               = useState([]);

  // Reschedule token state
  const [redeemTarget, setRedeemTarget]             = useState(null);
  const [redeemSlots, setRedeemSlots]               = useState({});
  const [redeemLoading, setRedeemLoading]           = useState(false);
  const [redeemExpandedDate, setRedeemExpandedDate] = useState(null);
  const [redeemSelectedSlot, setRedeemSelectedSlot] = useState(null);
  const [redeemMsg, setRedeemMsg]                   = useState(null);

  // Notes state
  const [notesInfo, setNotesInfo]         = useState({});
  const [notesLoading, setNotesLoading]   = useState({});
  const [newlyReady, setNewlyReady]       = useState(new Set());
  const [processingToast, setProcessingToast] = useState(false);

  // ── Toast helper ──
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Live clock — ticks every 30s
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  // ── HELPERS ──
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

  // ── NOTES CHECK ──
  const checkNotes = async (appointmentId, { silent = false } = {}) => {
    if (!silent) setNotesLoading((prev) => ({ ...prev, [appointmentId]: true }));
    try {
      const res = await axios.get(`${API_BASE}/appointments/${appointmentId}/notes`, {
        withCredentials: true,
      });
      const incoming = res.data;
      setNotesInfo((prev) => {
        const previous = prev[appointmentId];
        if (incoming.status === 'complete' && previous?.status !== 'complete') {
          setNewlyReady((r) => new Set([...r, appointmentId]));
          setProcessingToast(false);
          setTimeout(() => setNewlyReady((r) => { const n = new Set(r); n.delete(appointmentId); return n; }), 6000);
        }
        return { ...prev, [appointmentId]: incoming };
      });
      return incoming.status;
    } catch (err) {
      console.error('[Notes] Status check failed:', err.response?.data || err.message);
      setNotesInfo((prev) => ({ ...prev, [appointmentId]: { status: 'failed' } }));
      return 'failed';
    } finally {
      if (!silent) setNotesLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  // ── FETCH APPOINTMENTS ──
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/My_Appointments`, { withCredentials: true });
      if (res.data.status === 1) {
        const appts = res.data.data;
        setAppointments(appts);

        const completedIds = appts.filter((a) => a.status === 'completed').map((a) => a._id);

        if (completedIds.length > 0) {
          const checks = await Promise.all(
            completedIds.map((id) =>
              axios.get(`${API_BASE}/review/check/${id}`, { withCredentials: true })
                .then((r) => r.data.reviewed ? id : null)
                .catch(() => null)
            )
          );
          setReviewedIds(new Set(checks.filter(Boolean)));

          const statuses = await Promise.all(completedIds.map((id) => checkNotes(id)));
          if (statuses.some((s) => s === 'processing')) {
            setProcessingToast(true);
          }
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
  }, []);

  useEffect(() => {
    fetchAppointments();
    window.addEventListener('focus', fetchAppointments);
    return () => window.removeEventListener('focus', fetchAppointments);
  }, [fetchAppointments]);

  // Poll every 10s for processing notes
  useEffect(() => {
    const processingIds = Object.entries(notesInfo)
      .filter(([, v]) => v.status === 'processing')
      .map(([id]) => id);
    if (processingIds.length === 0) return;
    const interval = setInterval(() => {
      processingIds.forEach((id) => checkNotes(id, { silent: true }));
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesInfo]);

  const handleReviewSubmitted = (appointmentId) => {
    setReviewedIds((prev) => new Set([...prev, appointmentId]));
    setActiveReview(null);
  };

  // ── CANCEL APPOINTMENT ──
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await axios.post(
        `${API_BASE}/cancel-appointment/${cancelTarget._id}`,
        {},
        { withCredentials: true }
      );
      // Optimistic update — remove from list
      setAppointments((prev) => prev.filter((a) => a._id !== cancelTarget._id));
      setCancelTarget(null);
      showToast('Appointment cancelled', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel appointment.';
      showToast(msg, 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  // ── REDEEM MODAL ──
  const openRedeemModal = async (appointment) => {
    setRedeemTarget(appointment);
    setRedeemSlots({});
    setRedeemSelectedSlot(null);
    setRedeemExpandedDate(null);
    setRedeemMsg(null);
    setRedeemLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/Show_Appoitment_Sechdule/${appointment.doctor_id?._id || appointment.doctor_id}`
      );
      if (res.data.status === 1) {
        setRedeemSlots(res.data.data);
        const firstDate = Object.keys(res.data.data).sort()[0];
        if (firstDate) setRedeemExpandedDate(firstDate);
      }
    } catch {
      setRedeemMsg({ type: 'error', text: 'Could not load available slots. Please try again.' });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleRedeemReschedule = async () => {
    if (!redeemTarget || !redeemSelectedSlot) return;
    setRedeemLoading(true);
    setRedeemMsg(null);
    try {
      const res = await axios.post(
        `${API_BASE}/Redeem_Reschedule/${redeemTarget._id}/${redeemSelectedSlot._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setRedeemMsg({ type: 'success', text: 'Appointment rescheduled successfully! No payment required.' });
        setTimeout(() => {
          setRedeemTarget(null);
          setRedeemSelectedSlot(null);
          fetchAppointments();
        }, 1800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to redeem. Please try again.';
      setRedeemMsg({ type: 'error', text: msg });
    } finally {
      setRedeemLoading(false);
    }
  };

  const fmtSlotTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9]">
        <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
            <span className="text-lg font-bold text-[#0A2540]">Medicare<span className="font-extrabold">AI</span></span>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="h-5 w-40 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
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
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-sm">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold mb-4">{error}</p>
          <Link to="/patient/login" className="px-6 py-2.5 bg-[#0A2540] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans text-slate-800">

      {/* ── TOAST NOTIFICATIONS ── */}
      <Toast toasts={toasts} />

      {/* ── PROCESSING TOAST ── */}
      {processingToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0A2540] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-sm w-full mx-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00B4A0]/20 flex items-center justify-center">
            <svg className="animate-spin w-4 h-4 text-[#00B4A0]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Generating your meeting notes</p>
            <p className="text-xs text-white/50 mt-0.5">Takes a few minutes. We'll highlight the download when ready.</p>
          </div>
          <button
            onClick={() => setProcessingToast(false)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-[#0A2540]">
              Medicare<span className="font-extrabold">AI</span>
            </span>
            <span className="text-base font-semibold text-slate-400 hidden sm:block">My Appointments</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell role="patient" />
            <Link
              to="/doctors"
              className="bg-[#00B4A0] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-400 transition"
            >
              + Book New
            </Link>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── STATUS FILTER BAR ── */}
        {appointments.length > 0 && (
          <div className="flex items-center gap-2 mb-7 flex-wrap">
            {STATUS_FILTERS.map(({ key, label }) => {
              const count = key === 'all'
                ? appointments.length
                : appointments.filter(a => a.status === key).length;
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    active
                      ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {label}
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {(() => {
          const filtered = statusFilter === 'all'
            ? appointments
            : appointments.filter(a => a.status === statusFilter);

          return appointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0A2540]">No Appointments Yet</h3>
            <p className="text-slate-500 mt-2 mb-6 text-sm">Book your first appointment to see it here.</p>
            <Link to="/doctors" className="inline-block px-6 py-2.5 bg-[#00B4A0] text-white rounded-xl font-bold text-sm hover:bg-teal-400 transition">
              Find a Doctor
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0A2540]">No {STATUS_FILTERS.find(f => f.key === statusFilter)?.label} Appointments</h3>
            <p className="text-slate-400 text-sm mt-2">Try selecting a different filter.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => {
              const doctor         = app.doctor_id;
              const slot           = app.sechdule_Id;
              const alreadyReviewed = reviewedIds.has(app._id);
              const joinable       = (app.status === 'booked' || app.status === 'ongoing') && isJoinable(slot);
              const initials       = (doctor?.first_Name?.charAt(0) || 'D').toUpperCase();
              const isBooked       = app.status === 'booked';

              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Accent bar */}
                  <div className={`h-1 w-full ${
                    app.status === 'booked'    ? 'bg-emerald-400' :
                    app.status === 'ongoing'   ? 'bg-blue-400' :
                    app.status === 'cancelled' ? 'bg-rose-400' :
                    'bg-slate-200'
                  }`} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Avatar + Status badge row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#0A2540] flex items-center justify-center text-white font-extrabold text-2xl uppercase shadow-sm">
                        {initials}
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(app.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(app.status)}`} />
                        {app.status}
                      </span>
                    </div>

                    {/* Doctor info */}
                    <div className="mb-5">
                      <h2 className="text-lg font-bold text-[#0A2540] leading-snug">
                        Dr. {doctor?.first_Name || 'Unknown'} {doctor?.last_Name || ''}
                      </h2>
                      <p className="text-sm text-slate-400 font-medium mt-0.5">{doctor?.speciality || 'Specialist'}</p>
                    </div>

                    {/* Date / time info block */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Date
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          {slot?.date
                            ? new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Time
                        </span>
                        <span className="text-sm font-bold text-slate-700">{formatTime(slot?.startTime)}</span>
                      </div>
                    </div>

                    {/* Action footer */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-300 font-mono">#{app._id.slice(-6).toUpperCase()}</span>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* Cancel button — only for booked appointments */}
                        {isBooked && (
                          <button
                            onClick={() => setCancelTarget(app)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={{
                              border: '1px solid #DC2626',
                              color: '#DC2626',
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            Cancel
                          </button>
                        )}

                        {/* Join call */}
                        {joinable ? (
                          <Link
                            to={`/room/${app.meeting_id}`}
                            className="relative flex items-center gap-1.5 bg-[#00B4A0] hover:bg-teal-400 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-md shadow-[#00B4A0]/30 transition-all"
                          >
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Call
                          </Link>

                        ) : isBooked ? (
                          <span className="text-xs text-slate-400 font-medium">
                            {slot?.startTime ? `Starts at ${formatTime(slot.startTime)}` : 'Upcoming'}
                          </span>

                        ) : app.status === 'ongoing' ? (
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
                              className="text-sm font-bold text-[#00B4A0] hover:text-teal-400 flex items-center gap-1.5 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Leave a Review
                            </button>
                          )

                        ) : app.status === 'cancelled' && app.is_rescheduled_token ? (
                          <button
                            onClick={() => openRedeemModal(app)}
                            className="flex items-center gap-1.5 bg-[#00B4A0]/10 hover:bg-[#00B4A0]/20 text-[#00B4A0] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#00B4A0]/20 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Rebook Free
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium capitalize">{app.status}</span>
                        )}
                      </div>
                    </div>

                    {/* Notes download */}
                    {app.status === 'completed' && notesInfo[app._id]?.status === 'complete' && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a
                          href={`${API_BASE}${notesInfo[app._id].download_url}`}
                          download
                          className={`text-sm font-semibold flex items-center gap-2 transition-all duration-500 px-3 py-2.5 rounded-xl w-full justify-center
                            ${newlyReady.has(app._id)
                              ? 'bg-[#00B4A0] text-white shadow-lg shadow-[#00B4A0]/30 scale-105 animate-pulse'
                              : 'bg-[#00B4A0]/10 text-[#00B4A0] hover:bg-[#00B4A0]/20 border border-[#00B4A0]/20'
                            }`}
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {newlyReady.has(app._id) ? 'Meeting Notes Ready — Download PDF' : 'Download Meeting Notes (PDF)'}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
        })()}
      </main>

      {/* ── REVIEW MODAL ── */}
      {activeReview && (
        <ReviewModal
          appointment={activeReview}
          onClose={() => setActiveReview(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {/* ── CANCEL CONFIRM MODAL ── */}
      {cancelTarget && (
        <CancelModal
          appointment={cancelTarget}
          onClose={() => { if (!cancelLoading) setCancelTarget(null); }}
          onConfirm={handleCancelConfirm}
          loading={cancelLoading}
        />
      )}

      {/* ── RESCHEDULE TOKEN MODAL ── */}
      {redeemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => { if (!redeemLoading) { setRedeemTarget(null); setRedeemMsg(null); } }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-1">Free Reschedule</p>
              <h3 className="text-xl font-bold text-[#0A2540]">Rebook for Free</h3>
              <p className="text-slate-500 text-sm mt-2">
                Your doctor rescheduled your appointment. Pick any available slot from{' '}
                <span className="font-semibold text-[#0A2540]">
                  Dr. {redeemTarget.doctor_id?.first_Name} {redeemTarget.doctor_id?.last_Name}
                </span>
                {' '}— no payment needed.
              </p>
            </div>

            {redeemMsg && (
              <div className={`mb-5 p-3 rounded-xl text-sm font-medium text-center border ${
                redeemMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {redeemMsg.text}
              </div>
            )}

            {redeemLoading && !redeemMsg ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-4 border-[#00B4A0]/20 border-t-[#00B4A0] rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading available slots...</p>
              </div>
            ) : Object.keys(redeemSlots).length === 0 && !redeemMsg ? (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="font-semibold">No available slots right now.</p>
                <p className="text-sm mt-1">Check back later or contact the doctor.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {Object.keys(redeemSlots).sort().map((dateKey) => {
                  const isOpen = redeemExpandedDate === dateKey;
                  const slots  = redeemSlots[dateKey];
                  return (
                    <div
                      key={dateKey}
                      className={`border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-[#00B4A0]/40' : 'border-slate-200'}`}
                    >
                      <button
                        onClick={() => setRedeemExpandedDate(isOpen ? null : dateKey)}
                        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${isOpen ? 'bg-[#00B4A0]/5' : 'bg-slate-50 hover:bg-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOpen ? 'bg-[#00B4A0]' : 'bg-slate-300'}`} />
                          <div>
                            <p className="font-bold text-[#0A2540] text-sm">
                              {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {slots.length} slot{slots.length !== 1 ? 's' : ''} · <span className="text-emerald-600 font-semibold">Free</span>
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#00B4A0]' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white">
                          {slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot) => {
                            const isSelected = redeemSelectedSlot?._id === slot._id;
                            return (
                              <button
                                key={slot._id}
                                onClick={() => setRedeemSelectedSlot({ ...slot, _dateKey: dateKey })}
                                className={`py-2.5 px-2 rounded-xl border text-sm font-semibold transition-all ${
                                  isSelected
                                    ? 'border-[#00B4A0] bg-[#00B4A0]/10 text-[#00B4A0] shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-[#00B4A0] hover:bg-[#00B4A0]/5 hover:text-[#00B4A0] text-slate-600'
                                }`}
                              >
                                {fmtSlotTime(slot.startTime)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {redeemSelectedSlot && (
              <div className="bg-[#00B4A0]/5 border border-[#00B4A0]/20 rounded-2xl p-4 mb-6 text-sm space-y-2">
                <p className="font-bold text-[#0A2540] mb-2">Selected Slot</p>
                <div className="flex justify-between text-slate-600">
                  <span>Date</span>
                  <span className="font-semibold text-[#0A2540]">
                    {new Date(redeemSelectedSlot._dateKey + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time</span>
                  <span className="font-semibold text-[#0A2540]">{fmtSlotTime(redeemSelectedSlot.startTime)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setRedeemTarget(null); setRedeemMsg(null); setRedeemSelectedSlot(null); }}
                disabled={redeemLoading}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={handleRedeemReschedule}
                disabled={!redeemSelectedSlot || redeemLoading || redeemMsg?.type === 'success'}
                className="flex-1 py-3 rounded-xl bg-[#00B4A0] hover:bg-teal-400 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {redeemLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                Confirm Rebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
