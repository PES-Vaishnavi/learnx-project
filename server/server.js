import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js"; // 👈 Don't forget this!
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = 5000;

// ✅ Create the shared HTTP server
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://learnx-frontend-final.onrender.com",
    methods: ["GET", "POST"]
  }
});
app.use(cors({
  origin: "https://learnx-frontend-final.onrender.com", // Your NEW frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/sessions", sessionRoutes); // 👈 Ensure your sessions logic is routed

// --- Socket.io Logic ---
io.on("connection", (socket) => {
  console.log(`📡 User Connected: ${socket.id}`);

  // 1. Joining a specific session room
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
  });

  // 2. Real-time Chat Messaging
  socket.on("send-message", (data) => {
    io.to(data.sessionId).emit("receive-message", data);
  });

  // 3. Video Call: Initiating a call
  socket.on("call-user", ({ sessionId, signalData, from }) => {
    socket.to(sessionId).emit("incoming-call", { signalData, from });
  });

  // 4. Video Call: Answering a call
  socket.on("answer-call", (data) => {
    socket.to(data.sessionId).emit("call-accepted", data.signal);
  });

  // ✅ MOVE THIS INSIDE THE CONNECTION BLOCK (Before the closing })
  socket.on("end-call", ({ sessionId }) => {
    console.log(`🚫 Call ended in session: ${sessionId}`);
    socket.to(sessionId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("🔌 User Disconnected");
  });
}); // <--- This closes the io.on("connection")
// ✅ DB Connect & use SERVER.LISTEN
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DATABASE CONNECTED");
    // 📢 CRITICAL CHANGE HERE: Use 'server', not 'app'
    server.listen(PORT, () => {
      console.log(`🚀 REAL-TIME SERVER RUNNING ON PORT ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB ERROR:", err.message));