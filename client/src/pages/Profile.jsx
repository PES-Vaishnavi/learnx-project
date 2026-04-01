import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teach, setTeach] = useState([]);
  const [learn, setLearn] = useState([]);
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/profile");
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        
        // SYNC: Use 'skillsKnown' from your Mongoose Model
        setTeach(res.data.skillsKnown || []); 
        setLearn(res.data.skillsToLearn || []);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const addSkill = (type) => {
    if (type === "teach" && teachInput.trim()) {
      setTeach([...teach, teachInput.trim()]);
      setTeachInput("");
    }
    if (type === "learn" && learnInput.trim()) {
      setLearn([...learn, learnInput.trim()]);
      setLearnInput("");
    }
  };

  const removeSkill = (type, index) => {
    if (type === "teach") setTeach(teach.filter((_, i) => i !== index));
    if (type === "learn") setLearn(learn.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    try {
      // SYNC: Ensure the keys here match your userController.js exactly
      await API.put("/user/profile", {
        name,
        email,
        skillsKnown: teach, 
        skillsToLearn: learn,
      });
      alert("Profile Updated! ✅");
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed ❌");
    }
  };

  if (loading) return <div className="p-20 font-bold text-slate-400">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-left">
      <header className="flex justify-between items-center px-10 py-6 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div 
          onClick={() => navigate("/home")} 
          className="bg-amber-400 px-6 py-2 text-2xl font-black rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          LearnX
        </div>
        <button 
          onClick={() => navigate("/home")} 
          className="font-bold uppercase text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Home
        </button>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="lg:w-1/3">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm sticky top-32">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center border border-blue-600 mb-8 shadow-lg shadow-blue-100">
                <span className="text-3xl font-black text-white">{name?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Account Settings</h1>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-[10px] uppercase text-slate-400 mb-1 tracking-widest">Full Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full border border-slate-200 p-3 rounded-xl font-medium bg-slate-50 outline-none focus:border-blue-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-[10px] uppercase text-slate-400 mb-1 tracking-widest">Email</label>
                  <input 
                    value={email} 
                    disabled 
                    className="w-full border border-slate-100 p-3 rounded-xl font-medium bg-slate-100 text-slate-400 cursor-not-allowed" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-400 rounded-full"></span>
                Skills to Teach
              </h2>
              <div className="flex gap-3 mb-6">
                <input 
                  value={teachInput} 
                  onChange={(e) => setTeachInput(e.target.value)} 
                  className="flex-grow border border-slate-200 p-3 rounded-xl font-medium outline-none focus:border-orange-400" 
                  placeholder="e.g. React" 
                />
                <button 
                  onClick={() => addSkill("teach")} 
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-500 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {teach.map((s, i) => (
                  <div key={i} className="bg-orange-50 text-orange-700 border border-orange-100 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
                    {s} <button onClick={() => removeSkill("teach", i)} className="text-orange-300 hover:text-orange-600">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Skills to Learn
              </h2>
              <div className="flex gap-3 mb-6">
                <input 
                  value={learnInput} 
                  onChange={(e) => setLearnInput(e.target.value)} 
                  className="flex-grow border border-slate-200 p-3 rounded-xl font-medium outline-none focus:border-blue-500" 
                  placeholder="e.g. Figma" 
                />
                <button 
                  onClick={() => addSkill("learn")} 
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {learn.map((s, i) => (
                  <div key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
                    {s} <button onClick={() => removeSkill("learn", i)} className="text-blue-300 hover:text-blue-600">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={saveProfile} 
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-lg"
            >
              Update Profile Details
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}