import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── Colour tokens (3-colour rule) ───────────────────────────────────────────
// Navy  : #0A2540   — authority / trust
// Teal  : #00B4A0   — health / action
// Chalk : #F4F7F9   — background / space

const ASSETS = {
  logo : '/content/l1.png',
  d1   : '/content/d1.jpg',
  d2   : '/content/d2.jpg',
  d3   : '/content/d3.jpg',
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
    desc    : 'Describe your symptoms in plain language. Our RAG-powered AI references verified medical textbooks to give evidence-based guidance — not guesses.',
    cta     : 'Chat with AI',
    href    : '/patient/signup',
  },
  {
    img     : ASSETS.d1,
    imgPos  : 'center 65%',
    title   : 'Find the Right Doctor',
    desc    : 'Filter specialists by specialty and availability. Every profile is verified so you connect with the right expert on the first try.',
    cta     : 'Browse Doctors',
    href    : '/patient/signup',
  },
  {
    img  : ASSETS.m1,
    title: 'Book in Seconds',
    desc : 'View real-time slot availability and book a confirmed appointment instantly. No phone calls, no waiting rooms.',
    cta  : 'Book Now',
    href : '/patient/signup',
  },
  {
    img  : ASSETS.m2,
    title: 'Video Consultation',
    desc : 'Attend your consultation from anywhere. Secure HD video calls connect you with your doctor without leaving home.',
    cta  : 'Get Started',
    href : '/patient/signup',
  },
  {
    img  : ASSETS.c2,
    title: 'Auto-Generated Notes',
    desc : 'Every consultation is transcribed and summarised automatically. Access your personalised health report immediately after your session.',
    cta  : 'Learn More',
    href : '/patient/signup',
  },
];

