import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { credentials: 'include', ...opts });

const NavY = '#0A2540';
const Teal = '#00B4A0';
const Chalk = '#F4F7F9';

// ── Tiny reusable components ────────────────────────────────────────────────

function StatCard({ label, value, icon, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 group hover:-translate-y-1 transition-transform duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
           style={{ background: 'rgba(0,180,160,0.1)' }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold" style={{ color: NavY }}>{value ?? '—'}</p>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    booked   : ['#EFF6FF','#1D4ED8'],
    ongoing  : ['#F0FDF4','#15803D'],
    completed: ['#F8FAFC','#475569'],
    cancelled: ['#FEF2F2','#B91C1C'],
    available: ['#F0FDF4','#15803D'],
    booked_slot: ['#EFF6FF','#1D4ED8'],
  };
  const [bg, fg] = map[status] || ['#F8FAFC','#475569'];
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
          style={{ background: bg, color: fg }}>{status}</span>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
             style={{ background: '#FEF2F2' }}>🗑️</div>
        <h3 className="text-center font-bold text-lg mb-2" style={{ color: NavY }}>Confirm Deletion</h3>
        <p className="text-center text-slate-500 text-sm mb-6">{msg}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-colors"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>Cancel</button>
          <button onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors"
                  style={{ background: '#DC2626' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold" style={{ color: NavY }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

const SECTIONS = ['Overview','Doctors','Patients','Appointments','Schedules','Meeting Notes','Reviews'];

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const [active, setActive] = useState('Overview');
  const [stats,  setStats]  = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({});
  const [confirm, setConfirm] = useState(null); // { msg, action }
  const [apptDetail, setApptDetail] = useState(null);
  const [noteDetail, setNoteDetail] = useState(null);
  const [apptSearch, setApptSearch] = useState('');
  const [apptFilter, setApptFilter] = useState('all');
  const [toast, setToast] = useState('');
  const pollRef = useRef(null);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Fetchers ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    const r = await API('/admin/stats');
    if (r.ok) { const d = await r.json(); setStats(d.data); }
  }, []);

  const fetchDoctors = useCallback(async () => {
    const r = await API('/admin/doctors');
    if (r.ok) { const d = await r.json(); setDoctors(d.data); }
  }, []);

  const fetchPatients = useCallback(async () => {
    const r = await API('/admin/patients');
    if (r.ok) { const d = await r.json(); setPatients(d.data); }
  }, []);

  const fetchAppointments = useCallback(async () => {
    const params = new URLSearchParams();
    if (apptFilter !== 'all') params.set('status', apptFilter);
    if (apptSearch) params.set('search', apptSearch);
    const r = await API(`/admin/appointments?${params}`);
    if (r.ok) { const d = await r.json(); setAppointments(d.data); }
  }, [apptFilter, apptSearch]);

  const fetchSchedules = useCallback(async () => {
    const r = await API('/admin/schedules');
    if (r.ok) { const d = await r.json(); setSchedules(d.data); }
  }, []);

  const fetchNotes = useCallback(async () => {
    const r = await API('/admin/meeting-notes');
    if (r.ok) { const d = await r.json(); setNotes(d.data); }
  }, []);

  const fetchReviews = useCallback(async () => {
    const r = await API('/admin/reviews');
    if (r.ok) { const d = await r.json(); setReviews(d.data); }
  }, []);

  const refreshAll = useCallback(() => {
    fetchStats();
    fetchDoctors();
    fetchPatients();
    fetchAppointments();
    fetchSchedules();
    fetchNotes();
    fetchReviews();
  }, [fetchStats, fetchDoctors, fetchPatients, fetchAppointments, fetchSchedules, fetchNotes, fetchReviews]);

  // Verify session on mount, then poll every 15 s
  useEffect(() => {
    (async () => {
      const r = await API('/admin/verify');
      if (!r.ok) { navigate('/admin/login', { replace: true }); return; }
      refreshAll();
      pollRef.current = setInterval(refreshAll, 15000);
    })();
    return () => clearInterval(pollRef.current);
  }, [navigate, refreshAll]);

  // Re-fetch appointments whenever filter/search changes
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Delete helpers ──────────────────────────────────────────────────────

  const del = (url, msg, onSuccess) => {
    setConfirm({
      msg,
      action: async () => {
        setConfirm(null);
        setLoading(p => ({ ...p, [url]: true }));
        try {
          const r = await API(url, { method: 'DELETE' });
          const d = await r.json();
          if (d.success) { showToast(d.message); onSuccess(); }
          else showToast(d.message || 'Operation failed.');
        } catch { showToast('Network error.'); }
        finally { setLoading(p => ({ ...p, [url]: false })); }
      },
    });
  };

  const logout = async () => {
    await API('/admin/logout', { method: 'POST' });
    navigate('/admin/login', { replace: true });
  };

  // ── Icon helper ─────────────────────────────────────────────────────────
  const avatar = name => {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
           style={{ background: Teal }}>{initials}</div>
    );
  };

  // ── Render sections ─────────────────────────────────────────────────────

  const renderOverview = () => (
    <Section title="Platform Overview" icon="📊">
      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            <StatCard label="Doctors"      value={stats.totalDoctors}       icon="👨‍⚕️" />
            <StatCard label="Patients"     value={stats.totalPatients}      icon="🧑‍🤝‍🧑" />
            <StatCard label="Appointments" value={stats.totalAppointments}  icon="📅" />
            <StatCard label="Schedules"    value={stats.totalSchedules}     icon="🗓️" />
            <StatCard label="Meeting Notes" value={stats.totalNotes}        icon="📝" />
            <StatCard label="Booked"       value={stats.booked}             icon="🔵" sub="Active bookings" />
            <StatCard label="Completed"    value={stats.completed}          icon="✅" sub="Finished sessions" />
            <StatCard label="Cancelled"    value={stats.cancelled}          icon="❌" sub="Cancelled slots" />
          </div>

          <div>
            <h3 className="font-bold text-base mb-4" style={{ color: NavY }}>Recent Appointments</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: Chalk }}>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500">Doctor</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500">Patient</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500">Date</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAppointments.map(a => (
                    <tr key={a._id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium" style={{ color: NavY }}>
                        Dr. {a.doctor_id?.first_Name} {a.doctor_id?.last_Name}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {a.patient_id?.first_Name} {a.patient_id?.last_Name}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {a.sechdule_Id?.date ? new Date(a.sechdule_Id.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3"><Badge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}
    </Section>
  );

  const renderDoctors = () => (
    <Section title="Doctors" icon="👨‍⚕️">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: Chalk }}>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Doctor</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Speciality</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Appointments</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d._id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {avatar(`${d.first_Name} ${d.last_Name}`)}
                    <span className="font-medium" style={{ color: NavY }}>Dr. {d.first_Name} {d.last_Name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{d.speciality || '—'}</td>
                <td className="px-5 py-3 text-slate-500">{d.email}</td>
                <td className="px-5 py-3 text-slate-600">{d.appointment_count}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => del(`/admin/doctor/${d._id}`,
                      `Remove Dr. ${d.first_Name} ${d.last_Name} and all their data? This cannot be undone.`,
                      () => { setDoctors(p => p.filter(x => x._id !== d._id)); fetchStats(); })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                    style={{ background: '#DC2626' }}>Remove</button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No doctors found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );

  const renderPatients = () => (
    <Section title="Patients" icon="🧑‍🤝‍🧑">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: Chalk }}>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Patient</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Phone</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Appointments</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p._id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {avatar(`${p.first_Name} ${p.last_Name}`)}
                    <span className="font-medium" style={{ color: NavY }}>{p.first_Name} {p.last_Name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500">{p.email}</td>
                <td className="px-5 py-3 text-slate-500">{p.ph || '—'}</td>
                <td className="px-5 py-3 text-slate-600">{p.appointment_count}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => del(`/admin/patient/${p._id}`,
                      `Remove ${p.first_Name} ${p.last_Name} and all their data? This cannot be undone.`,
                      () => { setPatients(prev => prev.filter(x => x._id !== p._id)); fetchStats(); })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: '#DC2626' }}>Remove</button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );

  const renderAppointments = () => (
    <Section title="Appointments" icon="📅">
      {/* filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={apptSearch} onChange={e => setApptSearch(e.target.value)}
          placeholder="Search by name…"
          className="px-4 py-2 rounded-xl border text-sm outline-none transition-all flex-1 min-w-[200px]"
          style={{ borderColor: '#E2E8F0', background: 'white', color: NavY }}
          onFocus={e => e.target.style.borderColor = Teal}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
        />
        {['all','booked','ongoing','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setApptFilter(s)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors"
                  style={{ background: apptFilter === s ? NavY : 'white', color: apptFilter === s ? 'white' : '#64748B', border: '1px solid #E2E8F0' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: Chalk }}>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Doctor</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Patient</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Date</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a._id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium" style={{ color: NavY }}>
                  Dr. {a.doctor_id?.first_Name} {a.doctor_id?.last_Name}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {a.patient_id?.first_Name} {a.patient_id?.last_Name}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {a.sechdule_Id?.date ? new Date(a.sechdule_Id.date).toLocaleDateString() : '—'}
                  {a.sechdule_Id?.startTime ? ` · ${a.sechdule_Id.startTime}` : ''}
                </td>
                <td className="px-5 py-3"><Badge status={a.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setApptDetail(a)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: 'rgba(0,180,160,0.1)', color: Teal }}>Details</button>
                    <button
                      onClick={() => del(`/admin/appointment/${a._id}`,
                        'Remove this appointment and free the schedule slot?',
                        () => { setAppointments(p => p.filter(x => x._id !== a._id)); fetchStats(); })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: '#DC2626' }}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No appointments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );

  const renderSchedules = () => (
    <Section title="Schedules" icon="🗓️">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: Chalk }}>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Doctor</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Date</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Time</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Fee</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(s => (
              <tr key={s._id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium" style={{ color: NavY }}>
                  Dr. {s.doctor_id?.first_Name} {s.doctor_id?.last_Name}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {s.date ? new Date(s.date).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3 text-slate-500">{s.startTime} – {s.endTime}</td>
                <td className="px-5 py-3 text-slate-500">{s.clinic_fee ? `$${s.clinic_fee}` : '—'}</td>
                <td className="px-5 py-3"><Badge status={s.status} /></td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => del(`/admin/schedule/${s._id}`,
                      'Remove this schedule slot? Linked appointments will be cancelled.',
                      () => { setSchedules(p => p.filter(x => x._id !== s._id)); fetchStats(); })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: '#DC2626' }}>Remove</button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No schedules found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );

  const renderNotes = () => (
    <Section title="Meeting Notes" icon="📝">
      <div className="grid gap-4">
        {notes.map(n => {
          const appt = n.appointment_id;
          return (
            <div key={n._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge status={n.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-semibold text-sm" style={{ color: NavY }}>
                  Dr. {appt?.doctor_id?.first_Name} {appt?.doctor_id?.last_Name}
                  {appt?.doctor_id?.speciality ? ` · ${appt.doctor_id.speciality}` : ''}
                </p>
                <p className="text-slate-500 text-sm">
                  Patient: {appt?.patient_id?.first_Name} {appt?.patient_id?.last_Name}
                </p>
                {appt?.sechdule_Id?.date && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(appt.sechdule_Id.date).toLocaleDateString()} · {appt.sechdule_Id.startTime}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {n.status === 'complete' && (
                  <button onClick={() => setNoteDetail(n)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: 'rgba(0,180,160,0.1)', color: Teal }}>View</button>
                )}
                <button
                  onClick={() => del(`/admin/meeting-note/${n._id}`,
                    'Remove this meeting note and its PDF?',
                    () => setNotes(p => p.filter(x => x._id !== n._id)))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: '#DC2626' }}>Remove</button>
              </div>
            </div>
          );
        })}
        {notes.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm border border-slate-100">
            No meeting notes found.
          </div>
        )}
      </div>
    </Section>
  );

  const renderReviews = () => (
    <Section title="Reviews" icon="⭐">
      <div className="grid gap-4">
        {reviews.map(r => (
          <div key={r._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg" style={{ color: '#F59E0B' }}>{'★'.repeat(r.rating || 0)}</span>
                <span className="text-slate-400 text-sm">{'☆'.repeat(5 - (r.rating || 0))}</span>
                <span className="text-xs text-slate-400">({r.rating}/5)</span>
              </div>
              <p className="font-semibold text-sm" style={{ color: NavY }}>
                Dr. {r.doctor_id?.first_Name} {r.doctor_id?.last_Name}
              </p>
              <p className="text-slate-500 text-sm">
                by {r.patient_id?.first_Name} {r.patient_id?.last_Name}
              </p>
              {r.comment && <p className="text-slate-600 text-sm mt-2 italic">"{r.comment}"</p>}
            </div>
            <button
              onClick={() => del(`/admin/review/${r._id}`,
                'Remove this review?',
                () => setReviews(p => p.filter(x => x._id !== r._id)))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{ background: '#DC2626' }}>Remove</button>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow-sm border border-slate-100">
            No reviews found.
          </div>
        )}
      </div>
    </Section>
  );

  const sectionMap = {
    'Overview'      : renderOverview,
    'Doctors'       : renderDoctors,
    'Patients'      : renderPatients,
    'Appointments'  : renderAppointments,
    'Schedules'     : renderSchedules,
    'Meeting Notes' : renderNotes,
    'Reviews'       : renderReviews,
  };

  const icons = { 'Overview':'📊','Doctors':'👨‍⚕️','Patients':'🧑‍🤝‍🧑','Appointments':'📅','Schedules':'🗓️','Meeting Notes':'📝','Reviews':'⭐' };

  return (
    <div className="min-h-screen flex" style={{ background: Chalk, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col fixed top-0 left-0 h-full z-30"
             style={{ background: NavY }}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: Teal }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">MediCare AI</p>
              <p className="text-xs" style={{ color: Teal }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActive(s)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      background: active === s ? 'rgba(0,180,160,0.2)' : 'transparent',
                      color: active === s ? Teal : 'rgba(255,255,255,0.7)',
                    }}>
              <span className="text-base">{icons[s]}</span>
              {s}
              {active === s && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: Teal }} />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: Teal }}>Admin Dashboard</p>
            <h1 className="text-2xl font-bold" style={{ color: NavY }}>{active}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: NavY }}>Administrator</p>
              <p className="text-xs text-slate-400">admin@medicare.com</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                 style={{ background: Teal }}>AD</div>
          </div>
        </div>

        {sectionMap[active]?.()}
      </main>

      {/* ── Appointment Detail Modal ── */}
      {apptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: NavY }}>Appointment Details</h3>
              <button onClick={() => setApptDetail(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 text-lg">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Status', <Badge key="s" status={apptDetail.status} />],
                ['Doctor', `Dr. ${apptDetail.doctor_id?.first_Name} ${apptDetail.doctor_id?.last_Name}`],
                ['Speciality', apptDetail.doctor_id?.speciality || '—'],
                ['Patient', `${apptDetail.patient_id?.first_Name} ${apptDetail.patient_id?.last_Name}`],
                ['Patient Email', apptDetail.patient_id?.email || '—'],
                ['Date', apptDetail.sechdule_Id?.date ? new Date(apptDetail.sechdule_Id.date).toLocaleDateString() : '—'],
                ['Time', apptDetail.sechdule_Id ? `${apptDetail.sechdule_Id.startTime} – ${apptDetail.sechdule_Id.endTime}` : '—'],
                ['Fee', apptDetail.sechdule_Id?.clinic_fee ? `$${apptDetail.sechdule_Id.clinic_fee}` : '—'],
                ['Meeting ID', apptDetail.meeting_id || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-4 py-2 border-b border-slate-50">
                  <span className="text-slate-400 w-32 flex-shrink-0">{label}</span>
                  <span className="font-medium" style={{ color: NavY }}>{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setApptDetail(null)}
                    className="w-full mt-6 py-2.5 rounded-xl font-semibold text-sm text-white"
                    style={{ background: NavY }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Meeting Note Detail Modal ── */}
      {noteDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: NavY }}>Meeting Note</h3>
              <button onClick={() => setNoteDetail(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 text-lg">✕</button>
            </div>

            {noteDetail.summary && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: Teal }}>Summary</p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {noteDetail.summary}
                </div>
              </div>
            )}
            {noteDetail.transcript && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: Teal }}>Transcript</p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {noteDetail.transcript}
                </div>
              </div>
            )}
            <button onClick={() => setNoteDetail(null)}
                    className="w-full mt-6 py-2.5 rounded-xl font-semibold text-sm text-white"
                    style={{ background: NavY }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirm && (
        <ConfirmModal
          msg={confirm.msg}
          onConfirm={confirm.action}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
             style={{ background: NavY }}>
          {toast}
        </div>
      )}
    </div>
  );
}
