import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const NAV_LINKS = [
  { to: '/patient/dashboard',    label: 'Dashboard',      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { to: '/doctors',              label: 'Find Doctors',   icon: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z' },
  { to: '/my-appointments',      label: 'My Appointments',icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/ai-chat',              label: 'AI Assistant',   icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { to: '/patient/edit-profile', label: 'Edit Profile',   icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

export default function PatientEditProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({
    first_Name:      '',
    last_Name:       '',
    age:             '',
    gender:          '',
    password:        '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState({ msg: '', type: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get(`${API}/patient/profile`, { withCredentials: true })
      .then(r => {
        const d = r.data.data;
        setProfile(d);
        setForm({
          first_Name:      d.first_Name || '',
          last_Name:       d.last_Name  || '',
          age:             d.age != null ? String(d.age) : '',
          gender:          d.gender     || '',
          password:        '',
          confirmPassword: '',
        });
      })
      .catch(() => navigate('/patient/login'));
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const handleLogout = async () => {
    try { await axios.get(`${API}/logout`, { withCredentials: true }); } catch {}
    localStorage.clear();
    navigate('/patient/login');
  };

  const handleField = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_Name.trim()) e.first_Name = 'First name is required.';
    if (!form.last_Name.trim())  e.last_Name  = 'Last name is required.';
    if (form.age !== '') {
      const n = Number(form.age);
      if (!Number.isInteger(n) || n < 0 || n > 120) e.age = 'Age must be between 0 and 120.';
    }
    if (form.password && form.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    if (form.password && form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        first_Name: form.first_Name,
        last_Name:  form.last_Name,
        age:        form.age !== '' ? Number(form.age) : undefined,
        gender:     form.gender,
      };
      if (form.password) body.password = form.password;

      await axios.put(`${API}/patient/profile`, body, { withCredentials: true });
      showToast('Profile updated successfully!');
      setForm(p => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F7F9' }}>
      <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F7F9]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#0A2540] flex flex-col z-30">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="w-9 h-9 bg-[#00B4A0] rounded-xl flex items-center justify-center text-white font-extrabold text-lg mr-3">M</div>
          <div>
            <span className="text-white font-extrabold text-lg leading-none">MediCare</span>
            <p className="text-[#00B4A0] text-[10px] font-bold uppercase tracking-widest mt-0.5">Patient Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_LINKS.map(({ to, label, icon }) => {
            const active = to === '/patient/edit-profile';
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 border-l-4 ${
                  active
                    ? 'bg-white/15 text-white border-[#00B4A0]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white border-transparent'
                }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                </svg>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:bg-white/10 hover:text-white font-medium transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-64 flex-1 flex flex-col">

        {/* Hero strip */}
        <div className="px-8 py-8" style={{ background: '#0A2540' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#00B4A0' }}>Account Settings</p>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Update your personal information and account settings.</p>
        </div>

        <div className="flex-1 p-8 max-w-4xl w-full mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Email (read-only) ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#00B4A0' }}>Email Address</p>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                   style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-slate-500 flex-1">{profile.email}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#F0FDF4', color: '#15803D' }}>Locked</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Email address cannot be changed.</p>
            </div>

            {/* ── Personal Information ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#00B4A0' }}>Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                         style={{ color: '#0A2540' }}>First Name</label>
                  <input
                    name="first_Name"
                    value={form.first_Name}
                    onChange={handleField}
                    placeholder="First name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.first_Name ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.first_Name ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.first_Name && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.first_Name}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                         style={{ color: '#0A2540' }}>Last Name</label>
                  <input
                    name="last_Name"
                    value={form.last_Name}
                    onChange={handleField}
                    placeholder="Last name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.last_Name ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.last_Name ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.last_Name && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.last_Name}</p>}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                         style={{ color: '#0A2540' }}>Age</label>
                  <input
                    name="age"
                    type="number"
                    min="0"
                    max="120"
                    value={form.age}
                    onChange={handleField}
                    placeholder="e.g. 28"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.age ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.age ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.age && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.age}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                         style={{ color: '#0A2540' }}>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleField}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none"
                    style={{ borderColor: errors.gender ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.gender ? '#DC2626' : '#E2E8F0'}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* ── Change Password ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#00B4A0' }}>Change Password</p>
              <p className="text-xs text-slate-400 mb-5">Leave blank to keep your current password.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                         style={{ color: '#0A2540' }}>New Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleField}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.password ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.password ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.password && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                         style={{ color: '#0A2540' }}>Confirm New Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleField}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.confirmPassword ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.confirmPassword ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-3 pb-8">
              <Link to="/patient/dashboard"
                className="px-6 py-3 rounded-xl border font-semibold text-sm transition-colors"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                Cancel
              </Link>
              <button type="submit" disabled={saving}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center gap-2"
                style={{ background: saving ? '#94A3B8' : '#00B4A0', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving && (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ── Toast ── */}
      {toast.msg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all"
             style={{ background: toast.type === 'error' ? '#DC2626' : '#0A2540' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
