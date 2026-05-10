import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorSignup = ({ setRole }) => {
  const API_URL = 'http://localhost:4000/D_SignUp';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_Name: '',
    last_Name: '',
    email: '',
    ph: '',
    password: '',
    speciality: '',
    experience: '',
    licenseNumber: '',
  });

  const [degrees, setDegrees] = useState([]);
  const [degreeInput, setDegreeInput] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [degreeFile, setDegreeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleDegreeFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setDegreeFile(f);
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
    if (e.key === 'Enter' || e.key === ',') {
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
    if (!degreeFile) {
      setMessage({ type: 'error', text: 'Please upload your degree / licence document.' });
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append('degrees', JSON.stringify(degrees));
      if (file) data.append('profile_Picture', file);
      data.append('degreeFile', degreeFile);

      const response = await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] text-slate-700 outline-none transition bg-slate-50 focus:bg-white';
  const labelCls = 'block text-sm font-bold text-[#0A2540] mb-1.5';

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center fade-up">
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.55s ease both}`}</style>
          <div className="w-20 h-20 rounded-full bg-[#00B4A0]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0A2540] mb-3">Request Forwarded!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your registration request has been submitted for admin review. Our team will verify your licence and degree documents. You will be notified via the login page once your account is approved.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-7 text-left flex gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-700 text-xs font-medium leading-relaxed">
              Please do <span className="font-bold">not</span> register again with the same email. Your request is under process — kindly wait for approval.
            </p>
          </div>
          <a href="/login" className="inline-block w-full py-3 rounded-xl bg-[#0A2540] text-white font-bold text-sm hover:bg-slate-800 transition">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.55s ease both; }
        @keyframes chipIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .chip-in { animation: chipIn 0.2s ease both; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A2540] relative overflow-hidden flex-col justify-between p-14">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.04,
          }}
        />
        <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] bg-[#00B4A0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[400px] h-[400px] bg-[#00B4A0]/8 rounded-full blur-[100px]" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            Medicare<span className="text-[#00B4A0]">AI</span>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-4">Doctor Registration</p>
          <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Join our network<br />of top doctors.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Connect with thousands of patients, manage your schedule effortlessly, and grow your practice with our intelligent platform.
          </p>

          <ul className="space-y-4 mb-12">
            {[
              'Manage schedule with 15-min precision',
              'AI pre-assessment summaries per patient',
              'Integrated secure video consultations',
              'Auto-generated post-call clinical notes',
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

          <div className="flex gap-8">
            {[
              { value: '500+', label: 'Doctors Active' },
              { value: '10k+', label: 'Appointments' },
              { value: '4.9★', label: 'Avg Rating' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <svg viewBox="0 0 400 40" className="w-full opacity-10" preserveAspectRatio="none">
            <path d="M0,20 C100,40 300,0 400,20 L400,40 L0,40 Z" fill="#00B4A0" />
          </svg>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 bg-[#F4F7F9] flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 sm:p-10 fade-up">
            {/* Logo */}
            <div className="mb-6 text-center">
              <span className="text-2xl font-extrabold tracking-tight text-[#0A2540]">
                Medicare<span className="text-[#00B4A0]">AI</span>
              </span>
            </div>

            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-2 text-center">Doctor Portal</p>
            <h1 className="text-3xl font-extrabold text-[#0A2540] tracking-tight text-center mb-1">Create Doctor Profile</h1>
            <p className="text-slate-500 text-sm text-center mb-7">Enter your details to start accepting appointments.</p>

            {/* Alert */}
            {message.text && (
              <div
                className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}
              >
                {message.type === 'error' ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer mb-1">
                  <div
                    className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 relative ${
                      preview ? 'border-[#00B4A0] shadow-lg shadow-[#00B4A0]/20' : 'border-slate-200 border-dashed bg-slate-50'
                    }`}
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-[#00B4A0] transition-colors">
                        <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-bold uppercase">Upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <span className="text-white text-xs font-bold">Change</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </div>
                <p className="text-xs text-slate-400">Profile photo (JPG/PNG)</p>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      required
                      type="text"
                      name="first_Name"
                      value={formData.first_Name}
                      onChange={handleChange}
                      placeholder="John"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      required
                      type="text"
                      name="last_Name"
                      value={formData.last_Name}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@hospital.com"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Phone & Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <input
                      required
                      type="tel"
                      name="ph"
                      value={formData.ph}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Experience (yrs)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <input
                      type="number"
                      name="experience"
                      min="0"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Speciality */}
              <div>
                <label className={labelCls}>Speciality</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  <select
                    required
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00B4A0] focus:border-[#00B4A0] text-slate-700 outline-none transition bg-slate-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select your speciality...</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="General Surgeon">General Surgeon</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className={labelCls}>Medical Licence Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </span>
                  <input
                    required
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. PMDC-12345"
                    className={inputCls}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">The admin will verify this against official licensing records.</p>
              </div>

              {/* Degree / Certificate Upload */}
              <div>
                <label className={labelCls}>Degree / Licence Document <span className="text-red-400">*</span></label>
                <label className={`flex items-center gap-4 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  degreeFile ? 'border-[#00B4A0] bg-[#00B4A0]/5' : 'border-slate-200 bg-slate-50 hover:border-[#00B4A0]/50'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    degreeFile ? 'bg-[#00B4A0]/15 text-[#00B4A0]' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    {degreeFile ? (
                      <>
                        <p className="text-sm font-bold text-[#00B4A0] truncate">{degreeFile.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{(degreeFile.size / 1024).toFixed(1)} KB · Click to change</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-600">Upload your degree or licence</p>
                        <p className="text-xs text-slate-400 mt-0.5">PDF, JPG or PNG — max 10 MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDegreeFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Degrees Tag Input */}
              <div>
                <label className={labelCls}>
                  Qualifications / Degrees
                  <span className="text-xs font-normal text-slate-400 ml-2">Press Enter or comma to add</span>
                </label>
                <div className="min-h-[52px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4A0] focus-within:border-[#00B4A0] transition flex flex-wrap gap-2 items-center">
                  {degrees.map((deg, index) => (
                    <span
                      key={index}
                      className="chip-in bg-[#00B4A0]/10 border border-[#00B4A0]/30 text-[#0A2540] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      {deg}
                      <button
                        type="button"
                        onClick={() => removeDegree(index)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors leading-none"
                        aria-label="Remove"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={degreeInput}
                    onChange={(e) => setDegreeInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={degrees.length > 0 ? 'Add another...' : 'Type degree (e.g. MBBS) & press Enter'}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 px-1 min-w-[140px] py-1"
                  />
                  {degreeInput.trim() && (
                    <button
                      type="button"
                      onClick={addDegree}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00B4A0] text-white hover:bg-teal-400 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
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
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Profile...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already registered?{' '}
              <a href="/login" className="font-bold text-[#00B4A0] hover:text-teal-400 transition">
                Sign in to Dashboard
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;
