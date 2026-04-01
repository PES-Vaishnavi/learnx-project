import React from "react";
import axios from "axios";

const SessionsToDos = ({ requests, onActionComplete }) => {
  
  const handleAccept = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/sessions/accept/${sessionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list in the parent component
      onActionComplete(); 
      alert("Session Accepted! It's now in your Active Sessions.");
    } catch (err) {
      console.error("Error accepting session:", err);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-black uppercase tracking-tight text-slate-400 mb-6 flex items-center gap-2">
        <span>📩</span> Incoming Requests
      </h2>
      
      <div className="space-y-4">
        {requests.map((req) => (
          <div 
            key={req._id} 
            className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-6 transition-transform hover:translate-x-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 border-2 border-black rounded-full flex items-center justify-center font-black">
                {req.participants[0]?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-black text-lg">
                  {req.participants[0]?.name} <span className="text-blue-600">wants to swap skills!</span>
                </p>
                <p className="text-xs font-bold text-slate-500">
                  You teach: <span className="text-black">{req.skillShared}</span> | 
                  You learn: <span className="text-black">{req.skillGained}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="hidden md:block text-right mr-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Suggested Time</p>
                <p className="text-xs font-bold">{req.timing}</p>
              </div>
              
              <button 
                onClick={() => handleAccept(req._id)}
                className="flex-1 md:flex-none bg-green-500 text-white px-6 py-2 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                Accept
              </button>
              
              <button className="flex-1 md:flex-none bg-slate-100 text-slate-400 px-6 py-2 rounded-xl font-black border-2 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-500 transition-all">
                Ignore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionsToDos;