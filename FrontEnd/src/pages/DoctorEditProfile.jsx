import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const SPECIALITIES = [
  'Cardiologist', 'Dermatologist', 'Neurologist',
  'Pediatrician', 'General Surgeon', 'Psychiatrist', 'Orthopedic',
];

const NAV_LINKS = [
  { to: '/doctor-dashboard',      label: 'Dashboard',       icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { to: '/doctor/appointments',   label: 'My Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/doctor/schedule',       label: 'My Schedule',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/doctor/schedule/create',label: 'Create Schedule', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { to: '/doctor/edit-profile',   label: 'Edit Profile',   icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

export default function DoctorEditProfile() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [profile,   setProfile]   = useState(null);
  const [form,      setForm]      = useState({ first_Name:'', last_Name:'', ph:'', speciality:'', degrees:[], password:'', confirmPassword:'' });
  const [degreeInput, setDegreeInput] = useState('');
  const [preview,   setPreview]   = useState(null);
  const [file,      setFile]      = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState({ msg:'', type:'' });
  const [errors,    setErrors]    = useState({});

  // Load profile on mount
  useEffect(() => {
    axios.get(`${API}/doctor/profile`, { withCredentials: true })
      .then(r => {
        const d = r.data.data;
        setProfile(d);
        setForm({
          first_Name      : d.first_Name || '',
          last_Name       : d.last_Name  || '',
          ph              : d.ph         || '',
          speciality      : d.speciality || '',
          degrees         : d.degrees    || [],
          password        : '',
          confirmPassword : '',
        });
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'' }), 3500);
  };

  const handleLogout = async () => {
    await axios.get(`${API}/Doctor_Logout`, { withCredentials: true });
    localStorage.removeItem('doctorName');
    localStorage.removeItem('doctorId');
    navigate('/login');
  };

  const handleField = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handlePicture = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const addDegree = () => {
    const d = degreeInput.trim();
    if (!d || form.degrees.includes(d)) return;
    setForm(p => ({ ...p, degrees: [...p.degrees, d] }));
    setDegreeInput('');
  };

  const removeDegree = deg => setForm(p => ({ ...p, degrees: p.degrees.filter(d => d !== deg) }));

  const validate = () => {
    const e = {};
    if (!form.first_Name.trim()) e.first_Name = 'First name is required.';
    if (!form.last_Name.trim())  e.last_Name  = 'Last name is required.';
    if (!form.ph.trim())         e.ph         = 'Phone number is required.';
    if (!form.speciality)        e.speciality = 'Please select a speciality.';
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
      const fd = new FormData();
      fd.append('first_Name', form.first_Name);
      fd.append('last_Name',  form.last_Name);
      fd.append('ph',         form.ph);
      fd.append('speciality', form.speciality);
      fd.append('degrees',    JSON.stringify(form.degrees));
      if (form.password) fd.append('password', form.password);
      if (file) fd.append('profile_Picture', file);

      const r = await axios.put(`${API}/doctor/profile/update`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(r.data.data);
      showToast('Profile updated successfully!');
      setForm(p => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const picSrc = preview
    || (profile?.profile_Picture && profile.profile_Picture !== 'default-doctor.png'
        ? `${API}/pictures/${profile.profile_Picture}`
        : null);

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
            <p className="text-[#00B4A0] text-[10px] font-bold uppercase tracking-widest mt-0.5">Doctor Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_LINKS.map(({ to, label, icon }) => {
            const active = to === '/doctor/edit-profile';
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 border-l-4 ${
                  active ? 'bg-white/15 text-white border-[#00B4A0]' : 'text-white/60 hover:bg-white/10 hover:text-white border-transparent'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
          <p className="text-slate-400 text-sm mt-1">Update your personal information, speciality, and credentials.</p>
        </div>

        <div className="flex-1 p-8 max-w-4xl w-full mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Profile Picture ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#00B4A0' }}>Profile Picture</p>
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                  {picSrc ? (
                    <img src={picSrc} alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg"
                         style={{ background: '#00B4A0' }}>
                      {profile.first_Name?.[0]}{profile.last_Name?.[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePicture} />
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
                    style={{ borderColor: '#00B4A0', color: '#00B4A0' }}>
                    Change Photo
                  </button>
                  <p className="text-xs text-slate-400 mt-2">JPG or PNG, max 2 MB</p>
                  {file && <p className="text-xs mt-1" style={{ color: '#00B4A0' }}>✓ {file.name} selected</p>}
                </div>
              </div>
            </div>

            {/* ── Email (read-only) ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#00B4A0' }}>Email Address</p>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-slate-500 flex-1">{profile.email}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#15803D' }}>Locked</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Email address cannot be changed for security reasons.</p>
            </div>

            {/* ── Personal Info ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#00B4A0' }}>Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'first_Name', label: 'First Name', placeholder: 'First name' },
                  { name: 'last_Name',  label: 'Last Name',  placeholder: 'Last name' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>{label}</label>
                    <input
                      name={name} value={form[name]} onChange={handleField}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: errors[name] ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                      onFocus={e => e.target.style.borderColor = '#00B4A0'}
                      onBlur={e => e.target.style.borderColor = errors[name] ? '#DC2626' : '#E2E8F0'}
                    />
                    {errors[name] && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors[name]}</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>Phone Number</label>
                  <input
                    name="ph" value={form.ph} onChange={handleField}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.ph ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.ph ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.ph && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.ph}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>Speciality</label>
                  <select
                    name="speciality" value={form.speciality} onChange={handleField}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none"
                    style={{ borderColor: errors.speciality ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.speciality ? '#DC2626' : '#E2E8F0'}>
                    <option value="">Select speciality</option>
                    {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.speciality && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.speciality}</p>}
                </div>
              </div>
            </div>

            {/* ── Degrees ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#00B4A0' }}>Degrees & Qualifications</p>
              <div className="flex gap-2 mb-4">
                <input
                  value={degreeInput}
                  onChange={e => setDegreeInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDegree(); } }}
                  placeholder="e.g. MBBS, FCPS, MD"
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                  onFocus={e => e.target.style.borderColor = '#00B4A0'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
                <button type="button" onClick={addDegree}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ background: '#00B4A0' }}>Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.degrees.map(deg => (
                  <span key={deg} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ background: 'rgba(0,180,160,0.12)', color: '#00B4A0' }}>
                    {deg}
                    <button type="button" onClick={() => removeDegree(deg)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-xs hover:bg-black/10 transition-colors">✕</button>
                  </span>
                ))}
                {form.degrees.length === 0 && <p className="text-sm text-slate-400">No degrees added yet.</p>}
              </div>
            </div>

            {/* ── Change Password ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#00B4A0' }}>Change Password</p>
              <p className="text-xs text-slate-400 mb-5">Leave blank to keep your current password.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>New Password</label>
                  <input
                    name="password" type="password" value={form.password} onChange={handleField}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: errors.password ? '#DC2626' : '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                    onFocus={e => e.target.style.borderColor = '#00B4A0'}
                    onBlur={e => e.target.style.borderColor = errors.password ? '#DC2626' : '#E2E8F0'}
                  />
                  {errors.password && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>Confirm New Password</label>
                  <input
                    name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleField}
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
              <Link to="/doctor-dashboard"
                className="px-6 py-3 rounded-xl border font-semibold text-sm transition-colors"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                Cancel
              </Link>
              <button type="submit" disabled={saving}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center gap-2"
                style={{ background: saving ? '#94A3B8' : '#00B4A0', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
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
