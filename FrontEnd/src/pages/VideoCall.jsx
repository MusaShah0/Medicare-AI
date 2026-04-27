import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Review form shown to patients after the call ends ────────────────────────
const ReviewForm = ({ appointmentId, doctorName, onDone }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating.'); return; }
    setSubmitting(true);
    try {
      await axios.post('http://localhost:4000/review',
        { appointment_id: appointmentId, rating, review },
        { withCredentials: true }
      );
      setSubmitted(true);
      setTimeout(onDone, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">Review submitted!</p>
        <p className="text-slate-400 text-sm">Redirecting you now…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
      <div>
        <p className="text-slate-300 text-sm mb-2 text-center">
          How was your consultation with <span className="text-teal-400 font-semibold">{doctorName}</span>?
        </p>
        <div className="flex justify-center gap-2 mb-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
            >
              <span className={(hovered || rating) >= star ? 'text-yellow-400' : 'text-slate-600'}>★</span>
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs text-center mt-1">{error}</p>}
      </div>
      <textarea
        value={review}
        onChange={e => setReview(e.target.value)}
        placeholder="Share your experience (optional)…"
        rows={3}
        maxLength={1000}
        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-teal-500 transition"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold transition"
        >
          Skip
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold transition"
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

// ── Full-screen end overlay — covers VideoSDK's "Rejoin" UI completely ────────
const EndOverlay = ({ meetingData, onNavigate }) => {
  const isPatient = meetingData?.userRole === 'patient';
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-2">
        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">Session Ended</h1>
        <p className="text-slate-400 text-sm">
          Your consultation with{' '}
          <span className="text-teal-400 font-semibold">
            {isPatient ? meetingData.doctorName : meetingData.patientName}
          </span>{' '}
          has ended.
        </p>
      </div>
      {isPatient && meetingData.appointmentId ? (
        <ReviewForm
          appointmentId={meetingData.appointmentId}
          doctorName={meetingData.doctorName}
          onDone={onNavigate}
        />
      ) : (
        <button
          onClick={onNavigate}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition"
        >
          Back to Appointments
        </button>
      )}
    </div>
  );
};

// ── Main VideoCall component ───────────────────────────────────────────────────
const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const meetingInitedRef = useRef(false);
  const tickRef = useRef(null);

  const [meetingData, setMeetingData] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // seconds remaining
  const [sessionEnded, setSessionEnded] = useState(false);

  const exitDest = meetingData?.userRole === 'doctor'
    ? '/doctor/appointments'
    : '/my-appointments';

  // ── End session: stop timer, show overlay ────────────────────────────────────
  const endSession = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setSessionEnded(true);
  }, []);

  const handleNavigateAway = useCallback(() => {
    navigate(exitDest, { replace: true });
  }, [navigate, exitDest]);

  // ── Doctor auto-redirects immediately on session end (no review form) ─────────
  useEffect(() => {
    if (sessionEnded && meetingData?.userRole === 'doctor') {
      navigate('/doctor/appointments', { replace: true });
    }
  }, [sessionEnded, meetingData, navigate]);

  // ── 1. Load VideoSDK CDN script ───────────────────────────────────────────────
  useEffect(() => {
    if (window.VideoSDKMeeting) { setScriptLoaded(true); return; }
    const existing = document.getElementById('videosdk-script');
    if (existing) {
      // Script tag already in DOM — wait for it
      const poll = setInterval(() => {
        if (window.VideoSDKMeeting) { setScriptLoaded(true); clearInterval(poll); }
      }, 100);
      return () => clearInterval(poll);
    }
    const script = document.createElement('script');
    script.id = 'videosdk-script';
    script.src = 'https://sdk.videosdk.live/rtc-js-prebuilt/0.3.20/rtc-js-prebuilt.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // ── 2. Validate meeting & fetch token ────────────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/join-meeting/${roomId}`, {
          withCredentials: true
        });
        if (res.data.status === 1) {
          setMeetingData(res.data);
          setTimeLeft(res.data.remainingTime);
        } else {
          setErrorMsg(res.data.msg);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.msg || 'Connection failed');
      }
    };
    validate();
  }, [roomId]);

  // ── 3. Countdown — starts once remainingTime arrives from server ─────────────
  // We watch timeLeft but use a ref guard so the interval only starts ONCE.
  // The interval self-manages via functional updater — no re-registration needed.
  const countdownStarted = useRef(false);
  useEffect(() => {
    // Wait until we have a real value from the server
    if (timeLeft === null || sessionEnded) return;
    // Already running — don't start a second interval
    if (countdownStarted.current) return;

    if (timeLeft <= 0) {
      // Arrived already expired
      endSession();
      return;
    }

    countdownStarted.current = true;
    tickRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tickRef.current);
          tickRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      // Only runs on component unmount — interval self-terminates at 0
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]); // re-check each time timeLeft changes until we start the interval

  // ── 4. When countdown hits 0 — end session ───────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && meetingData && !sessionEnded) {
      endSession();
    }
  }, [timeLeft, meetingData, sessionEnded, endSession]);

  // ── 5. Initialize VideoSDK meeting ───────────────────────────────────────────
  useEffect(() => {
    if (!meetingData || !scriptLoaded || meetingInitedRef.current) return;
    meetingInitedRef.current = true;

    const meeting = new window.VideoSDKMeeting();
    meeting.init({
      name: meetingData.participantName,
      meetingId: roomId,
      token: meetingData.token,
      containerId: null, // full-page mode
      micEnabled: true,
      webcamEnabled: true,
      participantCanToggleSelfWebcam: true,
      participantCanToggleSelfMic: true,
      chatEnabled: true,
      screenShareEnabled: true,
      // When user clicks Leave inside SDK — show our overlay instead of Rejoin
      onMeetingLeft: endSession,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingData, scriptLoaded]);

  const formatCountdown = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const otherParticipant = meetingData
    ? (meetingData.userRole === 'doctor' ? meetingData.patientName : meetingData.doctorName)
    : null;

  // ── Error screen ──────────────────────────────────────────────────────────────
  if (errorMsg) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-400">Cannot Join Meeting</h1>
        <p className="text-slate-300 max-w-sm">{errorMsg}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (!meetingData || !scriptLoaded) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 font-medium">Verifying schedule...</p>
      </div>
    );
  }

  // ── Active call screen ────────────────────────────────────────────────────────
  // VideoSDK with containerId:null takes over the full viewport.
  // We float a compact pill in the top-right corner — small enough to never
  // block video controls, high enough z-index to always be visible.
  return (
    <div className="h-screen w-full">

      {/* ── Floating timer — top-left, just the countdown ── */}
      <div className={`fixed top-4 left-4 z-[9998] text-sm font-bold tabular-nums px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm
        ${timeLeft !== null && timeLeft <= 120
          ? 'bg-red-600/90 text-white animate-pulse shadow-red-900/50'
          : 'bg-black/60 text-white shadow-black/40'}`}
      >
        {formatCountdown(timeLeft)}
      </div>

      {/* ── End overlay — covers VideoSDK's Rejoin screen completely ── */}
      {sessionEnded && (
        <EndOverlay
          meetingData={meetingData}
          onNavigate={handleNavigateAway}
        />
      )}
    </div>
  );
};

export default VideoCall;
