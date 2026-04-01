import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from "./pages/Home";
import Profile from "./pages/Profile";
// 1. ADD THIS IMPORT (Adjust the path if your file is in a different folder)
import Match from "./pages/Match"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* 2. ADD THIS ROUTE */}
        <Route path="/matches" element={<Match />} />
      </Routes>
    </Router>
  );
}

export default App;