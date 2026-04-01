import User from "../models/User.js"; // Ensure this path is correct

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Renamed to updateProfile to match the route import
export const updateProfile = async (req, res) => {
  try {
    // Make sure 'availability' is being pulled from req.body
    const { name, skillsKnown, skillsToLearn, availability } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, skillsKnown, skillsToLearn, availability } }, // 👈 Add availability here
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
// Add this to your userController.js
// server/controllers/userController.js

export const removeAvailability = async (req, res) => {
  try {
    const { slotId } = req.body; // Pass the _id of the slot you want to delete
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { availability: { _id: slotId } } }, // 🎯 This strictly removes that one item
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error during deletion" });
  }
};