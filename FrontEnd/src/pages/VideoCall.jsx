import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const meetingContainerRef = useRef(null);
  
  const [token, setToken] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // To show "Too early" etc.

  // 1. Load Script
  useEffect(() => {
    if (window.VideoSDKMeeting) {
      setScriptLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (window.VideoSDKMeeting) {
          setScriptLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // 2. Validate Meeting & Fetch Token
  useEffect(() => {
    const validateAndJoin = async () => {
      try {
        // 👇 Call the new Validation API with roomId
        const res = await axios.get(`http://localhost:4000/join-meeting/${roomId}`);

        if (res.data.status === 1) {
          setToken(res.data.token);
          
          // 👇 AUTO-END LOGIC
          // If backend says 500 seconds left, we set a timeout to leave
          if (res.data.remainingTime > 0) {
            console.log(`Meeting will end in ${res.data.remainingTime} seconds`);
            setTimeout(() => {
              alert("Time is up! The meeting is ending now.");
              navigate(-1); // Go back
            }, res.data.remainingTime * 1000);
          }

        } else {
            setErrorMsg(res.data.msg); // Show "Not started" or "Expired"
        }
      } catch (err) {
        // If the backend sends 403 or 404, we catch it here
        if (err.response && err.response.data) {
            setErrorMsg(err.response.data.msg);
        } else {
            setErrorMsg("Connection Failed");
        }
      }
    };

    validateAndJoin();
  }, [roomId, navigate]);

  // 3. Initialize Meeting
  useEffect(() => {
    if (token && scriptLoaded && roomId && meetingContainerRef.current) {
      const VideoSDKMeeting = window.VideoSDKMeeting;
      const meeting = new VideoSDKMeeting();

      const config = {
        name: "User " + Date.now().toString().slice(-4),
        meetingId: roomId,
        token: token, 
        containerId: null,
        micEnabled: true,
        webcamEnabled: true,
        participantCanToggleSelfWebcam: true,
        participantCanToggleSelfMic: true,
        chatEnabled: true,
        screenShareEnabled: true,
        
        onMeetingLeft: () => {
          navigate(-1);
        },
      };

      meeting.init({
        ...config,
        container: meetingContainerRef.current 
      });
    }
  }, [token, scriptLoaded, roomId, navigate]);

  // --- RENDER ---
  if (errorMsg) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Cannot Join Meeting</h1>
        <p className="text-xl">{errorMsg}</p>
        <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
            Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white">
      {!token || !scriptLoaded ? (
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <p>Verifying Schedule...</p>
        </div>
      ) : (
        <div ref={meetingContainerRef} className="w-full h-full" />
      )}
    </div>
  );
};

export default VideoCall;