import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 👇 1. Receive setRole from App.jsx
const DoctorLogin = ({ setRole }) => {
  // --- CONFIGURATION ---
  const API_URL = 'http://localhost:4000/D_LogIn'; 

  // --- STATE ---
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
   
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
   
  const navigate = useNavigate();

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true 
      });

      if (response.data.status === 1) {
        // --- 1. EXTRACT DATA ---
        const doctorData = response.data.doctor || response.data.data || {};
        
        // --- 2. PREPARE VARIABLES ---
        const firstName = doctorData.firstName || doctorData.first_Name || "Doctor";
        const speciality = doctorData.speciality || "Specialist";

        // --- 3. SAVE TO LOCAL STORAGE ---
        localStorage.setItem('doctorName', firstName);
        localStorage.setItem('doctorSpeciality', speciality);
        
        // --- 4. UPDATE APP STATE (CRITICAL FOR PRIVATE ROUTE) ---
        // This opens the gate for the PrivateRoute immediately
        setRole('doctor');

        // Success Message
        setMessage({ type: 'success', text: response.data.msg || 'Login Successful!' });
        
        // Redirect
        setTimeout(() => {
          navigate('/doctor-dashboard'); 
        }, 1500);

      } else {
        setMessage({ type: 'error', text: response.data.msg || 'Login failed' });
      }

    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.msg || "Server connection failed";
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
       
      {/* LEFT SIDE: Branding Panel */}
      <div className="hidden lg:flex w-5/12 bg-teal-700 relative overflow-hidden flex-col justify-center px-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-8 border border-white/20 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">Welcome <br/> Back.</h1>
          <p className="text-teal-100 text-lg font-light leading-relaxed">
            Access your dashboard to manage appointments, update schedules, and review patient analytics securely.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
           
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Doctor Sign In</h2>
            <p className="text-slate-500 mt-2">Enter your credentials to access your account.</p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-center gap-3 animate-fade-in ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
             
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="doctor@hospital.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs text-teal-600 font-semibold hover:underline hover:text-teal-700">Forgot password?</a>
              </div>
              <input 
                required 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" 
              />
            </div>

            <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-teal-500/20 transition-all duration-300 transform 
                    ${loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-1 active:scale-95'}`}
                >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                    </span>
                ) : "Sign In"}
                </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/doctor/signup" className="text-teal-600 font-bold hover:underline hover:text-teal-700 transition">
                  Register here
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;