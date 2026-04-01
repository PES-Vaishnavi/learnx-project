import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    console.log("DATA RECEIVED FROM FRONTEND:", req.body);
    const { name, email, password } = req.body; 
    
    // Check if anything is undefined
    if(!name || !email || !password) {
       return res.status(400).json({ message: "Fields are missing in request" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword,
      skillsToTeach: [], // Initialize as empty arrays
      skillsToLearn: [] 
    });

    await newUser.save();
    res.status(201).json({ message: "User created!" });
  } catch (err) {
    console.log("THE ACTUAL DATABASE ERROR:", err.message); // This will show in your terminal!
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    // ✅ FIX: Added user._id to the response object
    res.json({ 
      token, 
      user: { 
        _id: user._id, // This is the missing piece!
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};