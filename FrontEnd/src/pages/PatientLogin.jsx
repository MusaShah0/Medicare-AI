import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const PatientLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/P_Login', formData, {
        withCredentials: true
      });

      if (response.data.status === 1) {
        localStorage.setItem('patientData', JSON.stringify(response.data.data));
        navigate('/patient/dashboard');
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.55s ease both; }
        .fade-up-2 { animation: fadeUp 0.55s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.55s 0.2s ease both; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A2540] relative overflow-hidden flex-col justify-between p-14">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.04,
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] bg-[#00B4A0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[400px] h-[400px] bg-[#00B4A0]/8 rounded-full blur-[100px]" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            Medicare<span className="text-[#00B4A0]">AI</span>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-4">Patient Portal</p>
          <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Your health,<br />always within reach.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Sign in to access your personal health dashboard, book appointments, and chat with our AI health assistant.
          </p>

          {/* Feature list */}
          <ul className="space-y-4 mb-12">
            {[
              'AI-powered symptom analysis',
              'Verified specialist doctors',
              'Instant video consultations',
              'Auto-generated health reports',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00B4A0]/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-slate-300 text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value: '10k+', label: 'Patients Served' },
              { value: '500+', label: 'Verified Doctors' },
              { value: '98%', label: 'Satisfaction Rate' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave SVG */}
        <div className="relative z-10">
          <svg viewBox="0 0 400 40" className="w-full opacity-10" preserveAspectRatio="none">
            <path d="M0,20 C100,0 300,40 400,20 L400,40 L0,40 Z" fill="#00B4A0" />
          </svg>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 bg-[#F4F7F9] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 sm:p-10 fade-up">
            {/* Logo */}
            <div className="mb-8 text-center">
              <span className="text-2xl font-extrabold tracking-tight text-[#0A2540]">
                Medicare<span className="text-[#00B4A0]">AI</span>
              </span>
            </div>

            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-2 text-center">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-[#0A2540] tracking-tight text-center mb-1">Sign In</h1>
            <p className="text-slate-500 text-sm text-center mb-8">Enter your credentials to access your account.</p>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-[#0A2540] mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] text-slate-700 outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-bold text-[#0A2540]">Password</label>
                  <a href="#" className="text-xs font-semibold text-[#00B4A0] hover:text-teal-400 transition">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] text-slate-700 outline-none transition bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00B4A0] text-white rounded-xl font-bold py-3.5 hover:bg-teal-400 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-[#00B4A0]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-8 text-center text-sm text-slate-500">
              New to MedicareAI?{' '}
              <Link to="/patient/signup" className="font-bold text-[#00B4A0] hover:text-teal-400 transition">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
