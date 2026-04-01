// server/routes/userRoutes.js
import express from "express";
import { 
  getProfile, 
  updateProfile, 
  removeAvailability 
} from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user profile data
router.get("/profile", auth, getProfile);

// Update general profile info (name, skills)
router.put("/profile", auth, updateProfile);

// Specific route to delete an availability slot
router.post("/remove-availability", auth, removeAvailability);

export default router;