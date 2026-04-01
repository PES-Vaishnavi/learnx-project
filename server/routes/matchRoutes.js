import express from "express";
import { getRecommendedMatches } from "../controllers/matchController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/matches/recommend
 * @desc    Get sorted list of potential mentors/peers based on Python engine score
 * @access  Private
 */
router.get("/recommend", auth, getRecommendedMatches);

export default router;