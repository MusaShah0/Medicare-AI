import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PLACEHOLDER_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect fill='%23e2e8f0' width='150' height='150'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='16' dy='5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EDoctor%3C/text%3E%3C/svg%3E";

// "14:30" → "2:30 PM"
const formatTime = (t) => {
  if (!t) return 'N/A';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// "2025-07-14" → "Mon, Jul 14, 2025"
const formatDateLabel = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

// Star display (read-only)
const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const BookAppointment = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = location.state?.doctor;

  // grouped: { "2025-07-14": [{_id, startTime, endTime, clinic_fee, slotDuration}] }
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Doctor profile stats + reviews
  const [profile, setProfile] = useState(null);

  const getImageUrl = (path) =>
    !path ? PLACEHOLDER_IMG
    : (path.startsWith('data:') || path.startsWith('http')) ? path
    : `http://localhost:4000/pictures/${path}`;

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/Show_Appoitment_Sechdule/${id}`);
      if (res.data.status === 1) {
        setGrouped(res.data.data);
        const firstDate = Object.keys(res.data.data).sort()[0];
        if (firstDate) setExpandedDate(firstDate);
      }
    } catch (err) {
      if (err.response?.status !== 404) setError('Unable to load appointment slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchSlots();
    // Fetch doctor profile (completed count + last 5 reviews)
    axios.get(`http://localhost:4000/doctor/profile/${id}`)
      .then(res => { if (res.data.success) setProfile(res.data); })
      .catch(() => {}); // non-critical, fail silently
  }, [id]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    setBookingError(null);
    try {
      const response = await axios.post(
        `http://localhost:4000/Book_Appointment/${selectedSlot._id}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setGrouped(prev => {
          const updated = { ...prev };
          updated[selectedSlot._dateKey] = updated[selectedSlot._dateKey].filter(
            s => s._id !== selectedSlot._id
          );
          if (updated[selectedSlot._dateKey].length === 0) delete updated[selectedSlot._dateKey];
          return updated;
        });
        setSelectedSlot(null);
        setTimeout(() => navigate('/my-appointments'), 1500);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) { navigate('/patient/login'); return; }
      if (status === 409) {
        setBookingError({ type: 'conflict', slotId: selectedSlot._id });
      } else if (status === 400) {
        setBookingError({ type: 'unavailable', slotId: selectedSlot._id });
        setSelectedSlot(null);
        setLoading(true);
        fetchSlots();
      } else {
        setBookingError({ type: 'generic', slotId: selectedSlot._id });
      }
    } finally {
      setIsBooking(false);
    }
  };

  const sortedDates = Object.keys(grouped).sort();
  const hasSlots = sortedDates.length > 0;

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
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header Banner */}
      <div className="h-56 bg-teal-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-30 -ml-10 -mb-10" />
        <div className="relative z-10 max-w-6xl mx-auto p-6">
          <button onClick={() => navigate(-1)} className="text-teal-100 hover:text-white flex items-center gap-2 transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 -mt-28 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Doctor Card + Stats + Reviews ── */}
          <div className="md:col-span-1 flex flex-col gap-5">

            {/* Doctor info card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-slate-100">
              <img
                src={getImageUrl(doctor.profile_Picture)}
                alt={doctor.first_Name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg -mt-16 bg-white"
                onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
              />
              <div className="mt-4">
                <h1 className="text-xl font-bold text-slate-800">Dr. {doctor.first_Name} {doctor.last_Name}</h1>
                <p className="text-teal-600 font-semibold uppercase tracking-wide text-sm mt-1">{doctor.speciality}</p>
              </div>

              {/* Stats row */}
              <div className="w-full mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-extrabold text-slate-800">
                    {profile ? profile.completed_appointments : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-tight mt-0.5">Completed</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-800">
                    {profile?.avg_rating ? profile.avg_rating : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-tight mt-0.5">Avg Rating</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-800">
                    {profile ? profile.total_reviews : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-tight mt-0.5">Reviews</p>
                </div>
              </div>

              <div className="w-full mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Speciality</span>
                  <span className="font-bold text-slate-800">{doctor.speciality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Dates</span>
                  <span className="font-bold text-teal-600">{sortedDates.length}</span>
                </div>
              </div>
            </div>

            {/* Reviews section */}
            {profile && profile.reviews && profile.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Patient Reviews
                </h3>
                <div className="space-y-4">
                  {profile.reviews.map(r => (
                    <div key={r._id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-700">
                          {r.patient_id?.first_Name} {r.patient_id?.last_Name}
                        </span>
                        <Stars rating={r.rating} />
                      </div>
                      {r.review && (
                        <p className="text-xs text-slate-500 leading-relaxed">{r.review}</p>
                      )}
                      <p className="text-[10px] text-slate-300 mt-1">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No reviews yet */}
            {profile && profile.reviews && profile.reviews.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
                <p className="text-slate-400 text-sm">No reviews yet for this doctor.</p>
              </div>
            )}
          </div>

          {/* ── Slots Panel ── */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 min-h-[480px]">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">📅</span> Available Slots
                </h2>
                <p className="text-slate-400 text-sm mt-1 ml-9">Select a date, then pick a time slot.</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                  <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                  Loading schedule...
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">{error}</div>
              ) : !hasSlots ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No slots available right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedDates.map(dateKey => {
                    const isOpen = expandedDate === dateKey;
                    const slots = grouped[dateKey];
                    const fee = slots[0]?.clinic_fee || 0;

                    return (
                      <div key={dateKey} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedDate(isOpen ? null : dateKey)}
                          className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-teal-500' : 'bg-slate-300'}`} />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{formatDateLabel(dateKey)}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{slots.length} slot{slots.length !== 1 ? 's' : ''} · Fee: ${fee}</p>
                            </div>
                          </div>
                          <svg
                            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {slots
                              .sort((a, b) => a.startTime.localeCompare(b.startTime))
                              .map(slot => (
                                <button
                                  key={slot._id}
                                  onClick={() => setSelectedSlot({ ...slot, _dateKey: dateKey })}
                                  className="py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 hover:shadow-sm transition-all text-sm font-medium text-slate-600"
                                >
                                  {formatTime(slot.startTime)}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setSelectedSlot(null); setBookingError(null); }} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗓️</div>
              <h3 className="text-2xl font-bold text-slate-800">Confirm Booking</h3>
              <p className="text-slate-500 mt-2">You are about to book an appointment.</p>
            </div>

            {bookingError && (
              <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">
                  {bookingError.type === 'conflict'
                    ? 'You already have an appointment that overlaps with this time slot on this date. Please choose a different time.'
                    : bookingError.type === 'unavailable'
                    ? 'This slot was just taken. Please select another available time.'
                    : 'Booking failed. Please try again.'}
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">Doctor</span>
                <span className="font-semibold text-slate-800">Dr. {doctor.first_Name} {doctor.last_Name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">Date</span>
                <span className="font-semibold text-slate-800">{formatDateLabel(selectedSlot._dateKey)}</span>
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

            {bookingError === null && isBooking === false && selectedSlot && (
              <div className="flex gap-4">
                <button
                  onClick={() => { setSelectedSlot(null); setBookingError(null); }}
                  disabled={isBooking}
                  className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={isBooking || bookingError?.type === 'conflict'}
                  className="flex-1 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex justify-center items-center"
                >
                  Confirm Booking
                </button>
              </div>
            )}

            {isBooking && (
              <div className="flex justify-center py-2">
                <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

            {bookingError && (
              <button
                onClick={() => { setSelectedSlot(null); setBookingError(null); }}
                className="w-full mt-2 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition text-sm"
              >
                {bookingError.type === 'conflict' ? 'Choose a Different Time' : 'Close'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
