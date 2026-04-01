import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";

// Use environment variable for production
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");

// --- Sub-Component: SessionToDoCard remains the same ---
const SessionToDoCard = ({ session, onSelect, isSelected }) => {
  const currentUserId = localStorage.getItem("userId");
  const partner = String(session.sender?._id) === String(currentUserId) 
    ? session.receiver 
    : session.sender;

  return (
    <div 
      onClick={() => onSelect(session)}
      className={`cursor-pointer p-6 border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col gap-4 mb-6 ${
        isSelected ? 'bg-amber-100' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-black text-slate-900 leading-tight">{partner?.name || "Partner"}</h3>
          {partner?.college && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{partner.college}</p>}
        </div>
        {isSelected && <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />}
      </div>
      {partner?.bio && <p className="text-xs font-bold text-slate-600 italic leading-relaxed border-l-4 border-slate-200 pl-3">"{partner.bio}"</p>}
      <div className="flex items-center gap-1.5 pt-2 border-t-2 border-black border-dashed">
        <span className="text-sm">⏰</span>
        <p className="font-black text-[10px] text-slate-500 uppercase">
          Session Timing: <span className="text-black ml-1">{session.timing}</span>
        </p>
      </div>
    </div>
  );
};

const Sessions = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); // New state for partner's video
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const myId = localStorage.getItem("userId");

  // --- NEW: THE VIDEO FIX ---
  // This watches for 'stream' and 'remoteStream' and attaches them ONLY when the elements exist
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]);

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/sessions/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveSessions(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (token) fetchActiveSessions();
  }, [token]);

  useEffect(() => {
    if (selectedSession) {
      setChatMessages([]);
      socket.emit("join-session", selectedSession._id);
      
      socket.on("receive-message", (data) => {
        setChatMessages((prev) => [...prev, data]);
      });

      socket.on("incoming-call", (data) => {
        if (data.from !== myId) { 
          setReceivingCall(true);
          setCallerSignal(data.signalData);
        }
      });

      socket.on("call-ended", () => { handleLeaveCall(); });
    }
    return () => {
      socket.off("receive-message");
      socket.off("incoming-call");
      socket.off("call-ended");
    };
  }, [selectedSession, myId]);

  const handleSendMessage = () => {
    if (!selectedSession || !message.trim()) return;
    const messageData = { sessionId: selectedSession._id, text: message, senderId: myId };
    socket.emit("send-message", messageData);
    setMessage("");
  };

  const handleStartCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });
      
      peer.on("signal", (data) => {
        socket.emit("call-user", { sessionId: selectedSession._id, signalData: data, from: myId });
      });

      peer.on("stream", (incomingRemoteStream) => {
        setRemoteStream(incomingRemoteStream);
      });

      socket.on("call-accepted", (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    });
  };

  const handleAnswerCall = () => {
    setCallAccepted(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });
      
      peer.on("signal", (data) => {
        socket.emit("answer-call", { signal: data, sessionId: selectedSession._id });
      });

      peer.on("stream", (incomingRemoteStream) => {
        setRemoteStream(incomingRemoteStream);
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    });
  };

  const handleLeaveCall = () => {
    socket.emit("end-call", { sessionId: selectedSession?._id });
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (connectionRef.current) connectionRef.current.destroy();
    setCallAccepted(false);
    setReceivingCall(false);
    setStream(null);
    setRemoteStream(null);
  };

  return (
    <div className="bg-slate-50 font-sans px-6 md:px-12 pb-12">
      <div className="max-w-[1600px] mx-auto">
        
        {/* 🎥 VIDEO OVERLAY */}
        {stream && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="relative w-full h-full max-w-6xl bg-slate-900 md:rounded-[3rem] overflow-hidden border-8 border-black">
              {/* Partner Video */}
              <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
              
              {/* My Video (Small Overlay) */}
              <div className="absolute bottom-10 right-10 w-48 md:w-72 aspect-video border-4 border-white rounded-2xl overflow-hidden shadow-2xl z-10">
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
              </div>

              {/* End Call Button */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                <button onClick={handleLeaveCall} className="bg-red-600 text-white w-20 h-20 rounded-full border-4 border-black flex items-center justify-center hover:scale-110 transition-transform">
                  <span className="text-3xl">🚫</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          <aside className="w-full md:w-[350px]">
            <p className="text-[12px] font-black text-slate-400 uppercase mb-4 ml-4 text-left">sessions-to-do</p>
            {activeSessions.length > 0 ? (
              activeSessions.map((s) => (
                <SessionToDoCard key={s._id} session={s} onSelect={setSelectedSession} isSelected={selectedSession?._id === s._id} />
              ))
            ) : (
              <div className="p-8 border-4 border-dashed border-slate-300 rounded-[2rem] text-center bg-white/50">
                 <p className="text-slate-400 font-black text-xs uppercase">No Active Sessions</p>
              </div>
            )}
          </aside>

          <main className="flex-1 bg-white border-[4px] border-black p-8 rounded-[3rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[650px]">
            {!selectedSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Select a session to start</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-4 border-b-4 border-black mb-6">
                  <h2 className="text-3xl font-black uppercase">Chat </h2>
                  <div className="flex gap-2">
                    {receivingCall && !callAccepted && (
                      <button onClick={handleAnswerCall} className="bg-green-500 text-white px-6 py-2 rounded-full font-black border-2 border-black animate-bounce">Answer</button>
                    )}
                    <button onClick={handleStartCall} className="bg-orange-500 text-white px-8 py-3 rounded-full font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">videocall</button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 min-h-[300px] overflow-y-auto mb-6 p-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.senderId === myId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl border-2 border-black max-w-[70%] font-bold ${msg.senderId === myId ? 'bg-blue-500 text-white' : 'bg-amber-400 text-black'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6 border-t-4 border-black">
                  <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 border-3 border-black p-4 rounded-full focus:outline-none" />
                  <button onClick={handleSendMessage} className="bg-black text-white px-10 py-4 rounded-full font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">Send</button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sessions;