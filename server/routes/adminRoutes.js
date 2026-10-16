const express = require("express");
const User = require("../models/User");
const { protect, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Read-only administration: admins can review registered accounts, but cannot
// disable users, change roles, or ban companies from this API.
router.get("/users", protect, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({}, "name email role createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .lean();
    res.json({
      total: users.length,
      users: users.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || null,
        status: "Active",
      })),
    });
  } catch (error) {
    console.error("Unable to load admin user list:", error);
    res.status(500).json({ message: "Could not load registered users." });
  }
});

module.exports = router;
