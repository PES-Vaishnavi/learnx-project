import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import API from "../../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password });
      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center font-sans overflow-hidden">
      {/* Yellow Logo */}
      <div className="absolute top-10 left-10 bg-amber-400 px-6 py-2 text-2xl font-bold rounded-sm">
        LearnX
      </div>

      {/* Side Text */}
      <div className="absolute top-44 left-10 hidden md:flex flex-col gap-1">
        {["Learn", "and", "teach", "using", "LearnX"].map((text, i) => (
          <p key={i} className="text-orange-600 text-2xl font-bold leading-tight uppercase tracking-tighter">
            {text}
          </p>
        ))}
      </div>

      {/* Form Container */}
      <div className="text-center md:ml-40">
        <h2 className="text-4xl font-bold mb-8 text-slate-900">Register</h2>
        
        <div className="border-[4px] border-black rounded-[50px] p-10 w-[420px] bg-white shadow-2xl">
          <div className="space-y-4">
            <div className="text-left">
              <label className="block font-bold text-lg mb-1">Name:</label>
              <input 
                className="w-full border-3 border-black p-3 rounded-md" 
                placeholder="Name" 
                onChange={(e)=>setName(e.target.value)} 
              />
            </div>

            <div className="text-left">
              <label className="block font-bold text-lg mb-1">Email:</label>
              <input 
                className="w-full border-3 border-black p-3 rounded-md" 
                placeholder="Email" 
                onChange={(e)=>setEmail(e.target.value)} 
              />
            </div>

            <div className="text-left">
              <label className="block font-bold text-lg mb-1">Password:</label>
              <input 
                type="password" 
                className="w-full border-3 border-black p-3 rounded-md" 
                placeholder="Password" 
                onChange={(e)=>setPassword(e.target.value)} 
              />
            </div>

            <button 
              className="w-full bg-black text-white font-bold py-4 rounded-md hover:bg-slate-800 transition-colors text-xl mt-4"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </div>

        <div className="mt-6 font-bold text-cyan-500">
          Already have an account? <Link to="/login" className="underline hover:text-cyan-600">Login</Link>
        </div>
      </div>
    </div>
  );
}