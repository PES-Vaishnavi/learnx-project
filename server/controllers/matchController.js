import { spawn } from "child_process";
import User from "../models/User.js";
//import path from "path";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
export const getRecommendedMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const allUsers = await User.find({ _id: { $ne: req.user.id } });


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This goes up from controllers -> up from server -> down to python-service
const pythonScriptPath = join(__dirname, "../../python-service/matcher.py");
    const pythonProcess = spawn("python", [pythonScriptPath]);
    
    let resultData = "";
    let errorData = "";

    pythonProcess.stdin.write(JSON.stringify({ currentUser, allUsers }));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.stdout.on("end", () => {
      if (errorData) {
        console.error("Python Error:", errorData);
      }
      try {
        res.json(JSON.parse(resultData));
      } catch (e) {
        res.status(500).json({ message: "Engine output was invalid" });
      }
    });
  } catch (err) {
    console.error("Match Controller Error:", err.message);
    res.status(500).json({ message: "Matching failed" });
  }
};