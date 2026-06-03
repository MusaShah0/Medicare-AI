import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WorldMap } from '../components/ui/map';



// ─── Colour tokens (3-colour rule) ───────────────────────────────────────────
// Navy  : #0A2540   — authority / trust
// Teal  : #00B4A0   — health / action
// Chalk : #F4F7F9   — background / space

const ASSETS = {
  logo : '/content/logo_transparent.png',
  d1   : '/content/docn.jpeg',
  d2   : '/content/d2.jpg',
  d3   : '/content/bb.jpeg',
  d4   : '/content/d4.jpeg',
  d5   : '/content/d5.jpeg',
  d9   : '/content/d2_processed.jpg',
  dco12: '/content/dco12.jpeg',
  m1   : '/content/m1.jpg',
  m2   : '/content/m2.jpg',
  c1   : '/content/c1.jpg',
  c2   : '/content/c2.jpg',
};

// ─── Services ────────────────────────────────────────────────────────────────
const PATIENT_SERVICES = [
  {
    img     : ASSETS.c1,
    imgPos  : 'center center',
    title   : 'AI Symptom Analysis',
    desc    : 'Describe your symptoms in plain language, just as you would to a doctor. Our RAG-powered AI engine instantly cross-references verified medical textbooks and clinical guidelines to deliver evidence-based insights — not generic web guesses.',
    bullets : [
      'Multi-symptom analysis in seconds',
      'Evidence-based possible conditions',
      'Urgency assessment & guidance',
      'Seamless doctor referral if needed',
    ],
    cta     : 'Chat with AI',
    href    : '/patient/signup',
  },
  {
    img     : ASSETS.d1,
    imgPos  : 'center 42%',
    title   : 'Find the Right Doctor',
    desc    : 'Browse a curated network of verified healthcare professionals across every major specialty. Use intelligent filters to narrow by expertise, location, availability, and patient ratings.',
    bullets : [
      'Verified professionals across all specialties',
      'Filter by expertise, location & ratings',
      'Real-time availability & scheduling',
      'Book with complete confidence',
    ],
    cta     : 'Browse Doctors',
    href    : '/patient/signup',
  },
  {
    img  : ASSETS.m1,
    imgFit: 'contain',
    title: 'Book in Seconds',
    desc : 'Say goodbye to endless phone calls and waiting room delays. View real-time availability for any specialist, pick a time that works for you, and receive instant confirmation — all in under a minute.',
    bullets : [
      'Same-day & next-day appointments',
      'Instant confirmation & reminders',
      'Calendar sync across devices',
      'Cancel or reschedule with one tap',
    ],
    cta  : 'Book Now',
    href : '/patient/signup',
  },
  {
    img  : ASSETS.m2,
    title: 'Video Consultation',
    desc : 'Connect face-to-face with your doctor from the comfort of your home, office, or anywhere in between. Our secure HD video platform is built for healthcare — end-to-end encrypted and low-bandwidth optimized.',
    bullets : [
      'End-to-end encrypted video calls',
      'Works on low-bandwidth connections',
      'No downloads or account setup needed',
      'Built-in chat & screen sharing',
    ],
    cta  : 'Get Started',
    href : '/patient/signup',
  },
  {
    img  : '/content/jj.jpeg',
    title: 'Auto-Generated Notes',
    desc : 'Every video consultation is automatically transcribed and summarized into a clear, structured health report delivered to your secure portal immediately after your session ends.',
    bullets : [
      'Auto-transcribed consultation records',
      'Structured diagnosis & medication summary',
      'Instant delivery to your health portal',
      'One-click share with family or GP',
    ],
    cta  : 'Learn More',
    href : '/patient/signup',
  },
];

