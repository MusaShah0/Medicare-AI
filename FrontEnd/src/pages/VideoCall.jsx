import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const cleanupVideoSDKDOM = () => {
  document.querySelectorAll('[id^="videosdk"]').forEach(el => el.remove());
  document.querySelectorAll('.__sdk-container, [class*="videosdk"]').forEach(el => el.remove());
};

// ── Review form ───────────────────────────────────────────────────────────────
const ReviewForm = ({ appointmentId, doctorName, onDone }) => {
  const [rating, setRating]         = useState(0);
  const [hovered, setHovered]       = useState(0);
  const [review, setReview]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating.'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/review`,
        { appointment_id: appointmentId, rating, review },
        { withCredentials: true }
      );
      setSubmitted(true);
      setTimeout(onDone, 1500);
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
          How was your consultation with{' '}
          <span className="text-teal-400 font-semibold">{doctorName}</span>?
        </p>
        <div className="flex justify-center gap-2 mb-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} type="button"
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
      <textarea value={review} onChange={e => setReview(e.target.value)}
        placeholder="Share your experience (optional)…" rows={3} maxLength={1000}
        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-teal-500 transition"
      />
      <div className="flex gap-3">
        <button type="button" onClick={onDone}
          className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold transition">
          Skip
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold transition">
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

// ── End overlay ───────────────────────────────────────────────────────────────
const EndOverlay = ({ meetingData, uploadStatus, onNavigate }) => {
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
        {isPatient && uploadStatus && (
          <div className={`mt-3 px-4 py-3 rounded-xl text-sm text-center max-w-xs mx-auto ${
            uploadStatus === 'uploading' ? 'bg-blue-900/40 border border-blue-700/50' :
            uploadStatus === 'done'      ? 'bg-teal-900/40 border border-teal-700/50' :
            uploadStatus === 'failed'    ? 'bg-red-900/40 border border-red-700/50'   : ''
          }`}>
            {uploadStatus === 'uploading' && (
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Uploading recording...</span>
              </div>
            )}
            {uploadStatus === 'done' && (
              <div className="text-teal-300">
                <p className="font-semibold">✅ Your meeting notes are being generated</p>
                <p className="text-xs text-teal-400/80 mt-1">A download link will appear in your appointments once ready. This usually takes 2–3 minutes.</p>
              </div>
            )}
            {uploadStatus === 'failed' && (
              <p className="text-red-300">⚠️ Notes could not be prepared for this session.</p>
            )}
          </div>
        )}
      </div>
      {isPatient && meetingData.appointmentId ? (
        <ReviewForm
          appointmentId={meetingData.appointmentId}
          doctorName={meetingData.doctorName}
          onDone={onNavigate}
        />
      ) : (
        <button onClick={onNavigate}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition">
          Back to Appointments
        </button>
      )}
    </div>
  );
};

