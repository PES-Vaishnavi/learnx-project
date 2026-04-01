import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import API from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const handleLogin = async () => {
  try {
    const res = await API.post("/auth/login", { email, password });
    
    // Clear old session data to prevent ID conflicts
    localStorage.clear(); 

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      
      // Capture the ID correctly from the backend response
      const idToSave = res.data.user._id || res.data.user.id;
      localStorage.setItem("userId", idToSave); 
      
      console.log("Login Success. User ID saved:", idToSave);
      navigate("/home");
    }
  } catch (err) {
    alert(err.response?.data?.message || "Login failed.");
  }
};

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center font-sans overflow-hidden">
      {/* Yellow Logo */}
      <div className="absolute top-10 left-10 bg-amber-400 px-6 py-2 text-2xl font-bold rounded-sm shadow-sm">
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
        <h2 className="text-4xl font-bold mb-8 text-slate-900">Login</h2>
        
        <div className="border-[4px] border-black rounded-[50px] p-12 w-[400px] bg-white shadow-2xl">
          <div className="space-y-6">
            <div className="text-left">
              <label className="block font-bold text-lg mb-2">Email:</label>
              <input 
                type="email"
                className="w-full border-3 border-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="text-left">
              <label className="block font-bold text-lg mb-2">Password:</label>
              <input 
                type="password" 
                className="w-full border-3 border-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <button 
              className="w-full bg-black text-white font-bold py-4 rounded-md hover:bg-slate-800 transition-colors text-xl mt-4"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>

        <div className="mt-6 font-bold text-sky-500">
          Not an existing user? <Link to="/register" className="underline hover:text-sky-600">Register</Link>
        </div>
      </div>
    </div>
  );
}