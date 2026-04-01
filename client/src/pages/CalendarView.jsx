import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import API from "../services/api";
import 'react-calendar/dist/Calendar.css';

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [savedSlots, setSavedSlots] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await API.get("/user/profile");
        if (res.data.availability) setSavedSlots(res.data.availability);
      } catch (err) { console.error("Error fetching slots", err); }
    };
    fetchAvailability();
  }, []);

  const addSlot = async () => {
  if (savedSlots.length >= 5) return alert("Max 5 slots allowed!");
  
  const newSlot = { 
    date: selectedDate.toDateString(), 
    start: startTime, 
    end: endTime 
  };

  try {
    // 1. Send the data to the server
    const res = await API.put("/user/profile", { 
      availability: [...savedSlots, newSlot] 
    });

    // 2. IMPORTANT: Use the data returned from the database
    // This ensures your local state has the MongoDB _id for each slot
    if (res.data && res.data.availability) {
      setSavedSlots(res.data.availability);
      alert("Slot saved to cloud!");
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save to cloud. Check if the server is running.");
  }
};

  const deleteSlot = async (slotId, index) => {
  // 1. Update local UI immediately for responsiveness
  const updated = savedSlots.filter((_, i) => i !== index);
  setSavedSlots(updated);

  try {
    const token = localStorage.getItem("token");
    // 2. Call the specific remove route using the slot's ID
    await API.post("/user/remove-availability", 
      { slotId }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Slot deleted from DB");
  } catch (err) {
    console.error("Delete failed", err);
    // Optional: Re-fetch if delete fails to keep UI in sync
    alert("Failed to delete slot from server.");
  }
};

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Select Your Availability</h2>
      </div>

      <div className="flex flex-col items-center">
        {/* Calendar - 50% Width on desktop */}
        <div className="w-full md:w-1/2 bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-xl shadow-slate-100">
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate} 
            className="border-none w-full font-sans"
          />
        </div>

        {/* Duration Selection */}
        <div className="mt-12 w-full text-center">
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-8">
            Select the duration of the day during which you will be most available
          </h3>
          
          <div className="flex flex-wrap justify-center items-end gap-6">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-2">Start</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-slate-200 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-2">End</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-slate-200 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500 transition-all" />
            </div>
            <button onClick={addSlot} className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
              SAVE SLOT
            </button>
          </div>
        </div>

        {/* Saved List */}
        {savedSlots.length > 0 && (
          <div className="mt-20 w-full">
            <h3 className="text-xl font-black uppercase mb-8 border-b-2 border-slate-100 w-fit pb-2">Your Saved Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSlots.map((slot, index) => {
  // 🛡️ Guard Clause: Don't render if the slot is missing date/time data
  if (!slot || !slot.date) return null;

  return (
    <div key={slot._id || index} className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-slate-50 group hover:border-blue-300 transition-colors">
      <div>
        <p className="font-black text-slate-800">{slot.date}</p>
        <p className="text-sm font-bold text-slate-400">{slot.start} — {slot.end}</p>
      </div>
      <button 
        onClick={() => deleteSlot(slot._id, index)} 
        className="text-slate-300 hover:text-red-500 font-bold transition-colors"
      >
        ✕
      </button>
    </div>
  );
})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}