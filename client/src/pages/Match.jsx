import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MatchCard = ({ match }) => {
  
  const [session, setSession] = useState(null);
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  
  // This will pop up an alert if your ID is missing
  if (!currentUserId || currentUserId === "undefined") {
    console.error("CRITICAL ERROR: No User ID found in LocalStorage!");
  }
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sessions/status/${match.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSession(res.data);
      } catch (err) {
        console.error("Error fetching session status", err);
      }
    };
    if (match.userId && token) fetchStatus();
  }, [match.userId, token]);

  const handleInitiate = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/sessions/initiate", {
        receiverId: match.userId,
        skillGained: match.skillsToLearn?.[0] || "General Learning",
        skillShared: match.skillsKnown?.[0] || "General Teaching",
        timing: match.bestTime
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSession(res.data);
    } catch (err) {
      alert("Failed to send request.");
    }
  };

  const handleResponse = async (newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/sessions/${session._id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSession(res.data);
    } catch (err) {
      alert("Error updating status.");
    }
  };

  // --- LOGIC CHECKS ---
  const normalizedCurrentId = String(currentUserId || "").trim().toLowerCase();
  const normalizedReceiverId = String(session?.receiver || "").trim().toLowerCase();
  
  const isPending = session?.status === "pending";
  const isReceiver = normalizedReceiverId === normalizedCurrentId && normalizedCurrentId !== "";

  return (
    <div className="bg-white border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black text-slate-900">{match.name}</h2>
          <div className="bg-amber-400 border-2 border-black px-4 py-1 rounded-full font-black text-sm">
            {match.score}%
          </div>
        </div>

        <div className="space-y-4 mb-8 text-left">
          {/* Skills UI */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">They Can Teach</p>
            <div className="flex flex-wrap gap-2">
              {match.skillsKnown?.map(s => (
                <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs border border-blue-200">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">They Want to Learn</p>
            <div className="flex flex-wrap gap-2">
              {match.skillsToLearn?.map(s => (
                <span key={s} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold text-xs border border-orange-200">{s}</span>
              ))}
            </div>
          </div>
          {/* Timing UI */}
          <div className={`p-4 rounded-2xl border-2 border-black ${match.hasOverlap ? "bg-green-50" : "bg-slate-100"}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{match.hasOverlap ? "⏰" : "💬"}</span>
              <p className={`font-bold text-[11px] ${match.hasOverlap ? "text-green-700" : "text-slate-600 italic"}`}>{match.bestTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        {!session ? (
          <button onClick={handleInitiate} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
            Initiate Session
          </button>
        ) : (
          <div className="space-y-3">
            {isPending && isReceiver ? (
              <div className="flex gap-3">
                <button onClick={() => handleResponse("active")} className="flex-1 bg-green-400 border-2 border-black font-black py-3 rounded-xl uppercase text-xs hover:bg-green-500 transition-colors">Accept</button>
                <button onClick={() => handleResponse("rejected")} className="flex-1 bg-red-400 border-2 border-black font-black py-3 rounded-xl uppercase text-xs hover:bg-red-500 transition-colors">Reject</button>
              </div>
            ) : (
              <div className="text-center">
                <button disabled className={`w-full py-4 rounded-2xl font-black uppercase border-2 cursor-not-allowed ${
                    session.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                  {isPending ? "Request Sent" : `Session ${session.status}`}
                </button>
                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isPending ? "Waiting for partner..." : `Status: ${session.status}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
// --- MAIN COMPONENT: Match ---
const Match = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      setMatches([]);
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/matches/recommend", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Recommended <span className="text-blue-600">Matches</span>
          </h1>
          <button 
            onClick={() => navigate("/home")}
            className="bg-black text-white px-8 py-2 rounded-xl font-bold hover:scale-105 transition-transform border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
          >
            back to home
          </button>
        </header>

        {loading ? (
          <div className="text-center py-20 font-black text-slate-400 animate-pulse uppercase tracking-widest">
            Calculating your perfect partners...
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map((match) => (
              <MatchCard key={match.userId} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-4 border-dashed border-slate-300 rounded-[3rem] bg-white/50">
            <h2 className="text-2xl font-black text-slate-300 uppercase">No Matches Found</h2>
            <p className="text-slate-400 font-medium mb-4">Try updating your skills or availability.</p>
            <button 
              onClick={() => navigate("/profile")} 
              className="text-blue-600 font-black underline uppercase tracking-tighter hover:text-blue-800"
            >
              Update Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Match;