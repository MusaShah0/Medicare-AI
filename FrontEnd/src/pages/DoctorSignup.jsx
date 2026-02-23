import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 👇 1. Receive setRole from App.jsx
const DoctorSignup = ({ setRole }) => {
  // --- CONFIGURATION ---
  const API_URL = 'http://localhost:4000/D_SignUp';
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    first_Name: '',
    last_Name: '',
    email: '',
    ph: '',
    password: '',
    speciality: '',
  });

  const [degrees, setDegrees] = useState([]); 
  const [degreeInput, setDegreeInput] = useState(''); 
  const [file, setFile] = useState(null); 
  const [preview, setPreview] = useState(null); 
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const addDegree = () => {
    const trimmed = degreeInput.trim();
    if (trimmed && !degrees.includes(trimmed)) {
      setDegrees([...degrees, trimmed]);
      setDegreeInput('');
    }
  };

  const removeDegree = (indexToRemove) => {
    setDegrees(degrees.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      addDegree();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (degrees.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one qualification (e.g., MBBS).' });
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('degrees', JSON.stringify(degrees)); 
      if (file) data.append('profile_Picture', file);

      // 👇 2. Add withCredentials so the cookie is saved
      const response = await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Registration Successful! Entering Dashboard...' });
        
        // 👇 3. Update Global State & Navigate immediately
        if(response.data.login) {
            setRole('doctor');
            localStorage.setItem('doctorName', formData.first_Name);
            localStorage.setItem('doctorSpeciality', formData.speciality);
            
            setTimeout(() => navigate('/doctor-dashboard'), 1500); // Go to Dashboard
        } else {
            // Fallback if login flag missing
            setTimeout(() => navigate('/login'), 2000);
        }
      }

    } catch (error) {
      console.error('Signup Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div className="hidden lg:flex w-5/12 bg-teal-700 relative overflow-hidden flex-col justify-center px-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-8 border border-white/20">
                <svg className="w-8 h-8 text-teal-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">Join Our <br/> Network</h1>
            <p className="text-teal-100 text-lg font-light leading-relaxed mb-8">
                Connect with thousands of patients, manage your schedule effortlessly, and grow your practice with our digital tools.
            </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 py-12 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
          
          <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-800">Create Doctor Profile</h2>
              <p className="text-slate-500 mt-2">Enter your credentials to start accepting appointments.</p>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div className={`p-4 mb-8 rounded-xl text-sm font-medium flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.type === 'error' ? '⚠️' : '✅'} {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Profile Picture */}
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative group cursor-pointer">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${preview ? 'border-white shadow-lg' : 'border-slate-100 border-dashed bg-slate-50'} transition-all duration-300 relative`}>
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-teal-600 transition-colors">
                                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span className="text-xs font-bold uppercase">Upload</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <span className="text-white text-xs font-bold">Change</span>
                        </div>
                    </div>
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/jpg" />
                </div>
                <p className="text-xs text-slate-400 mt-2">Recommended: Square JPG/PNG</p>
            </div>

            {/* 2. Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">First Name</label>
                <input required type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} placeholder="e.g. John"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Last Name</label>
                <input required type="text" name="last_Name" value={formData.last_Name} onChange={handleChange} placeholder="e.g. Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" />
              </div>
            </div>

            {/* 3. Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="doctor@hospital.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Phone Number</label>
                    <input required type="tel" name="ph" value={formData.ph} onChange={handleChange} placeholder="+1 234 567 890"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" />
                </div>
            </div>

            {/* 4. Speciality */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Speciality</label>
              <div className="relative">
                <select required name="speciality" value={formData.speciality} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition appearance-none font-medium text-slate-700">
                    <option value="">Select your area of expertise...</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="General Surgeon">General Surgeon</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Orthopedic">Orthopedic</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* 5. Qualifications */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Qualifications / Degrees</label>
              <div className="min-h-[56px] px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition flex flex-wrap gap-2 items-center">
                {degrees.map((deg, index) => (
                  <span key={index} className="bg-white border border-teal-200 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
                    {deg}
                    <button type="button" onClick={() => removeDegree(index)} className="hover:text-red-500 focus:outline-none flex items-center justify-center bg-teal-50 hover:bg-red-50 rounded-full w-4 h-4 transition-colors">
                         &times;
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={degreeInput} 
                  onChange={(e) => setDegreeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={degrees.length > 0 ? "Add another..." : "Type degree (e.g. MBBS) & press Enter"}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 px-2 min-w-[150px]" 
                />
                <button type="button" onClick={addDegree} className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-colors ${degreeInput.trim() ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Add
                </button>
              </div>
            </div>

            {/* 6. Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Password</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a secure password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-slate-300 font-medium text-slate-700" />
            </div>

            {/* 7. Submit */}
            <div className="pt-4">
                <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-teal-500/20 transition-all duration-300 transform 
                    ${loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-1 active:scale-95'}`}
                >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating Profile...
                    </span>
                ) : 'Complete Registration'}
                </button>
            </div>
            
            <div className="text-center">
                <p className="text-sm text-slate-500">
                Already registered? <a href="/login" className="text-teal-600 font-bold hover:underline">Sign in to Dashboard</a>
                </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;