// ── Main VideoCall component ──────────────────────────────────────────────────
const VideoCall = () => {
  const { roomId } = useParams();
  const navigate   = useNavigate();

  const [meetingData, setMeetingData]   = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMsg, setErrorMsg]         = useState(null);
  const [timeLeft, setTimeLeft]         = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const meetingInitedRef = useRef(false);
  const tickRef          = useRef(null);
  const sessionEndedRef  = useRef(false);
  const meetingDataRef   = useRef(null);

  // ── Audio recording refs ──────────────────────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const audioCtxRef      = useRef(null);   // AudioContext for mixing
  const micSourceRef     = useRef(null);   // local mic source node
  const destNodeRef      = useRef(null);   // MediaStreamDestination (mixed output)
  const remoteNodesRef   = useRef([]);     // remote audio source nodes (to disconnect on cleanup)
  const remoteObserverRef = useRef(null);  // MutationObserver watching for remote <audio> elements

  useEffect(() => { meetingDataRef.current = meetingData; }, [meetingData]);

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  // ── Connect a remote <audio> element into the AudioContext mixer ──────────
  // VideoSDK injects <audio> elements into the DOM for each remote participant.
  // We capture their srcObject stream and route it through the AudioContext
  // so it gets mixed into the recording alongside the local mic.
  const connectRemoteAudio = useCallback((audioEl) => {
    const ctx  = audioCtxRef.current;
    const dest = destNodeRef.current;
    if (!ctx || !dest) return;

    // VideoSDK may set srcObject directly or update it later — handle both
    const stream = audioEl.srcObject;
    if (!stream || !(stream instanceof MediaStream)) return;

    // Guard: only connect streams that actually have audio tracks
    if (stream.getAudioTracks().length === 0) return;

    try {
      const source = ctx.createMediaStreamSource(stream);
      source.connect(dest);
      remoteNodesRef.current.push(source);
      console.log(`[Notes] Remote audio connected — tracks: ${stream.getAudioTracks().length}, id: ${stream.id.slice(0, 8)}`);
    } catch (err) {
      console.warn('[Notes] Could not connect remote audio:', err.message);
    }
  }, []);

  // ── Watch for srcObject changes on an already-injected <audio> element ───
  // VideoSDK sometimes injects the <audio> element first, then sets srcObject
  // asynchronously. We poll briefly to catch this case.
  const watchForSrcObject = useCallback((audioEl) => {
    if (audioEl.srcObject) {
      connectRemoteAudio(audioEl);
      return;
    }
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (audioEl.srcObject) {
        clearInterval(poll);
        connectRemoteAudio(audioEl);
      } else if (attempts >= 20) { // give up after 10s (20 × 500ms)
        clearInterval(poll);
        console.warn('[Notes] Remote <audio> never got srcObject — doctor audio may be missing from recording');
      }
    }, 500);
  }, [connectRemoteAudio]);

  // ── Start mixed audio recording (both sides) ──────────────────────────────
  const startAudioRecording = useCallback(async () => {
    if (meetingDataRef.current?.userRole !== 'patient') return;

    console.log('[Notes] Step 1 — Requesting microphone permission...');
    try {
      // 1. Get local mic
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log('[Notes] Step 1 ✅ Microphone access granted');

      // 2. Create AudioContext + destination
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const dest = ctx.createMediaStreamDestination();
      audioCtxRef.current = ctx;
      destNodeRef.current = dest;
      console.log('[Notes] Step 2 ✅ AudioContext created — sample rate:', ctx.sampleRate);

      // 3. Route local mic into destination
      const micSource = ctx.createMediaStreamSource(micStream);
      micSource.connect(dest);
      micSourceRef.current = micSource;
      micSource._rawStream = micStream;
      console.log('[Notes] Step 3 ✅ Local mic connected to mixer');

      // 4. Watch for VideoSDK remote <audio> elements
      // VideoSDK injects <audio> elements and sets srcObject — sometimes immediately,
      // sometimes asynchronously. We handle both cases:
      //   a) MutationObserver catches newly added <audio> elements
      //   b) watchForSrcObject polls for srcObject if it's not set yet
      //   c) We also watch for srcObject property changes via a second observer
      const tryConnectAudio = (el) => {
        if (el.dataset.notesConnected) return;
        el.dataset.notesConnected = '1';
        watchForSrcObject(el);
      };

      const observer = new MutationObserver((mutations) => {
        // Check for newly added <audio> nodes
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node.nodeName === 'AUDIO') tryConnectAudio(node);
            // Also check children of added nodes (VideoSDK wraps in divs)
            if (node.querySelectorAll) {
              node.querySelectorAll('audio').forEach(tryConnectAudio);
            }
          });
        });
        // Also re-scan all audio elements in case srcObject was set without a DOM mutation
        document.querySelectorAll('audio').forEach(el => {
          if (!el.dataset.notesConnected && el.srcObject) tryConnectAudio(el);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      remoteObserverRef.current = observer;

      // Also connect any already-present <audio> elements right now
      let remoteCount = 0;
      document.querySelectorAll('audio').forEach(el => {
        if (el.dataset.notesConnected) return;
        el.dataset.notesConnected = '1';
        watchForSrcObject(el);
        remoteCount++;
      });
      if (remoteCount > 0) {
        console.log(`[Notes] Step 4 ✅ Found ${remoteCount} existing <audio> element(s) — connecting...`);
      } else {
        console.log('[Notes] Step 4 — No remote audio yet, MutationObserver watching...');
      }

      // 5. Record the mixed destination stream
      audioChunksRef.current = [];
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find(t => MediaRecorder.isTypeSupported(t)) || '';

      const recorder = new MediaRecorder(dest.stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log(`[Notes] Step 5 — Chunk recorded: ${(e.data.size / 1024).toFixed(1)} KB (total chunks: ${audioChunksRef.current.length})`);
        }
      };

      recorder.start(5000);
      console.log(`[Notes] Step 5 ✅ MediaRecorder started — format: ${mimeType || 'browser default'}`);
    } catch (err) {
      console.error('[Notes] Step 1 ❌ Could not start audio recording:', err.message);
      console.warn('[Notes] Consultation notes will not be generated for this session');
    }
  }, [connectRemoteAudio, watchForSrcObject]);

  // ── Cleanup audio recording resources ────────────────────────────────────
  const cleanupAudioRecording = useCallback(() => {
    // Stop MutationObserver
    if (remoteObserverRef.current) {
      remoteObserverRef.current.disconnect();
      remoteObserverRef.current = null;
    }
    // Disconnect remote source nodes
    remoteNodesRef.current.forEach(node => { try { node.disconnect(); } catch (_) {} });
    remoteNodesRef.current = [];
    // Disconnect mic source and stop mic tracks
    if (micSourceRef.current) {
      try { micSourceRef.current.disconnect(); } catch (_) {}
      if (micSourceRef.current._rawStream) {
        micSourceRef.current._rawStream.getTracks().forEach(t => t.stop());
      }
      micSourceRef.current = null;
    }
    // Close AudioContext
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (_) {}
      audioCtxRef.current = null;
    }
    destNodeRef.current = null;
    // Clear notesConnected markers so a re-join would re-connect cleanly
    document.querySelectorAll('audio[data-notes-connected]').forEach(el => {
      delete el.dataset.notesConnected;
    });
  }, []);

  // ── Stop recording and upload to backend ─────────────────────────────────
  const stopAndUploadAudio = useCallback(async (appointmentId) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      console.warn('[Notes] Step 6 — No active recorder to stop');
      cleanupAudioRecording();
      return;
    }

    console.log('[Notes] Step 6 — Stopping MediaRecorder...');
    setUploadStatus('uploading');

    // Stop recorder — triggers final ondataavailable + onstop
    await new Promise(resolve => {
      recorder.onstop = resolve;
      recorder.stop();
    });
    console.log('[Notes] Step 6 ✅ MediaRecorder stopped');

    cleanupAudioRecording();

    const chunks = audioChunksRef.current;
    console.log(`[Notes] Step 6 — Total chunks collected: ${chunks.length}`);

    if (!chunks.length) {
      console.error('[Notes] Step 6 ❌ No audio chunks recorded');
      setUploadStatus('failed');
      return;
    }

    const mimeType = recorder.mimeType || 'audio/webm';
    const ext      = mimeType.includes('ogg') ? '.ogg' : mimeType.includes('mp4') ? '.mp4' : '.webm';
    const blob     = new Blob(chunks, { type: mimeType });
    console.log(`[Notes] Step 7 — Audio blob: ${(blob.size / 1024 / 1024).toFixed(2)} MB, type: ${mimeType}`);

    if (blob.size < 1000) {
      console.error('[Notes] Step 7 ❌ Audio blob too small (< 1KB) — nothing was recorded');
      setUploadStatus('failed');
      return;
    }

    console.log(`[Notes] Step 7 — Uploading to /appointments/${appointmentId}/upload-audio...`);
    try {
      const formData = new FormData();
      formData.append('audio', blob, `recording${ext}`);

      const res = await axios.post(
        `${API}/appointments/${appointmentId}/upload-audio`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 5 * 60 * 1000
        }
      );
      console.log('[Notes] Step 7 ✅ Upload successful:', res.data);
      setUploadStatus('done');
    } catch (err) {
      console.error('[Notes] Step 7 ❌ Upload failed:', err.response?.data || err.message);
      setUploadStatus('failed');
    }
  }, [cleanupAudioRecording]);

  // ── Navigate away ─────────────────────────────────────────────────────────
  const handleNavigateAway = useCallback(() => {
    const dest = meetingDataRef.current?.userRole === 'doctor'
      ? '/doctor/appointments'
      : '/my-appointments';
    navigate(dest, { replace: true });
    setTimeout(() => {
      cleanupVideoSDKDOM();
      const sdkScript = document.getElementById('videosdk-script');
      if (sdkScript) sdkScript.remove();
      delete window.VideoSDKMeeting;
    }, 0);
  }, [navigate]);

  // ── End session ───────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;

    console.log('[Notes] Session ending — stopping countdown and hiding VideoSDK UI');
    stopTick();

    // Hide VideoSDK DOM immediately
    document.querySelectorAll('[id^="videosdk"]').forEach(el => { el.style.display = 'none'; });
    document.querySelectorAll('.__sdk-container, [class*="videosdk"]').forEach(el => { el.style.display = 'none'; });

    const data = meetingDataRef.current;
    console.log('[Notes] User role:', data?.userRole, '| appointmentId:', data?.appointmentId);

    // Notify backend — marks appointment completed + stops VideoSDK recording if active
    if (data?.appointmentId) {
      try {
        await axios.post(`${API}/end-meeting/${data.appointmentId}`, {}, { withCredentials: true });
        console.log('[Notes] ✅ Backend notified — appointment marked completed');
      } catch (err) {
        console.log('[Notes] end-meeting response:', err.response?.data?.message || err.message);
      }
    }

    // Upload the mixed audio recording (patient only)
    if (data?.userRole === 'patient' && data?.appointmentId) {
      console.log('[Notes] Patient role — starting audio stop + upload');
      stopAndUploadAudio(data.appointmentId);
    }

    setSessionEnded(true);
  }, [stopTick, stopAndUploadAudio]);

  // ── Doctor: auto-navigate immediately ────────────────────────────────────
  useEffect(() => {
    if (sessionEnded && meetingData?.userRole === 'doctor') {
      handleNavigateAway();
    }
  }, [sessionEnded, meetingData, handleNavigateAway]);

  // ── 1. Load VideoSDK CDN script ───────────────────────────────────────────
  useEffect(() => {
    if (window.VideoSDKMeeting) { setScriptLoaded(true); return; }
    const existing = document.getElementById('videosdk-script');
    if (existing) {
      const poll = setInterval(() => {
        if (window.VideoSDKMeeting) { setScriptLoaded(true); clearInterval(poll); }
      }, 100);
      return () => clearInterval(poll);
    }
    const script = document.createElement('script');
    script.id    = 'videosdk-script';
    script.src   = 'https://sdk.videosdk.live/rtc-js-prebuilt/0.3.20/rtc-js-prebuilt.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // ── 2. Validate meeting & fetch token ────────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await axios.get(`${API}/join-meeting/${roomId}`, { withCredentials: true });
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

  // ── 3. Start mixed audio recording once meeting data is ready (patient only)
  useEffect(() => {
    if (meetingData?.userRole === 'patient') {
      console.log('[Notes] Patient joined — starting audio recording in 2s...');
      // Small delay to let VideoSDK initialize and inject its audio elements
      const t = setTimeout(() => startAudioRecording(), 2000);
      return () => clearTimeout(t);
    }
  }, [meetingData, startAudioRecording]);

  // ── 4. Countdown ──────────────────────────────────────────────────────────
  const countdownStarted = useRef(false);
  useEffect(() => {
    if (timeLeft === null || sessionEnded || countdownStarted.current) return;
    if (timeLeft <= 0) { endSession(); return; }
    countdownStarted.current = true;
    tickRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) { clearInterval(tickRef.current); tickRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => stopTick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null]);

  // ── 5. Countdown hits 0 → end session ────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && !sessionEndedRef.current) endSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ── 6. Initialize VideoSDK ────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingData || !scriptLoaded || meetingInitedRef.current) return;
    meetingInitedRef.current = true;
    const meeting = new window.VideoSDKMeeting();
    meeting.init({
      name:     meetingData.participantName,
      meetingId: roomId,
      token:    meetingData.token,
      containerId: null,
      micEnabled:  true,
      webcamEnabled: true,
      participantCanToggleSelfWebcam: true,
      participantCanToggleSelfMic:    true,
      chatEnabled:        true,
      screenShareEnabled: true,
      onMeetingLeft: endSession,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingData, scriptLoaded]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTick();
      cleanupVideoSDKDOM();
      cleanupAudioRecording();
    };
  }, [stopTick, cleanupAudioRecording]);

  const formatCountdown = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
        <button onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition">
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

  return (
    <div className="h-screen w-full">
      {/* Countdown timer */}
      <div className={`fixed top-4 left-4 z-[9998] text-sm font-bold tabular-nums px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm
        ${timeLeft !== null && timeLeft <= 120
          ? 'bg-red-600/90 text-white animate-pulse shadow-red-900/50'
          : 'bg-black/60 text-white shadow-black/40'}`}>
        {formatCountdown(timeLeft)}
      </div>

      {/* End overlay */}
      {sessionEnded && (
        <EndOverlay
          meetingData={meetingData}
          uploadStatus={uploadStatus}
          onNavigate={handleNavigateAway}
        />
      )}
    </div>
  );
};

export default VideoCall;
