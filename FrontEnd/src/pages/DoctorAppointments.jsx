import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const emptyMedicine = () => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });

const STATUS_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'booked',    label: 'Upcoming' },
  { key: 'ongoing',   label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState(null);

  // History modal state
  const [historyModal, setHistoryModal] = useState(null); // { patientId, patientName }
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState('appointments');

  // Prescription modal state
  const [prescriptionModal, setPrescriptionModal] = useState(null); // { appointmentId, patientName }
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicines: [emptyMedicine()],
    advice: '',
    follow_up_date: '',
    vital_signs: { blood_pressure: '', temperature: '', pulse: '', weight: '' },
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);
  const [prescriptionToast, setPrescriptionToast] = useState(false);

  // Live clock — ticks every 30s so isJoinable stays accurate
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [h, m] = timeString.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Returns true only if slot is today AND current time is within [startTime-5min, endTime)
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

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/Doctor_Appointments`, { withCredentials: true });
        if (res.data.status === 1) {
          setAppointments(res.data.data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in as a doctor.');
        } else {
          setAppointments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    window.addEventListener('focus', fetchAppointments);
    return () => window.removeEventListener('focus', fetchAppointments);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':    return 'text-[#00B4A0] bg-[#00B4A0]/10 border border-[#00B4A0]/20';
      case 'ongoing':   return 'text-amber-700 bg-amber-100 border border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border border-red-200';
      default:          return 'text-slate-500 bg-slate-100 border border-slate-200';
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget) return;
    setRescheduleLoading(true);
    setRescheduleMsg(null);
    try {
      const res = await axios.post(
        `${API_BASE}/Reschedule_Appointment/${rescheduleTarget._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setRescheduleMsg({ type: 'success', text: 'Appointment cancelled. The patient has been issued a free rebook token.' });
        setTimeout(() => {
          setAppointments(prev => prev.filter(a => a._id !== rescheduleTarget._id));
          setRescheduleTarget(null);
          setRescheduleMsg(null);
        }, 2000);
      }
    } catch (err) {
      setRescheduleMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reschedule. Please try again.' });
    } finally {
      setRescheduleLoading(false);
    }
  };

  // ── History Modal ────────────────────────────────────────────────────────────
  const openHistoryModal = async (patientId, patientName) => {
    setHistoryModal({ patientId, patientName });
    setHistoryData(null);
    setHistoryTab('appointments');
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/patient-history/${patientId}`, { withCredentials: true });
      if (res.data.success) {
        setHistoryData(res.data.data);
      } else {
        setHistoryData({ appointments: [], prescriptions: [] });
      }
    } catch {
      setHistoryData({ appointments: [], prescriptions: [] });
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModal(null);
    setHistoryData(null);
  };

  // ── Prescription Modal ────────────────────────────────────────────────────────
  const openPrescriptionModal = async (appointmentId, patientName) => {
    setPrescriptionModal({ appointmentId, patientName });
    setPrescriptionLoading(true);
    setPrescriptionData({
      diagnosis: '',
      medicines: [emptyMedicine()],
      advice: '',
      follow_up_date: '',
      vital_signs: { blood_pressure: '', temperature: '', pulse: '', weight: '' },
    });
    try {
      const res = await axios.get(`${API_BASE}/prescription/${appointmentId}`, { withCredentials: true });
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setPrescriptionData({
          diagnosis: d.diagnosis || '',
          medicines: d.medicines?.length ? d.medicines : [emptyMedicine()],
          advice: d.advice || '',
          follow_up_date: d.follow_up_date ? d.follow_up_date.slice(0, 10) : '',
          vital_signs: {
            blood_pressure: d.vital_signs?.blood_pressure || '',
            temperature: d.vital_signs?.temperature || '',
            pulse: d.vital_signs?.pulse || '',
            weight: d.vital_signs?.weight || '',
          },
        });
      }
    } catch {
      // no existing prescription — defaults already set
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const closePrescriptionModal = () => {
    setPrescriptionModal(null);
  };

  const handleMedicineChange = (index, field, value) => {
    setPrescriptionData(prev => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const addMedicine = () => {
    setPrescriptionData(prev => ({ ...prev, medicines: [...prev.medicines, emptyMedicine()] }));
  };

  const removeMedicine = (index) => {
    setPrescriptionData(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== index) }));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionModal) return;
    setPrescriptionSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/prescription/${prescriptionModal.appointmentId}`,
        prescriptionData,
        { withCredentials: true }
      );
      setPrescriptionToast(true);
      setTimeout(() => setPrescriptionToast(false), 3000);
      closePrescriptionModal();
    } catch (err) {
      // silently fail — could add error toast here if needed
    } finally {
      setPrescriptionSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading appointments...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#F4F7F9]">

        {/* Sticky Navbar */}
        <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-[#0A2540] tracking-tight">
                Medi<span className="text-[#00B4A0]">Care</span> AI
              </span>
              <span className="hidden sm:block w-px h-5 bg-slate-200" />
              <span className="hidden sm:block text-sm font-semibold text-slate-400">Appointments</span>
            </div>
            <Link
              to="/doctor-dashboard"
              className="group flex items-center gap-2 text-slate-500 hover:text-[#0A2540] font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </nav>

        {/* Navy Hero Strip */}
        <div className="relative bg-[#0A2540] overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#00B4A0]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#00B4A0]/8 rounded-full blur-2xl translate-y-1/2" />
          <div className="relative max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-2">Doctor Portal</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Appointments</h1>
              <p className="text-white/50 mt-2 text-sm">Manage and join your upcoming patient consultations.</p>
            </div>
            <div className="flex-shrink-0">
              <span className="bg-white/10 border border-white/20 backdrop-blur-sm text-white font-bold px-5 py-2.5 rounded-full text-sm">
                {appointments.length} Total · {appointments.filter(a => a.status === 'booked').length} Upcoming
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-5 py-8">

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

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {appointments.length === 0 && !error ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-[#00B4A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0A2540]">No Appointments Found</h3>
              <p className="text-slate-400 mt-2 text-sm">You don't have any booked appointments yet.</p>
            </div>
          ) : (() => {
            const filtered = statusFilter === 'all'
              ? appointments
              : appointments.filter(a => a.status === statusFilter);

            return filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
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
                const patient = app.patient_id;
                const slot = app.sechdule_Id;
                const joinable = isJoinable(slot);
                const initials = patient?.first_Name?.[0] || '?';

                return (
                  <div
                    key={app._id}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className="p-5 flex items-center gap-4 border-b border-slate-50">
                      <div className="w-12 h-12 rounded-full bg-[#00B4A0]/10 text-[#00B4A0] flex items-center justify-center font-extrabold text-lg border border-[#00B4A0]/20 flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-[#0A2540] leading-tight truncate">
                          {patient ? `${patient.first_Name} ${patient.last_Name}` : 'Unknown Patient'}
                        </h2>
                        <div className="mt-1.5">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full uppercase font-bold tracking-wide ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {slot?.date ? formatDate(slot.date) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00B4A0]/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatTime(slot?.startTime)} &ndash; {formatTime(slot?.endTime)}
                        </span>
                      </div>

                      {/* History + Prescription buttons */}
                      <div className="flex gap-2 pt-1">
                        {/* History — teal outline */}
                        {patient?._id && (
                          <button
                            onClick={() => openHistoryModal(patient._id, `${patient.first_Name} ${patient.last_Name}`)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#00B4A0] text-[#00B4A0] bg-white text-xs font-bold hover:bg-[#00B4A0]/8 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            History
                          </button>
                        )}

                        {/* Prescription — navy filled */}
                        <button
                          onClick={() => openPrescriptionModal(app._id, patient ? `${patient.first_Name} ${patient.last_Name}` : 'Patient')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0A2540] text-white text-xs font-bold hover:bg-[#0d2f4f] transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Prescription
                        </button>
                      </div>
                    </div>

                    {/* Animated accent line */}
                    <div className="h-0.5 w-0 bg-[#00B4A0] group-hover:w-full transition-all duration-500" />

                    {/* Card Footer */}
                    <div className="bg-slate-50/70 px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{app._id.slice(-6).toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Reschedule — only for booked */}
                        {app.status === 'booked' && (
                          <button
                            onClick={() => { setRescheduleTarget(app); setRescheduleMsg(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reschedule
                          </button>
                        )}

                        {/* Join / Upcoming */}
                        {(app.status === 'booked' || app.status === 'ongoing') && joinable ? (
                          <Link
                            to={`/room/${app.meeting_id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4A0] hover:bg-teal-400 text-white text-xs font-bold shadow-sm shadow-teal-200 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Start Consult
                          </Link>
                        ) : (app.status === 'booked' || app.status === 'ongoing') ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {slot?.startTime ? `Starts ${formatTime(slot.startTime)}` : 'Upcoming'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })()}
        </div>
      </div>

      {/* ── Reschedule Confirmation Modal ─────────────────────────────────────── */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0A2540]/60 backdrop-blur-sm"
            onClick={() => { if (!rescheduleLoading) { setRescheduleTarget(null); setRescheduleMsg(null); } }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0A2540]">Reschedule Appointment?</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                This will cancel the appointment and give the patient a{' '}
                <span className="font-semibold text-[#00B4A0]">free rebook token</span>{' '}
                so they can pick another available slot at no charge.
              </p>
            </div>

            <div className="bg-[#F4F7F9] rounded-2xl p-4 border border-slate-100 mb-6 space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Patient</span>
                <span className="font-bold text-[#0A2540]">
                  {rescheduleTarget.patient_id?.first_Name} {rescheduleTarget.patient_id?.last_Name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Date</span>
                <span className="font-bold text-[#0A2540]">
                  {rescheduleTarget.sechdule_Id?.date ? formatDate(rescheduleTarget.sechdule_Id.date) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Time</span>
                <span className="font-bold text-[#0A2540]">
                  {formatTime(rescheduleTarget.sechdule_Id?.startTime)} &ndash; {formatTime(rescheduleTarget.sechdule_Id?.endTime)}
                </span>
              </div>
            </div>

            {rescheduleMsg && (
              <div className={`mb-5 p-3 rounded-xl text-sm font-medium text-center ${
                rescheduleMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {rescheduleMsg.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setRescheduleTarget(null); setRescheduleMsg(null); }}
                disabled={rescheduleLoading}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduleLoading || rescheduleMsg?.type === 'success'}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rescheduleLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Patient History Modal ──────────────────────────────────────────────── */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeHistoryModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-0.5">Patient</p>
                <h2 className="text-xl font-extrabold text-[#0A2540]">{historyModal.patientName} — Medical History</h2>
              </div>
              <button
                onClick={closeHistoryModal}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="px-8 pt-5 flex gap-2 border-b border-slate-100">
              {['appointments', 'prescriptions'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setHistoryTab(tab)}
                  className={`px-4 py-2 rounded-t-xl text-sm font-bold capitalize transition-all border-b-2 -mb-px ${
                    historyTab === tab
                      ? 'border-[#00B4A0] text-[#00B4A0] bg-[#00B4A0]/5'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {historyLoading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-10 h-10 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Loading history...</p>
                </div>
              ) : historyTab === 'appointments' ? (
                historyData?.appointments?.length ? (
                  <div className="space-y-4">
                    {historyData.appointments.map((appt, i) => {
                      const apptSlot = appt.sechdule_Id;
                      const apptDoctor = appt.doctor_id;
                      const statusColors = {
                        booked:    { bar: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        ongoing:   { bar: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
                        cancelled: { bar: 'bg-rose-400',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
                        completed: { bar: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-600 border-slate-200' },
                      };
                      const sc = statusColors[appt.status] || { bar: 'bg-slate-200', badge: 'bg-slate-50 text-slate-500 border-slate-100' };
                      return (
                        <div key={appt._id || i} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                          {/* coloured top bar */}
                          <div className={`h-1 w-full ${sc.bar}`} />
                          <div className="p-5">
                            {/* Row 1 — doctor + status */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Doctor</p>
                                <p className="text-sm font-extrabold text-[#0A2540]">
                                  {apptDoctor ? `Dr. ${apptDoctor.first_Name || ''} ${apptDoctor.last_Name || ''}`.trim() : '—'}
                                </p>
                                {apptDoctor?.speciality && (
                                  <p className="text-xs text-slate-400 mt-0.5">{apptDoctor.speciality}</p>
                                )}
                              </div>
                              <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${sc.badge}`}>
                                {appt.status}
                              </span>
                            </div>

                            {/* Row 2 — date / time / ID */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-[#F4F7F9] rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="text-xs font-bold text-[#0A2540] leading-snug">
                                  {apptSlot?.date ? formatDate(apptSlot.date) : '—'}
                                </p>
                              </div>
                              <div className="bg-[#F4F7F9] rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                <p className="text-xs font-bold text-[#0A2540] leading-snug">
                                  {apptSlot?.startTime ? formatTime(apptSlot.startTime) : '—'}
                                  {apptSlot?.endTime ? ` – ${formatTime(apptSlot.endTime)}` : ''}
                                </p>
                              </div>
                              <div className="bg-[#F4F7F9] rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ref</p>
                                <p className="text-xs font-bold text-slate-500 font-mono">
                                  #{appt._id?.slice(-6).toUpperCase() || '—'}
                                </p>
                              </div>
                            </div>

                            {/* Row 3 — meeting notes or rebook indicator */}
                            {appt.is_rescheduled_token && (
                              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <span className="text-xs font-semibold text-amber-700">Doctor rescheduled — patient has free rebook token</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm font-medium">No history yet.</div>
                )
              ) : (
                /* Prescriptions tab */
                historyData?.prescriptions?.length ? (
                  <div className="space-y-5">
                    {historyData.prescriptions.map((rx, i) => (
                      <div key={rx._id || i} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="h-1 w-full bg-[#00B4A0]" />
                        <div className="p-5 space-y-4">

                          {/* Header — diagnosis + date */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold text-[#00B4A0] uppercase tracking-widest mb-0.5">Diagnosis</p>
                              <p className="text-sm font-extrabold text-[#0A2540]">{rx.diagnosis || '—'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                              <p className="text-xs font-bold text-slate-600">{rx.createdAt ? formatDate(rx.createdAt) : '—'}</p>
                            </div>
                          </div>

                          {/* Vital signs */}
                          {(rx.vital_signs?.blood_pressure || rx.vital_signs?.temperature || rx.vital_signs?.pulse || rx.vital_signs?.weight) && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vital Signs</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                  { label: 'BP',     val: rx.vital_signs?.blood_pressure },
                                  { label: 'Temp',   val: rx.vital_signs?.temperature },
                                  { label: 'Pulse',  val: rx.vital_signs?.pulse },
                                  { label: 'Weight', val: rx.vital_signs?.weight },
                                ].filter(v => v.val).map(({ label, val }) => (
                                  <div key={label} className="bg-[#F4F7F9] rounded-xl px-3 py-2 text-center">
                                    <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
                                    <p className="text-xs font-bold text-[#0A2540] mt-0.5">{val}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medicines */}
                          {rx.medicines?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medicines</p>
                              <div className="space-y-2">
                                {rx.medicines.map((med, mi) => (
                                  <div key={mi} className="flex items-start gap-3 p-3 bg-[#F4F7F9] rounded-xl">
                                    <div className="w-6 h-6 rounded-lg bg-[#00B4A0]/15 text-[#00B4A0] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                      {mi + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-[#0A2540]">{med.name || '—'}</p>
                                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                        {med.dosage    && <span className="text-xs text-slate-500">{med.dosage}</span>}
                                        {med.frequency && <span className="text-xs text-slate-500">· {med.frequency}</span>}
                                        {med.duration  && <span className="text-xs text-slate-500">· {med.duration}</span>}
                                      </div>
                                      {med.instructions && (
                                        <p className="text-xs text-slate-400 italic mt-0.5">{med.instructions}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Advice + Follow-up */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rx.advice && (
                              <div className="bg-[#F4F7F9] rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Advice</p>
                                <p className="text-xs text-slate-700">{rx.advice}</p>
                              </div>
                            )}
                            {rx.follow_up_date && (
                              <div className="bg-[#F4F7F9] rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Follow-up</p>
                                <p className="text-xs font-bold text-[#0A2540]">{formatDate(rx.follow_up_date)}</p>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm font-medium">No prescriptions yet.</div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Prescription Modal ─────────────────────────────────────────────────── */}
      {prescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePrescriptionModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-0.5">Prescription</p>
                <h2 className="text-xl font-extrabold text-[#0A2540]">{prescriptionModal.patientName}</h2>
              </div>
              <button
                onClick={closePrescriptionModal}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {prescriptionLoading ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="w-10 h-10 border-4 border-[#00B4A0] border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading prescription...</p>
              </div>
            ) : (
              <form onSubmit={handlePrescriptionSubmit} className="p-8 space-y-7">

                {/* Vital Signs */}
                <div>
                  <h3 className="text-sm font-extrabold text-[#0A2540] uppercase tracking-wider mb-3">Vital Signs</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'blood_pressure', label: 'Blood Pressure', placeholder: '120/80' },
                      { key: 'temperature',    label: 'Temperature',    placeholder: '98.6°F' },
                      { key: 'pulse',          label: 'Pulse',          placeholder: '72 bpm' },
                      { key: 'weight',         label: 'Weight',         placeholder: '70 kg' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={prescriptionData.vital_signs[key]}
                          onChange={e => setPrescriptionData(prev => ({
                            ...prev,
                            vital_signs: { ...prev.vital_signs, [key]: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F7F9] text-sm text-[#0A2540] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4A0]/40 focus:border-[#00B4A0] transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-extrabold text-[#0A2540] uppercase tracking-wider mb-2">
                    Diagnosis <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter diagnosis..."
                    value={prescriptionData.diagnosis}
                    onChange={e => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F4F7F9] text-sm text-[#0A2540] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4A0]/40 focus:border-[#00B4A0] transition resize-none"
                  />
                </div>

                {/* Medicines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-[#0A2540] uppercase tracking-wider">Medicines</h3>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4A0]/10 text-[#00B4A0] text-xs font-bold hover:bg-[#00B4A0]/20 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Medicine
                    </button>
                  </div>

                  {prescriptionData.medicines.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No medicines added.</p>
                  )}

                  <div className="space-y-4">
                    {prescriptionData.medicines.map((med, idx) => (
                      <div key={idx} className="relative p-4 rounded-xl bg-[#F4F7F9] border border-slate-100">
                        <button
                          type="button"
                          onClick={() => removeMedicine(idx)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs font-bold text-slate-500 mb-3">Medicine {idx + 1}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { field: 'name',         label: 'Name',         placeholder: 'e.g. Amoxicillin' },
                            { field: 'dosage',        label: 'Dosage',       placeholder: 'e.g. 500mg' },
                            { field: 'frequency',     label: 'Frequency',    placeholder: 'e.g. Twice daily' },
                            { field: 'duration',      label: 'Duration',     placeholder: 'e.g. 7 days' },
                          ].map(({ field, label, placeholder }) => (
                            <div key={field}>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">{label}</label>
                              <input
                                type="text"
                                placeholder={placeholder}
                                value={med[field]}
                                onChange={e => handleMedicineChange(idx, field, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-[#0A2540] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00B4A0]/30 focus:border-[#00B4A0] transition"
                              />
                            </div>
                          ))}
                          <div className="col-span-2">
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Instructions</label>
                            <input
                              type="text"
                              placeholder="e.g. Take after meals"
                              value={med.instructions}
                              onChange={e => handleMedicineChange(idx, 'instructions', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-[#0A2540] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00B4A0]/30 focus:border-[#00B4A0] transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div>
                  <label className="block text-sm font-extrabold text-[#0A2540] uppercase tracking-wider mb-2">Advice</label>
                  <textarea
                    rows={2}
                    placeholder="General advice for the patient..."
                    value={prescriptionData.advice}
                    onChange={e => setPrescriptionData(prev => ({ ...prev, advice: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F4F7F9] text-sm text-[#0A2540] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4A0]/40 focus:border-[#00B4A0] transition resize-none"
                  />
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-extrabold text-[#0A2540] uppercase tracking-wider mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    value={prescriptionData.follow_up_date}
                    onChange={e => setPrescriptionData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7F9] text-sm text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#00B4A0]/40 focus:border-[#00B4A0] transition"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closePrescriptionModal}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={prescriptionSubmitting}
                    className="flex-1 py-3 rounded-xl bg-[#0A2540] hover:bg-[#0d2f4f] text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {prescriptionSubmitting ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : null}
                    Save Prescription
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Success Toast ──────────────────────────────────────────────────────── */}
      {prescriptionToast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 bg-[#0A2540] text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in">
          <svg className="w-4 h-4 text-[#00B4A0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Prescription saved
        </div>
      )}
    </>
  );
};

export default DoctorAppointments;
