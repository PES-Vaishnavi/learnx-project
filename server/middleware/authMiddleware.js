// authMiddleware.js
import jwt from "jsonwebtoken"; // Ensure this is at the top!

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    // You are using the hardcoded string in Login, so use it here too
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("JWT Verify Failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
}