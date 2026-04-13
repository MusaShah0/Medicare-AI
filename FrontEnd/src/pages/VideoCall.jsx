import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const meetingContainerRef = useRef(null);
  const tickRef = useRef(null); // hold interval ref so we can clear it anywhere

  const [meetingData, setMeetingData] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // ── Destination after leaving ─────────────────────────────────────────────
  const exitDest = useCallback(() =>
    meetingData?.userRole === 'doctor' ? '/doctor/appointments' : '/my-appointments'
  , [meetingData]);

  // ── Hard leave — clears timer and navigates away ──────────────────────────
  const hardLeave = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    navigate(exitDest(), { replace: true });
  }, [navigate, exitDest]);

  // ── 1. Wait for VideoSDK prebuilt script ─────────────────────────────────
  useEffect(() => {
    if (window.VideoSDKMeeting) { setScriptLoaded(true); return; }
    const interval = setInterval(() => {
      if (window.VideoSDKMeeting) { setScriptLoaded(true); clearInterval(interval); }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // ── 2. Validate meeting & fetch token + names ─────────────────────────────
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

  // ── 3. Countdown — starts once timeLeft is a positive number ─────────────
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    tickRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tickRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [timeLeft > 0 && timeLeft !== null]); // eslint-disable-line

  // ── 4. When countdown hits 0 — force navigate immediately ────────────────
  useEffect(() => {
    if (timeLeft === 0 && meetingData) {
      hardLeave();
    }
  }, [timeLeft, meetingData, hardLeave]);

  // ── 5. Initialize VideoSDK meeting ───────────────────────────────────────
  useEffect(() => {
    if (!meetingData || !scriptLoaded || !meetingContainerRef.current) return;
    const meeting = new window.VideoSDKMeeting();
    meeting.init({
      name: meetingData.participantName,
      meetingId: roomId,
      token: meetingData.token,
      containerId: null,
      container: meetingContainerRef.current,
      micEnabled: true,
      webcamEnabled: true,
      participantCanToggleSelfWebcam: true,
      participantCanToggleSelfMic: true,
      chatEnabled: true,
      screenShareEnabled: true,
      onMeetingLeft: hardLeave,
    });
  }, [meetingData, scriptLoaded]); // eslint-disable-line

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatCountdown = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const otherParticipant = meetingData
    ? (meetingData.userRole === 'doctor' ? meetingData.patientName : meetingData.doctorName)
    : null;

  // ── Error screen ──────────────────────────────────────────────────────────
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

  // ── Loading screen ────────────────────────────────────────────────────────
  if (!meetingData || !scriptLoaded) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 font-medium">Verifying schedule...</p>
      </div>
    );
  }

  // ── Active call screen ────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">

      {/* Top info bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 z-10">

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live
          </span>
          <span className="text-slate-400 text-xs">|</span>
          <span className="text-sm font-semibold text-white">
            In call with <span className="text-teal-400">{otherParticipant}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown */}
          <div className={`flex items-center gap-2 text-sm font-bold tabular-nums px-3 py-1 rounded-lg
            ${timeLeft !== null && timeLeft <= 120 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatCountdown(timeLeft)}
          </div>

          {/* Leave / close button */}
          <button
            onClick={hardLeave}
            title="Leave meeting"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-900/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>

      {/* VideoSDK container */}
      <div ref={meetingContainerRef} className="flex-1 w-full" />
    </div>
  );
};

export default VideoCall;
