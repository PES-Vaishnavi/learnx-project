// server/routes/sessionRoutes.js
import express from "express";
import { 
  getSessionStatus, 
  initiateSession, 
  updateSessionStatus,
  getActiveSessions
} from "../controllers/sessionController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/active", auth, getActiveSessions);
// Get status between current user and a specific target user
router.get("/status/:targetUserId", auth, getSessionStatus);

// Create a new session request
router.post("/initiate", auth, initiateSession);

// Accept or Reject a session
router.put("/:sessionId/status", auth, updateSessionStatus);
router.get("/active", auth, getActiveSessions);
export default router;