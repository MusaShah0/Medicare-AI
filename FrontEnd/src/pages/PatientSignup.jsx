import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const PatientSignup = () => {
  const navigate = useNavigate();
  
  // 1. State matching your Schema
  const [formData, setFormData] = useState({
    first_Name: '',
    last_Name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male' // Default value
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // NOTE: Ensure this endpoint matches your backend route exactly (e.g., /P_SignUp or /Patient_SignUp)
      const response = await axios.post('http://localhost:4000/P_SignUp', formData);

      if (response.data.status === 1) {
        // Redirect to Login on success so they can get the HTTP-Only cookie
        navigate('/patient/login');
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Server error during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      
      {/* --- LEFT SIDE: Visual Branding (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-teal-600 to-emerald-700 relative overflow-hidden items-center justify-center">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-white opacity-10" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-300 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 text-center px-10 text-white">
          <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Join Medicare AI</h2>
          <p className="text-teal-50 text-lg leading-relaxed mb-8">
            Create an account to access intelligent symptom analysis and connect with top-rated medical professionals instantly.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-col gap-4 items-center opacity-80">
            <div className="flex items-center gap-3">
               <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">🔒</span>
               <span className="text-sm font-medium">Secure Data Encryption</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">🏥</span>
               <span className="text-sm font-medium">Verified Doctors Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Signup Form --- */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          
          {/* Header */}
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="mt-2 text-slate-500">
              Fill in your details to register as a new patient.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-pulse">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                <input 
                  name="first_Name" 
                  type="text" 
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="John"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                <input 
                  name="last_Name" 
                  type="text" 
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="john.doe@example.com"
                onChange={handleChange}
              />
            </div>

            {/* Row 3: Age & Gender */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                <input 
                  name="age" 
                  type="number" 
                  min="0"
                  max="120"
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="25"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                <div className="relative">
                  <select 
                    name="gender" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all cursor-pointer"
                    onChange={handleChange}
                    value={formData.gender}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {/* Custom Arrow Icon */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="••••••••"
                onChange={handleChange}
              />
              <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters</p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign Up'}
            </button>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/patient/login" className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;