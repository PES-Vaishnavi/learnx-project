import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // This matches the "skillsKnown" you used in your Home.jsx PUT request
  skillsKnown: {
    type: [String],
    default: []
  },
  skillsToLearn: {
    type: [String],
    default: []
  },
  // This is the structure that matches your frontend payload
  availability: [
    {
      date: { type: String },
      start: { type: String },
      end: { type: String }
    }
  ]
}, { timestamps: true });

// CRITICAL: This is the ES Module export Node 22 is looking for
const User = mongoose.model("User", UserSchema);
export default User;