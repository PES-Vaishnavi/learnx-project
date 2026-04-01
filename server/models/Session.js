import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["pending", "active", "rejected"], 
    default: "pending" 
  },
  skillGained: String, // Skill the sender wants to learn
  skillShared: String, // Skill the sender can teach
  timing: String,      // The overlap time string (e.g., "Monday 10:00")
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Session", SessionSchema);