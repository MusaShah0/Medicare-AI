import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-slate-800 bg-slate-50 selection:bg-teal-500 selection:text-white overflow-x-hidden relative">
      
      {/* --- CUSTOM CSS FOR ANIMATIONS --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl text-white shadow-lg shadow-teal-500/30 group-hover:scale-105 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Medicare<span className="text-teal-600">AI</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition">How it Works</a>
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition">Features</a>
              
              <div className="flex items-center gap-4 pl-6 border-l border-slate-300/50">
                <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-teal-600 transition">
                  Login
                </Link>
                <Link to="/doctor/signup" className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  Doctor Access
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-teal-600 p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 w-full bg-white border-b border-slate-100 p-6 shadow-2xl flex flex-col space-y-4 animate-fade-in-down z-40">
             <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-600">How it Works</a>
             <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-600">Features</a>
             <hr className="border-slate-100"/>
             <Link to="/login" className="text-lg font-medium text-teal-600">Login as Patient</Link>
             <Link to="/doctor/signup" className="block text-center w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Doctor Portal</Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gradient-to-b from-teal-100/40 to-emerald-100/40 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 left-0 -ml-20 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-teal-100 shadow-sm text-teal-700 text-xs font-bold uppercase tracking-wider mb-8 hover:scale-105 transition-transform cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Next-Gen Healthcare AI
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Healthcare that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600">
                  Understands You.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Stop Googling symptoms. Chat with our intelligent medical AI to get accurate assessments and instantly book the right specialist.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/patient/signup" className="group px-8 py-4 rounded-xl bg-teal-600 text-white font-bold text-lg shadow-xl shadow-teal-500/30 hover:bg-teal-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                  Check Symptoms
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </Link>
                <Link to="/doctors" className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md">
                  Browse Doctors
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-500">
                 {/* Simple SVGs representing partners/standards */}
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover"/>
                      </div>
                    ))}
                 </div>
                 <div className="text-sm font-medium text-slate-500">
                   <strong className="text-slate-900">2,000+</strong> Patients Helped
                 </div>
              </div>
            </div>

            {/* Right: The "Visual" */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-full order-1 lg:order-2">
              
              {/* Main Glass Card */}
              <div className="glass-panel rounded-[2rem] p-6 md:p-8 shadow-2xl relative z-10 animate-float">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">⚡️</div>
                      <div>
                        <h3 className="font-bold text-slate-800">AI Assistant</h3>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Online</span>
                        </div>
                      </div>
                   </div>
                   <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                     v3.0 Pro
                   </div>
                </div>

                {/* Chat Interface */}
                <div className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-slate-800 text-white rounded-2xl rounded-tr-sm px-5 py-3 text-sm max-w-[90%] shadow-lg">
                      My head hurts on the left side and I see flashing lights.
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start w-full">
                     <div className="bg-white border border-teal-100 rounded-2xl rounded-tl-sm p-4 w-full shadow-sm relative overflow-hidden">
                       <div className="flex items-center gap-2 mb-2 text-teal-600">
                         <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         <span className="text-xs font-bold uppercase tracking-wide">Analyzing Symptoms...</span>
                       </div>
                       <p className="text-slate-700 text-sm font-medium leading-relaxed">
                         Symptoms suggest <span className="text-teal-700 bg-teal-50 px-1 rounded">Migraine with Aura</span>.
                       </p>
                       <p className="text-slate-500 text-xs mt-2">
                         Recommended: Consult a Neurologist immediately.
                       </p>
                       
                       {/* Action Button */}
                       <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 border border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-slate-300 border border-white"></div>
                          </div>
                          <button className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold shadow hover:bg-teal-700 transition">Book Neurologist</button>
                       </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Floating Element: Heart Rate */}
              <div className="absolute top-1/2 -right-6 md:-right-12 glass-panel p-4 rounded-2xl shadow-xl animate-float-delayed z-20">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-full text-red-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Heart Rate</p>
                    <p className="text-lg font-bold text-slate-900">72 <span className="text-xs text-slate-400 font-normal">bpm</span></p>
                  </div>
                </div>
              </div>

              {/* Floating Element: Secure */}
              <div className="absolute -bottom-6 -left-4 md:-left-8 bg-slate-900 text-white p-4 rounded-xl shadow-2xl animate-float z-20 flex items-center gap-3 max-w-[180px]">
                 <div className="p-1.5 rounded-full bg-green-500/20 text-green-400">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <p className="font-bold text-sm">HIPAA Compliant</p>
                    <p className="text-[10px] text-slate-400">100% Secure Data</p>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-3">Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">From Symptom to Solution</h3>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-teal-200 to-slate-200 z-0"></div>

            {[
              { 
                emoji: "🗣️", 
                title: "Describe Symptoms", 
                desc: "Chat naturally with our AI. It asks relevant follow-up questions just like a real doctor." 
              },
              { 
                emoji: "🧠", 
                title: "AI Analysis", 
                desc: "Our model references verified medical literature to identify potential conditions accurately." 
              },
              { 
                emoji: "🩺", 
                title: "Get Treated", 
                desc: "Instantly connect with the right specialist near you for an in-person or video visit." 
              }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 group text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-teal-500/20 group-hover:border-teal-100 transition duration-300">
                  <span className="text-4xl filter drop-shadow-sm">{step.emoji}</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
                <p className="text-slate-500 leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div>
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8 rotate-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Science, meet Speed.</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We don't just guess. Medicare AI utilizes <strong>Retrieval-Augmented Generation (RAG)</strong> to cross-reference your symptoms against thousands of verified medical journals and case studies in real-time.
              </p>
              
              <ul className="space-y-4">
                {['Verified Medical Sources', '24/7 Availability', 'Seamless Appointment Booking'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium p-3 rounded-lg hover:bg-white hover:shadow-sm transition">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right Cards */}
            <div className="grid gap-6">
              {[
                { title: "Real-Time Booking", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", desc: "View live doctor availability." },
                { title: "Secure Video Calls", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", desc: "HD telemedicine integrated." },
                { title: "Encrypted Records", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", desc: "Your health data stays private." }
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-lg hover:border-teal-100 transition duration-300">
                   <div className="text-teal-500 bg-teal-50 p-3 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}></path></svg>
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900">{card.title}</h4>
                     <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
                   </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* --- DOCTOR CTA (Dark Theme) --- */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        {/* Background Noise & Effects */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[128px] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Are you a Medical Professional?</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Join the Medicare AI network. Streamline your practice with our dedicated <strong>Doctor Portal</strong> and connect with patients who truly need your expertise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/doctor/signup" className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 px-8 rounded-xl shadow-lg shadow-teal-500/20 transition transform hover:-translate-y-1">
                  Join Network
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center bg-transparent border border-slate-600 text-white hover:bg-slate-700 font-bold py-4 px-8 rounded-xl transition">
                  Doctor Login
                </Link>
              </div>
            </div>
            
            {/* Graphic */}
            <div className="md:w-5/12 w-full relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl blur opacity-30"></div>
               <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                    <div className="space-y-2">
                       <div className="h-2 w-24 bg-slate-700 rounded"></div>
                       <div className="h-2 w-16 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-full bg-slate-800 rounded-lg border border-slate-700 flex items-center px-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <div className="h-2 w-20 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-12 w-full bg-slate-800 rounded-lg border border-slate-700 flex items-center px-4">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mr-3"></div>
                      <div className="h-2 w-32 bg-slate-700 rounded"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <div className="w-6 h-6 bg-teal-500 rounded-md"></div>
                 Medicare<span className="text-teal-600">AI</span>
              </span>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed max-w-xs">
                Empowering patients and doctors with intelligent, data-driven healthcare solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Patient</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/ai-chat" className="hover:text-teal-600 transition">Check Symptoms</Link></li>
                <li><Link to="/" className="hover:text-teal-600 transition">Find a Doctor</Link></li>
                <li><Link to="/patient/login" className="hover:text-teal-600 transition">My Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Doctor</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/login" className="hover:text-teal-600 transition">Portal Login</Link></li>
                <li><Link to="/doctor/signup" className="hover:text-teal-600 transition">Join Network</Link></li>
              </ul>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4">Support</h4>
               <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-teal-600 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-600 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-600 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Medicare AI Project. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;