const DOCTOR_SERVICES = [
  {
    img  : '/content/xx.jpeg',
    imgPos: 'center center',
    title: 'Smart Appointment Dashboard',
    desc : 'Manage your entire practice from a single, intuitive dashboard. View upcoming, ongoing, and completed appointments at a glance with color-coded status indicators and AI pre-assessment summaries.',
    bullets : [
      'Full appointment lifecycle overview',
      'AI pre-assessment before every call',
      'Color-coded status indicators',
      'Patient history at your fingertips',
    ],
    cta  : 'See Dashboard',
    href : '/doctor/signup',
  },
  {
    img  : '/content/cc.jpeg',
    imgFit: 'contain',
    title: 'Integrated Video Calls',
    desc : 'Launch HD video consultations directly from your dashboard with a single click — no third-party accounts, downloads, or plugins required. Every session is encrypted end-to-end.',
    bullets : [
      'One-click launch from dashboard',
      'End-to-end encrypted sessions',
      'Consent-based call recording',
      'Screen sharing & digital whiteboard',
    ],
    cta  : 'Explore',
    href : '/doctor/signup',
  },
  {
    img  : '/content/ee.jpeg',
    title: 'Auto Meeting Notes',
    desc : 'Every consultation is automatically transcribed in real time and processed into a structured SOAP-format clinical note — assessment, plan, prescriptions, and follow-ups.',
    bullets : [
      'Real-time transcription during calls',
      'Structured SOAP-format summaries',
      'Shared instantly with patient portal',
      'Zero manual note-taking required',
    ],
    cta  : 'Learn More',
    href : '/doctor/signup',
  },
  {
    img  : '/content/zz.jpeg',
    imgFit: 'contain',
    title: 'Patient History at a Glance',
    desc : 'Access complete, longitudinal patient histories that span every consultation — including AI summaries, recordings, notes, medications, and lab referrals for full clinical context.',
    bullets : [
      'Complete multi-visit patient timeline',
      'AI summaries & video recordings',
      'Medication & lab referral history',
      'Continuity across every follow-up',
    ],
    cta  : 'Get Started',
    href : '/doctor/signup',
  },
];

// ─── Testimonials data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name  : 'Sarah M.',
    role  : 'Patient · Lahore',
    avatar: 'S',
    avatarImg: '/content/g1.jfif',
    stars : 5,
    text  : '"The AI instantly identified my symptoms and suggested a specialist. I had a video consultation booked within minutes — something that would have taken weeks before."',
  },
  {
    name  : 'Dr. Kamran A.',
    role  : 'Cardiologist · Karachi',
    avatar: 'K',
    avatarImg: '/content/profile2.jfif',
    stars : 5,
    text  : '"MediCare AI\'s scheduling system is flawless. No double-bookings, and the pre-consultation AI summaries save me at least 10 minutes per patient."',
  },
  {
    name  : 'Fatima R.',
    role  : 'Patient · Islamabad',
    avatar: 'F',
    avatarImg: '/content/g2.jfif',
    stars : 5,
    text  : '"I live in a rural area and getting medical advice used to mean a 3-hour journey. Now I get evidence-based guidance on my phone and see a doctor via video."',
  },
  {
    name  : 'Dr. Ayesha N.',
    role  : 'General Physician · Peshawar',
    avatar: 'A',
    avatarImg: '/content/g3.jfif',
    stars : 5,
    text  : '"The auto-generated meeting notes are a game changer. Every consultation is documented automatically — no more manual record keeping after long shifts."',
  },
  {
    name  : 'Usman T.',
    role  : 'Patient · Faisalabad',
    avatar: 'U',
    avatarImg: '/content/profile3.jfif',
    stars : 5,
    text  : '"I was worried about the accuracy of AI medical advice, but MediCare uses verified medical textbooks — not random internet content. The doctor confirmed the AI\'s assessment was spot on."',
  },
  {
    name  : 'Dr. Zara H.',
    role  : 'Neurologist · Lahore',
    avatar: 'Z',
    avatarImg: '/content/profile4.jfif',
    stars : 5,
    text  : '"My patient volume doubled after joining MediCare. Patients from cities I could never reach before now book with me for video consultations."',
  },
  {
    name  : 'Bilal K.',
    role  : 'Patient · Quetta',
    avatar: 'B',
    avatarImg: '/content/profile5.jfif',
    stars : 5,
    text  : '"The consultation notes are sent to me right after the video call. I can share them with family members who care for me — incredibly helpful for ongoing treatment."',
  },
  {
    name  : 'Dr. Hassan Q.',
    role  : 'Dermatologist · Multan',
    avatar: 'H',
    avatarImg: '/content/p1.jfif',
    stars : 5,
    text  : '"Patients come to consultations already knowing their likely condition from the AI. It makes conversations more focused and allows me to spend time on treatment planning."',
  },
];

// Split into two columns for the scrolling animation
const COL_A = TESTIMONIALS.slice(0, 4);
const COL_B = TESTIMONIALS.slice(4, 8);

