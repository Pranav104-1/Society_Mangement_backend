import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Protect all admin routes with authentication and admin check
router.use(authMiddleware);
router.use(isAdmin);

// Admin routes for user management
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// Admin route for managing complaints
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complaints",
      error: error.message,
    });
  }
});

// Admin route for user verification
router.put("/users/:userId/verify", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { is_verified: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User verified successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying user",
      error: error.message,
    });
  }
});

// Admin route for user deletion
router.delete("/users/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
});

router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    return res.status(200).json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.put("/complaints/status", async (req, res) => {
  const { complaintId, status } = req.body;
  if (!complaintId || !status) {
    return res
      .status(400)
      .json({ message: "Complaint ID and status are required" });
  }
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    complaint.status = status;
    await complaint.save();
    return res
      .status(200)
      .json({ message: "Complaint status updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
