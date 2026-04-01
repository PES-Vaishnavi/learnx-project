import Session from "../models/Session.js";

// Check if a session exists between two users
// server/controllers/sessionController.js
export const getSessionStatus = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const session = await Session.findOne({
      $or: [
        { sender: req.user.id, receiver: targetUserId },
        { sender: targetUserId, receiver: req.user.id }
      ]
    });
    
    // If no session found, return null so the frontend shows "Initiate"
    if (!session) return res.json(null);

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

// Create a new session request
export const initiateSession = async (req, res) => {
  try {
    const { receiverId, skillGained, skillShared, timing } = req.body;
    
    // Prevent duplicate requests
    const existing = await Session.findOne({
      sender: req.user.id,
      receiver: receiverId
    });
    if (existing) return res.status(400).json({ message: "Request already sent" });

    const newSession = new Session({
      sender: req.user.id,
      receiver: receiverId,
      skillGained,
      skillShared,
      timing
    });

    await newSession.save();
    res.json(newSession);
  } catch (err) {
    res.status(500).json({ message: "Initiation failed" });
  }
};

// Accept or Reject a session
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
// 3. Get all sessions for the user (Both Sent and Received)
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ participants: req.user.id })
      .populate("participants", "name")
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sessions" });
  }
};

// 4. Delete/Clear Session
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: "Session removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// server/routes/sessionRoutes.js


export const getActiveSessions = async (req, res) => {
  try {
    // Finds sessions where the user is either the sender or receiver AND it's active
    const sessions = await Session.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      status: "active"
    })
    .populate("sender", "name") // Get the sender's name
    .populate("receiver", "name"); // Get the receiver's name

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching active sessions" });
  }
};