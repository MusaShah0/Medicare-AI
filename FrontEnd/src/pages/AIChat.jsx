import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const AIChat = () => {
  const navigate = useNavigate();

  // State
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Medicare AI assistant. Describe your symptoms or ask a health question.",
      type: 'intro'
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Refs
  const hasFetchedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // UPDATED: Only scroll down when the user sends a message (loading = true)
  // This prevents the chat from jumping to the bottom of a massive AI response!
  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading]);

  // 1. START NEW CHAT SESSION
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const startSession = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/startNewChat`, {}, {
          withCredentials: true
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

  // 2. SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const userQuestion = inputText;
    setInputText("");

    // Add User Message
    setMessages((prev) => [...prev, { sender: 'patient', text: userQuestion }]);

    // Setting loading to true will now trigger the auto-scroll to show the typing indicator
    setLoading(true);

    try {
      const payload = {
        question: userQuestion,
        session_id: sessionId
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/SendMessage`, payload, {
        withCredentials: true
      });

      const { answer, sources } = response.data;

      // Add AI Response
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: answer,
        sources: sources || []
      }]);

    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: "I apologize, but I am unable to connect to the medical database at this moment. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  // --- LOADING SCREEN ---
  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600 font-medium">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-700 text-xs">AI</div>
        </div>
        <p className="mt-4 animate-pulse">Initializing Secure Session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50/80 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-tr from-teal-600 to-teal-400 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-teal-500/30">
              🩺
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">MediCare <span className="text-teal-600">AI</span></h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Symptom Checker Active
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/patient/dashboard')}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <span>Exit</span>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth z-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 pb-4">

          <div className="text-center">
            <span className="bg-slate-200/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
              Session Started
            </span>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>

              {/* Avatar for AI */}
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}

              <div className={`relative max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-all duration-300 ${msg.sender === 'patient'
                  ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}>

                {/* --- MARKDOWN RENDERER --- */}
                {msg.sender === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      h3: ({ node, ...props }) => <h3 className="text-teal-700 font-bold text-lg mt-4 mb-2 border-b border-teal-50 pb-1" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />,
                      li: ({ node, ...props }) => <li className="text-slate-600" {...props} />,
                      strong: ({ node, ...props }) => <span className="font-bold text-slate-800" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* Sources Footnote */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100/20">
                    <p className="text-[10px] font-bold opacity-70 uppercase mb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Medical Sources:
                    </p>
                    <ul className="space-y-1">
                      {msg.sources.map((source, i) => (
                        <li key={i} className={`text-xs truncate max-w-xs ${msg.sender === 'patient' ? 'text-teal-100' : 'text-blue-500'}`}>
                          • {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start w-full animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center mr-3">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 z-20">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your symptoms here..."
              className="flex-1 px-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all duration-200 transform active:scale-95 shadow-md"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              )}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              AI can make mistakes. Please consult a real doctor for emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;