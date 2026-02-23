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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure this endpoint matches your Node.js route (e.g., router.post('/P_Login', ...))
      const response = await axios.post('http://localhost:4000/P_Login', formData, {
        withCredentials: true // IMPORTANT: Allows browser to set the HTTP-Only cookie
      });

      if (response.data.status === 1) {
        // --- SAVE DATA FOR AUTH GUARD ---
        // We save the user details so App.jsx knows we are logged in
        localStorage.setItem('patientData', JSON.stringify(response.data.data));
        
        // Redirect to Dashboard
        navigate('/patient/dashboard');
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      
      {/* --- LEFT SIDE: Branding --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-800 relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 text-center px-16 text-white">
          <div className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
             <span className="text-4xl">🩺</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Welcome Back to Medicare AI</h2>
          <p className="text-teal-50 text-lg leading-relaxed font-light">
            Your personal health assistant is ready. Log in to check symptoms, book doctors, and manage your health journey.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl lg:shadow-none border border-slate-100 lg:border-none">
          
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900">Sign In</h1>
            <p className="mt-2 text-slate-500 text-sm">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-700">Forgot Password?</a>
              </div>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all duration-200 transform active:scale-95"
            >
              {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                  </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              New to Medicare AI?{' '}
              <Link to="/patient/signup" className="font-bold text-teal-600 hover:underline">
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