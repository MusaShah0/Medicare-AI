import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/admin/login`, {
        method      : 'POST',
        credentials : 'include',
        headers     : { 'Content-Type': 'application/json' },
        body        : JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      navigate('/admin');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden"
           style={{ background: '#0A2540' }}>
        {/* grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* glow blobs */}
        <div className="absolute top-20 left-16 w-72 h-72 rounded-full blur-[120px]" style={{ background: 'rgba(0,180,160,0.15)' }} />
        <div className="absolute bottom-32 right-8 w-56 h-56 rounded-full blur-[100px]" style={{ background: 'rgba(0,180,160,0.10)' }} />

        <div className="relative z-10 p-12 pt-16">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#00B4A0' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">MediCare AI</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#00B4A0' }}>Admin Portal</p>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Platform<br />Control Center
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Manage doctors, patients, appointments, schedules, and platform data from a single unified dashboard.
          </p>
        </div>

        <div className="relative z-10 p-12 pb-16 space-y-5">
          {[
            { icon: '👥', label: 'User Management', desc: 'Oversee doctors & patients' },
            { icon: '📅', label: 'Appointment Control', desc: 'Monitor and manage bookings' },
            { icon: '📊', label: 'Platform Analytics', desc: 'Real-time statistics & insights' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                   style={{ background: 'rgba(0,180,160,0.15)' }}>{f.icon}</div>
              <div>
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-slate-400 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F4F7F9' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#00B4A0' }}>Restricted Access</p>
              <h2 className="text-2xl font-bold" style={{ color: '#0A2540' }}>Admin Sign In</h2>
              <p className="text-slate-500 text-sm mt-1">Enter your administrator credentials to continue.</p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>
                  Admin Email
                </label>
                <input
                  name="email" type="email" required
                  value={form.email} onChange={handle}
                  placeholder="admin@medicare.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                  onFocus={e => e.target.style.borderColor = '#00B4A0'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#0A2540' }}>
                  Password
                </label>
                <input
                  name="password" type="password" required
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#0A2540' }}
                  onFocus={e => e.target.style.borderColor = '#00B4A0'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 mt-2"
                style={{ background: loading ? '#94A3B8' : '#00B4A0', cursor: loading ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!loading) e.target.style.background = '#009688'; }}
                onMouseLeave={e => { if (!loading) e.target.style.background = '#00B4A0'; }}
              >
                {loading ? 'Authenticating…' : 'Sign In to Admin Portal'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                This portal is restricted to authorized administrators only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