// ─── Star icons ───────────────────────────────────────────────────────────────
function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Single testimonial card ──────────────────────────────────────────────────
function TestiCard({ item }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-4 flex-shrink-0">
      <Stars n={item.stars} />
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.text}</p>
      <div className="flex items-center gap-3">
        {item.avatarImg ? (
          <img src={item.avatarImg} alt={item.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#0A2540] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {item.avatar}
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-[#0A2540]">{item.name}</p>
          <p className="text-xs text-slate-400">{item.role}</p>
                </div>
              </div>
            </div>
  );
}

// ─── Scrolling column ─────────────────────────────────────────────────────────
// direction: 'up' | 'down'
function ScrollColumn({ items, direction }) {
  const doubled = [...items, ...items]; // seamless loop
  return (
    <div className="overflow-hidden h-[520px] relative">
      {/* Fade edges */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#F4F7F9] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F4F7F9] to-transparent z-10 pointer-events-none" />

      <div
        className={direction === 'up' ? 'scroll-up' : 'scroll-down'}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {doubled.map((item, i) => (
          <TestiCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}



// ─── How-it-works SVG icons ───────────────────────────────────────────────────
const HOW_ICONS = [
  // Chat / message
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5" />
  </svg>,
  // Brain / AI
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M9.5 2a2.5 2.5 0 00-2.45 2H6a3 3 0 00-3 3 3 3 0 001.5 2.6V11a3 3 0 003 3h.5v1.5a1.5 1.5 0 003 0V14h.5a3 3 0 003-3v-1.4A3 3 0 0016 7a3 3 0 00-3-3h-1.05A2.5 2.5 0 009.5 2z" />
    <path d="M6.5 9.5h1M16.5 9.5h1M9.5 12.5v1M14.5 12.5v1" strokeWidth="2" />
  </svg>,
  // Stethoscope
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M4.5 6.375a4.125 4.125 0 008.25 0" />
    <path d="M8.625 6.375V10.5a5.625 5.625 0 0011.25 0v-1.125" />
    <circle cx="19.875" cy="8.25" r="1.125" />
    <path d="M8.625 10.5a3.375 3.375 0 006.75 0" />
  </svg>,
  // Clipboard / notes
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>,
];

// ─── Main component ───────────────────────────────────────────────────────────
const Home = () => {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [bgLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [serviceTab, setServiceTab] = useState('patient');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const carouselServices = serviceTab === 'patient' ? PATIENT_SERVICES : DOCTOR_SERVICES;
  const activeService = carouselServices[activeIdx];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      const services = serviceTab === 'patient' ? PATIENT_SERVICES : DOCTOR_SERVICES;
      if (activeIdx >= services.length - 1) {
        setServiceTab(serviceTab === 'patient' ? 'doctor' : 'patient');
        setActiveIdx(0);
      } else {
        setActiveIdx(prev => prev + 1);
      }
    }, 4000);
    return () => clearInterval(t);
  }, [paused, serviceTab, activeIdx]);

  return (
    <div className="font-sans text-slate-800 bg-[#F4F7F9] overflow-x-hidden">

      {/* ── Global animation styles ── */}
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .anim-fadeup  { animation: fadeUp .65s ease both; }
        .anim-d1      { animation-delay:.1s; }
        .anim-d2      { animation-delay:.22s; }
        .anim-d3      { animation-delay:.34s; }
        .anim-d4      { animation-delay:.46s; }

        /* Testimonial scroll — card height ≈ 160px × 4 cards = 640px per set */
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .scroll-up   { animation: scrollUp   28s linear infinite; }
        .scroll-down { animation: scrollDown 28s linear infinite; }
        .scroll-up:hover,
        .scroll-down:hover { animation-play-state: paused; }

        @keyframes mockupDot {
          0%, 28%   { opacity: 1; background: #00B4A0; }
          33.33%    { opacity: 0.15; background: white; }
          100%      { opacity: 0.15; background: white; }
        }
        .animate-mockup-dot {
          animation: mockupDot 9s ease-in-out infinite;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ════════════════════════════════ NAVBAR ═════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">

          <Link to="/" className="flex items-center gap-1.5 group">
            <span className={`text-[22px] font-extrabold tracking-tight transition-colors ${scrolled ? 'text-[#0A2540]' : 'text-white'}`}>
              Medicare<span className="text-[#00B4A0]">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[['#services','Services'],['#how-it-works','How It Works'],['#for-doctors','For Doctors']].map(([href, label]) => (
              <a key={href} href={href}
                className={`text-sm font-semibold transition hover:text-[#00B4A0] ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>
                {label}
              </a>
            ))}
            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
              <Link to="/login" className={`text-sm font-bold transition hover:text-[#00B4A0] ${scrolled ? 'text-slate-700' : 'text-white'}`}>Login</Link>
              <Link to="/patient/signup" className="px-5 py-2.5 rounded-xl bg-[#00B4A0] text-white text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>

          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            <svg className={`w-6 h-6 ${scrolled ? 'text-slate-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-5 flex flex-col gap-4 shadow-xl">
            <a href="#services"     onClick={() => setMobileOpen(false)} className="text-base font-semibold text-slate-700">Services</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-base font-semibold text-slate-700">How It Works</a>
            <a href="#for-doctors"  onClick={() => setMobileOpen(false)} className="text-base font-semibold text-slate-700">For Doctors</a>
            <hr className="border-slate-100" />
            <Link to="/login"          className="text-base font-bold text-[#00B4A0]">Login</Link>
            <Link to="/patient/signup" className="block text-center bg-[#0A2540] text-white py-3 rounded-xl font-bold text-sm">Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════ HERO ════════════════════════════════ */}
      <header className="relative min-h-screen flex items-center bg-[#0A2540] overflow-hidden">

        {/* Background glow blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#00B4A0]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* ── Left: text ── */}
            <div className="anim-fadeup">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                An Intelligent<br />
                <span className="text-[#00B4A0]">Health Support</span><br />
                System
              </h1>

              <p className="text-lg text-white/65 leading-relaxed max-w-[500px] mb-10">
                From AI symptom analysis to verified specialist video consultations — MediCare bridges the healthcare gap in developing regions with evidence-based RAG technology and verified medical knowledge.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/patient/signup"
                  className="px-8 py-4 rounded-xl bg-[#00B4A0] text-white font-bold text-sm shadow-xl shadow-teal-500/30 hover:bg-teal-400 transition hover:-translate-y-0.5">
                  Start as Patient
                </Link>
                <Link to="/doctor/signup"
                  className="px-8 py-4 rounded-xl border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition">
                  Join as Doctor
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-14 flex flex-wrap gap-10">
                {[['24 / 7','AI assistance availability'],['RAG','Evidence-based guidance'],['4-in-1','AI · Book · Video · Notes']].map(([v,l]) => (
                  <div key={v}>
                    <p className="text-2xl font-extrabold text-white">{v}</p>
                    <p className="text-xs text-white/45 mt-1 font-medium">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: AI chat preview card ── */}
            <div className="anim-fadeup anim-d2 hidden lg:flex items-center justify-center">
              <div className="w-full max-w-[420px] bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-6 shadow-2xl">

                {/* Card header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00B4A0] flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Medicare AI Assistant</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-white/50 text-[11px] font-semibold">Online · RAG-powered</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold text-white/60">
                    v3.0 Pro
                  </div>
                </div>

                {/* Chat bubbles */}
                <div className="space-y-3 mb-5">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-[#00B4A0]/20 border border-[#00B4A0]/30 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                      I have had a headache on the left side with flashing lights for 2 days.
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/15 text-white text-sm rounded-2xl rounded-tl-sm px-4 py-4 max-w-[90%] w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-3.5 h-3.5 text-[#00B4A0] animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <p className="text-[#00B4A0] text-[11px] font-bold uppercase tracking-wide">AI Analysis</p>
                      </div>
                      <p className="leading-relaxed">
                        Based on your symptoms, this is consistent with{' '}
                        <span className="text-[#00B4A0] font-semibold">Migraine with Aura</span>.
                        I recommend consulting a Neurologist.
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-white/40 text-[11px]">Evidence-based · Medical KB</span>
                        <Link to="/patient/signup" className="text-[11px] bg-[#00B4A0] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-teal-400 transition">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════ SERVICES ════════════════════════════════ */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">One Platform. Two Portals.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Whether you're seeking care or delivering it, MediCare AI is built for you.
            </p>
          </div>

          {/* Primary tabs: For Patients / For Doctors */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl bg-[#F4F7F9] p-1 border border-slate-200">
              {[['patient','For Patients'],['doctor','For Doctors']].map(([tab, label]) => (
                <button key={tab} onClick={() => { setServiceTab(tab); setActiveIdx(0); }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    serviceTab === tab ? 'bg-[#0A2540] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel grid */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: service tabs + content */}
            <div>
              {/* Content area — fades in on service change */}
              <div key={activeIdx} className="anim-fadeup">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] leading-tight">
                  {activeService.title}
                </h3>
                <p className="text-slate-500 mt-4 leading-relaxed">{activeService.desc}</p>
                {activeService.bullets && (
                  <ul className="mt-5 space-y-2.5">
                    {activeService.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <svg className="w-4 h-4 mt-0.5 text-[#00B4A0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <Link to={activeService.href}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-[#00B4A0] text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition hover:-translate-y-0.5">
                  {activeService.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Image carousel */}
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-900/5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {carouselServices.map((s, imgIdx) => (
                    <div key={imgIdx}
                      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                      style={{ opacity: imgIdx === activeIdx ? 1 : 0 }}>
                      {s.imgFit === 'contain' && (
                        <div className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
                          style={{ backgroundImage: `url(${s.img})` }} />
                      )}
                      <img src={s.img} alt={s.title}
                        className="w-full h-full relative z-10"
                        style={{ objectFit: s.imgFit || 'cover', objectPosition: s.imgPos || 'center center' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image indicators + nav */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-2 flex-1">
                  {carouselServices.map((_, i) => (
                    <button key={i} onClick={() => setActiveIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeIdx ? 'bg-[#00B4A0] w-8' : 'bg-slate-200 w-4 hover:bg-slate-300'
                      }`} />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setActiveIdx(prev => (prev - 1 + carouselServices.length) % carouselServices.length)}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#00B4A0] hover:bg-[#00B4A0]/5 flex items-center justify-center transition-all cursor-pointer">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={() => setActiveIdx(prev => (prev + 1) % carouselServices.length)}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#00B4A0] hover:bg-[#00B4A0]/5 flex items-center justify-center transition-all cursor-pointer">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            {serviceTab === 'patient' ? (
              <Link to="/patient/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00B4A0] text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition hover:-translate-y-0.5">
                Create Patient Account
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
              </Link>
            ) : (
              <Link to="/doctor/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0A2540] text-white font-bold text-sm shadow-lg hover:bg-slate-800 transition hover:-translate-y-0.5">
                Join as a Doctor
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ TESTIMONIALS ════════════════════════════ */}
      <section className="py-24 bg-[#F4F7F9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Trusted by Patients & Doctors</h2>
            <p className="text-slate-500 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              See what healthcare professionals and patients across the region are saying about MediCare AI.
            </p>
          </div>

          {/* Two scrolling columns */}
          <div className="grid md:grid-cols-2 gap-6 overflow-hidden">
            <ScrollColumn items={COL_A} direction="up"   />
            <ScrollColumn items={COL_B} direction="down" />
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════ CTA ═════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <div className="bg-gradient-to-br from-[#0A2540] to-[#0d3060] rounded-3xl p-12 sm:p-16 relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00B4A0]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-900/30 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-4">Start Today</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
                Your health deserves<br />intelligent support.
              </h2>
              <p className="text-white/55 mb-10 max-w-lg mx-auto leading-relaxed text-sm">
                Join thousands who have already taken control of their healthcare journey with evidence-based AI guidance and seamless access to verified specialists.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/patient/signup"
                  className="px-8 py-4 rounded-xl bg-[#00B4A0] text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition hover:-translate-y-0.5">
                  Get Started Free
                </Link>
                <Link to="/login"
                  className="px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition">
                  I Have an Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ FOOTER ═════════════════════════════════ */}
      <footer className="bg-[#0A2540] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 pb-12 border-b border-white/10">

            <div className="col-span-2">
              <div className="mb-4">
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Medicare<span className="text-[#00B4A0]">AI</span>
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-[240px]">
                An intelligent health support system bridging the gap between patients and qualified doctors across developing regions.
              </p>
              <p className="mt-5 text-xs font-bold text-[#00B4A0] uppercase tracking-widest">
                An Intelligent Health Support System
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Patients</h4>
              <ul className="space-y-2.5 text-sm text-white/45">
                <li><Link to="/patient/signup" className="hover:text-[#00B4A0] transition">Sign Up</Link></li>
                <li><Link to="/login"          className="hover:text-[#00B4A0] transition">Login</Link></li>
                <li><Link to="/patient/signup" className="hover:text-[#00B4A0] transition">Chat with AI</Link></li>
                <li><Link to="/patient/signup" className="hover:text-[#00B4A0] transition">Find Doctors</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Doctors</h4>
              <ul className="space-y-2.5 text-sm text-white/45">
                <li><Link to="/doctor/signup" className="hover:text-[#00B4A0] transition">Join Network</Link></li>
                <li><Link to="/login"         className="hover:text-[#00B4A0] transition">Doctor Login</Link></li>
                <li><Link to="/doctor/signup" className="hover:text-[#00B4A0] transition">Manage Schedule</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-white/45">
                <li><a href="#how-it-works" className="hover:text-[#00B4A0] transition">How It Works</a></li>
                <li><a href="#services"     className="hover:text-[#00B4A0] transition">Services</a></li>
                <li><a href="#for-doctors"  className="hover:text-[#00B4A0] transition">For Doctors</a></li>
                <li><a href="#"             className="hover:text-[#00B4A0] transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} MediCare AI. All rights reserved.</p>
            <p className="text-xs text-white/20">AI-generated content is informational only and does not constitute medical advice.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