const DOCTOR_SERVICES = [
  {
    img  : ASSETS.d2,
    title: 'Manage Your Schedule',
    desc : 'Define availability with 15-minute precision. Slots are automatically blocked the moment a patient books — zero double-bookings.',
    cta  : 'Join Network',
    href : '/doctor/signup',
  },
  {
    img  : ASSETS.d3,
    title: 'Smart Appointment Dashboard',
    desc : 'See upcoming, ongoing, and completed appointments in one place. Patient AI pre-assessment summaries arrive before you even join the call.',
    cta  : 'See Dashboard',
    href : '/doctor/signup',
  },
  {
    img  : ASSETS.m1,
    title: 'Integrated Video Calls',
    desc : 'Start secure, recorded consultations directly from your dashboard — no third-party app required.',
    cta  : 'Explore',
    href : '/doctor/signup',
  },
  {
    img  : ASSETS.m2,
    title: 'Auto Meeting Notes',
    desc : 'Audio is transcribed and summarised into a structured consultation note for both you and your patient — so you can focus on care, not paperwork.',
    cta  : 'Learn More',
    href : '/doctor/signup',
  },
  {
    img  : ASSETS.c2,
    title: 'Patient History at a Glance',
    desc : 'Persistent consultation records give you complete context for every follow-up visit, improving continuity of care.',
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
    stars : 5,
    text  : '"The AI instantly identified my symptoms and suggested a specialist. I had a video consultation booked within minutes — something that would have taken weeks before."',
  },
  {
    name  : 'Dr. Kamran A.',
    role  : 'Cardiologist · Karachi',
    avatar: 'K',
    stars : 5,
    text  : '"MediCare AI\'s scheduling system is flawless. No double-bookings, and the pre-consultation AI summaries save me at least 10 minutes per patient."',
  },
  {
    name  : 'Fatima R.',
    role  : 'Patient · Islamabad',
    avatar: 'F',
    stars : 5,
    text  : '"I live in a rural area and getting medical advice used to mean a 3-hour journey. Now I get evidence-based guidance on my phone and see a doctor via video."',
  },
  {
    name  : 'Dr. Ayesha N.',
    role  : 'General Physician · Peshawar',
    avatar: 'A',
    stars : 5,
    text  : '"The auto-generated meeting notes are a game changer. Every consultation is documented automatically — no more manual record keeping after long shifts."',
  },
  {
    name  : 'Usman T.',
    role  : 'Patient · Faisalabad',
    avatar: 'U',
    stars : 5,
    text  : '"I was worried about the accuracy of AI medical advice, but MediCare uses verified medical textbooks — not random internet content. The doctor confirmed the AI\'s assessment was spot on."',
  },
  {
    name  : 'Dr. Zara H.',
    role  : 'Neurologist · Lahore',
    avatar: 'Z',
    stars : 5,
    text  : '"My patient volume doubled after joining MediCare. Patients from cities I could never reach before now book with me for video consultations."',
  },
  {
    name  : 'Bilal K.',
    role  : 'Patient · Quetta',
    avatar: 'B',
    stars : 5,
    text  : '"The consultation notes are sent to me right after the video call. I can share them with family members who care for me — incredibly helpful for ongoing treatment."',
  },
  {
    name  : 'Dr. Hassan Q.',
    role  : 'Dermatologist · Multan',
    avatar: 'H',
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
        <div className="w-9 h-9 rounded-full bg-[#0A2540] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {item.avatar}
        </div>
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

// ─── Carousel ─────────────────────────────────────────────────────────────────
function ServiceCarousel({ items }) {
  const [current, setCurrent] = useState(0);
  const dragging = useRef(false);
  const startX   = useRef(0);

  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length);
  const next = () => setCurrent(c => (c + 1) % items.length);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [items.length]);

  const onPointerDown = e => { startX.current = e.clientX; dragging.current = true; };
  const onPointerUp   = e => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    dragging.current = false;
  };

  const idx = offset => (current + offset + items.length) % items.length;

  return (
    <div className="relative select-none">
      <div
        className="flex items-center justify-center gap-5 overflow-visible py-6 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { dragging.current = false; }}
      >
        {[-1, 0, 1].map(offset => {
          const item     = items[idx(offset)];
          const isCenter = offset === 0;
          return (
            <div
              key={idx(offset)}
              onClick={() => offset !== 0 && (offset === -1 ? prev() : next())}
              className={`flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-500 bg-white
                ${isCenter
                  ? 'w-[320px] sm:w-[360px] shadow-2xl shadow-teal-900/10 scale-100 opacity-100 z-10'
                  : 'w-[260px] sm:w-[300px] shadow-md scale-95 opacity-40 cursor-pointer hover:opacity-60 z-0'}`}
            >
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" style={{ objectPosition: item.imgPos || 'center center' }} draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6">
                <h4 className="text-[17px] font-bold text-[#0A2540] mb-2 leading-snug">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{item.desc}</p>
                {isCenter && (
                  <Link to={item.href} className="inline-flex items-center gap-2 text-sm font-bold text-[#00B4A0] hover:gap-3 transition-all duration-200">
                    {item.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button onClick={prev} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#00B4A0] hover:text-[#00B4A0] transition" aria-label="Previous">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-[#00B4A0]' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`}
              aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <button onClick={next} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#00B4A0] hover:text-[#00B4A0] transition" aria-label="Next">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </button>
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
  const [serviceTab,  setServiceTab]  = useState('patient');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

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
      `}</style>

      {/* ════════════════════════════════ NAVBAR ═════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">

          <Link to="/" className="flex items-center gap-2.5 group">
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
                {[['24 / 7','AI assistance availability'],['RAG','Evidence-based guidance'],['5-in-1','AI · Book · Video · Notes']].map(([v,l]) => (
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

                {/* Input mockup */}
                <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-4 py-3">
                  <p className="flex-1 text-white/30 text-sm">Describe your symptoms…</p>
                  <div className="w-7 h-7 rounded-lg bg-[#00B4A0] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1440 80" className="w-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 72C120 64 240 48 360 44C480 40 600 48 720 54C840 60 960 64 1080 60C1200 56 1320 44 1380 38L1440 32V80H0Z" fill="#F4F7F9"/>
          </svg>
        </div>
      </header>

      {/* ════════════════════════════ HOW IT WORKS ═══════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-[#F4F7F9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">From Symptom to Solution</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              MediCare removes every barrier between your health concern and professional medical care.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n    : '01',
                label: 'Describe Symptoms',
                desc : 'Chat naturally with our AI — no forms, no checkboxes.',
                icon : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5" />
                  </svg>
                ),
              },
              {
                n    : '02',
                label: 'AI Evidence Analysis',
                desc : 'RAG retrieves from verified medical textbooks in real time.',
                icon : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 2C9.5 2 7.5 3.8 7.5 6c0 .7.2 1.4.5 2C6.2 8.7 5 10.2 5 12c0 1.2.5 2.3 1.3 3.1C5.5 15.6 5 16.7 5 18h14c0-1.3-.5-2.4-1.3-2.9.8-.8 1.3-1.9 1.3-3.1 0-1.8-1.2-3.3-3-4 .3-.6.5-1.3.5-2C16.5 3.8 14.5 2 12 2z" />
                    <path d="M9 12h2M13 12h2M9 15h6" />
                    <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
                  </svg>
                ),
              },
              {
                n    : '03',
                label: 'Match With a Specialist',
                desc : 'Choose from filtered, available doctors who fit your needs.',
                icon : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                ),
              },
              {
                n    : '04',
                label: 'Consult & Get Notes',
                desc : 'Video call and receive an AI-generated consultation summary.',
                icon : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-slate-100 p-7 flex flex-col gap-5
                           hover:-translate-y-2 hover:shadow-xl hover:shadow-[#00B4A0]/10 hover:border-[#00B4A0]/30
                           transition-all duration-300 cursor-default"
              >
                {/* Icon — spins/scales on card hover */}
                <div className="w-12 h-12 rounded-xl bg-[#00B4A0]/8 flex items-center justify-center text-[#00B4A0]
                                group-hover:bg-[#00B4A0] group-hover:text-white group-hover:scale-110
                                transition-all duration-300">
                  {step.icon}
                </div>

                {/* Step number */}
                <p className="text-[11px] font-extrabold text-[#00B4A0] uppercase tracking-widest">{step.n}</p>

                {/* Content */}
                <div>
                  <h3 className="text-base font-bold text-[#0A2540] mb-2 group-hover:text-[#00B4A0] transition-colors duration-300">
                    {step.label}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>

                {/* Animated bottom accent line */}
                <div className="h-0.5 w-0 bg-[#00B4A0] rounded-full group-hover:w-full transition-all duration-500 mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ SERVICES CAROUSEL ════════════════════════ */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">One Platform. Two Portals.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm">
              Whether you're seeking care or delivering it, MediCare AI is built for you.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl bg-[#F4F7F9] p-1 border border-slate-200">
              {[['patient','For Patients'],['doctor','For Doctors']].map(([tab, label]) => (
                <button key={tab} onClick={() => setServiceTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    serviceTab === tab ? 'bg-[#0A2540] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div key={serviceTab}>
            <ServiceCarousel items={serviceTab === 'patient' ? PATIENT_SERVICES : DOCTOR_SERVICES} />
          </div>

          <div className="text-center mt-10">
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

      {/* ══════════════════════════ FOR DOCTORS CTA ══════════════════════════ */}
      <section id="for-doctors" className="relative py-24 bg-[#0A2540] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B4A0]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-900/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            <div>
              <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-3">Doctor Portal</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-snug">
                Streamline your practice.<br />Reach patients who need you.
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 text-sm">
                Join the MediCare AI network and get a powerful portal to manage your schedule, conduct video consultations, and receive AI-generated pre-consultation summaries — so you spend less time gathering information and more time delivering care.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/doctor/signup"
                  className="px-8 py-4 rounded-xl bg-[#00B4A0] text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition hover:-translate-y-0.5">
                  Join the Network
                </Link>
                <Link to="/login"
                  className="px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition">
                  Doctor Login
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['15-min slot granularity','Auto conflict prevention','HD video + transcription','AI pre-assessment briefs'].map((f,i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/65">
                    <span className="w-4 h-4 rounded-full bg-[#00B4A0]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Logo image — same treatment as hero */}
            <div className="flex items-center justify-center h-[480px] overflow-hidden">
              <img
                src={ASSETS.logo}
                alt="MediCare AI"
                className="w-[600px] max-w-none"
                style={{
                  mixBlendMode : 'screen',
                  filter       : 'brightness(1.8) contrast(1.1) saturate(1.2)',
                  marginTop    : '-80px',
                }}
              />
            </div>
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
              <div className="flex items-center gap-2.5 mb-4">
                <img src={ASSETS.logo} alt="MediCare AI" className="h-8 w-auto object-contain"
                  onError={e => { e.currentTarget.style.display = 'none'; }} />
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
