import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const AIChat = () => {
  const navigate = useNavigate();

  // ── STATE (preserved exactly) ──
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Medicare AI assistant. Describe your symptoms or ask a health question.",
      type: 'intro',
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // ── REFS (preserved exactly) ──
  const hasFetchedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, loading]);

  // 1. START NEW CHAT SESSION (preserved exactly)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const startSession = async () => {
      try {
        const response = await axios.post('http://localhost:4000/startNewChat', {}, {
          withCredentials: true,
        });
        if (response.status === 201) {
          setSessionId(response.data.sessionId);
        }
      } catch (err) {
        console.error("Failed to start chat:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/patient/login');
        }
      } finally {
        setInitializing(false);
      }
    };

    startSession();
  }, [navigate]);

  // 2. SEND MESSAGE (preserved exactly)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const userQuestion = inputText;
    setInputText("");

    setMessages((prev) => [...prev, { sender: 'patient', text: userQuestion }]);
    setLoading(true);

    try {
      const payload = {
        question: userQuestion,
        session_id: sessionId,
      };

      const response = await axios.post('http://localhost:4000/SendMessage', payload, {
        withCredentials: true,
      });

      const { answer, sources } = response.data;

      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: answer,
        sources: sources || [],
      }]);

    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: "I apologize, but I am unable to connect to the medical database at this moment. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── LOADING SCREEN ──
  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A2540]">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-[#00B4A0]/30 border-t-[#00B4A0] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#00B4A0] font-extrabold text-xs">AI</span>
          </div>
        </div>
        <p className="text-white/60 font-medium animate-pulse text-sm">Initializing Secure Session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F4F7F9] font-sans">

      {/* ── TOP NAVBAR ── */}
      <header className="bg-[#0A2540] px-6 py-0 flex items-center justify-between flex-shrink-0 relative overflow-hidden" style={{ minHeight: '64px' }}>
        {/* Subtle glow */}
        <div className="absolute right-0 top-0 w-64 h-full bg-[#00B4A0]/5 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Brand icon */}
          <div className="relative">
            <div className="w-10 h-10 bg-[#00B4A0] rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-[#00B4A0]/30">
              M
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-[#0A2540] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-base leading-tight">
              Medicare<span className="text-[#00B4A0]">AI</span>
            </h1>
            <p className="text-white/40 text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
              AI Medical Assistant
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/patient/dashboard')}
          className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-semibold transition-all duration-200 border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </header>

      {/* ── CHAT AREA ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">

          {/* Session pill */}
          <div className="flex justify-center">
            <span className="bg-white border border-slate-100 shadow-sm text-slate-400 text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
              Session Started
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full items-end gap-3 ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >

              {/* AI avatar */}
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-[#0A2540] flex-shrink-0 flex items-center justify-center shadow-sm mb-0.5">
                  <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}

              <div className={`max-w-[80%] md:max-w-[72%] ${msg.sender === 'patient' ? '' : ''}`}>
                {/* Label for AI */}
                {msg.sender === 'ai' && (
                  <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-1 ml-1">AI Analysis</p>
                )}

                <div className={`px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'patient'
                    ? 'bg-[#0A2540] text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm'
                }`}>

                  {msg.sender === 'ai' ? (
                    <ReactMarkdown
                      components={{
                        h3: ({ node, ...props }) => (
                          <h3 className="text-[#00B4A0] font-bold text-base mt-4 mb-2 border-b border-slate-100 pb-1" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="text-slate-600" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <span className="font-bold text-slate-800" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0" {...props} />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Medical Sources
                      </p>
                      <ul className="space-y-1">
                        {msg.sources.map((source, i) => (
                          <li key={i} className="text-xs text-[#00B4A0] truncate max-w-xs">
                            • {source.split(/[\\/]/).pop()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient avatar placeholder for spacing alignment */}
              {msg.sender === 'patient' && (
                <div className="w-8 h-8 rounded-xl bg-[#00B4A0] flex-shrink-0 flex items-center justify-center shadow-sm mb-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator — animated teal dots */}
          {loading && (
            <div className="flex justify-start items-end gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0A2540] flex-shrink-0 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-[#00B4A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-[#00B4A0] uppercase tracking-widest mb-1 ml-1">AI Analysis</p>
                <div className="bg-white border border-slate-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#00B4A0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-[#00B4A0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-[#00B4A0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── INPUT AREA ── */}
      <div className="flex-shrink-0 p-4 bg-[#F4F7F9] border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-md px-3 py-2 focus-within:ring-2 focus-within:ring-[#00B4A0]/40 focus-within:border-[#00B4A0] transition-all duration-200"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your symptoms or ask a health question..."
              className="flex-1 px-3 py-2.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex-shrink-0 w-11 h-11 bg-[#00B4A0] hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center shadow-sm"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            AI can make mistakes. Please consult a real doctor for emergencies.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AIChat;
