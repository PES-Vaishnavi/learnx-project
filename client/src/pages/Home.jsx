import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarView from "./CalendarView";
import Sessions from "./Sessions";

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("User");
  const [view, setView] = useState("Home");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
        <div className="bg-amber-400 px-8 py-2 rounded-md text-2xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          LearnX
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/profile")}
            className="bg-slate-100 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-all"
          >
            Profile
          </button>
          <button 
            onClick={handleLogout}
            className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-slate-800 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-10 py-12">
        <h1 className="text-4xl font-black mb-8 text-slate-900 uppercase">
          Welcome, <span className="text-blue-600">{name}</span>!
        </h1>

        {/* NAVIGATION TABS */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
          {["Home", "Sessions", "Matches", "Calendar"].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Matches") navigate("/matches");
                else setView(item);
              }}
              className={`px-8 py-2 rounded-full font-bold shadow-sm transition-all border-2 ${
                view === item 
                ? "bg-black text-white border-black" 
                : "bg-white text-slate-600 border-transparent hover:border-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        {/* We wrap the existing grid in a check for "Home" view */}
        {view === "Home" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-500">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-3 space-y-6">
              <div className="text-5xl font-black text-slate-800 leading-none tracking-tighter uppercase italic">
                <p>Learn</p>
                <p className="text-orange-500">Smarter</p>
              </div>
              
              <p className="text-xl italic font-medium text-slate-500 border-l-4 border-amber-400 pl-4">
                "Make learning fun with LearnX"
              </p>

              <div className="space-y-3 font-bold text-lg text-slate-700 pt-4">
                <p className="flex items-center gap-3"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">1</span> Create profile and select your availability in Calendar</p>
                <p className="flex items-center gap-3"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">2</span> Find matches</p>
                <p className="flex items-center gap-3"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">3</span> Start learning!</p>
              </div>
            </div>

            {/* RIGHT COLUMN: MAIN IMAGE CARD */}
            <div className="lg:col-span-9 bg-white rounded-[2rem] shadow-[20px_20px_60px_#bebebe] p-4 border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
                alt="Students collaborating" 
                className="w-full h-[450px] object-cover rounded-[1.5rem]"
              />
            </div>
          </div>
        ) : view === "Calendar" ? (
  <div className="animate-in slide-in-from-bottom-4 duration-500">
    <CalendarView />
  </div>
) : view === "Sessions" ? (
  <div className="animate-in slide-in-from-bottom-4 duration-500">
    <Sessions /> 
  </div>
) : null}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t-4 border-black p-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="bg-amber-400 px-6 py-2 font-black text-xl rounded-sm border-2 border-black">
            LearnX
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Follow us on</span>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-all shadow-md">Insta</div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-all shadow-md">FB</div>
              <div className="w-10 h-10 bg-sky-400 rounded-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-all shadow-md">X</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}