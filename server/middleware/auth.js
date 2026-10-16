const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "datapulse-dev-secret-change-in-production",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "datapulse-dev-secret-change-in-production"
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({
      message: "Only Admin users can perform this action.",
    });
  }
  next();
}

module.exports = { signToken, protect, requireAdmin };
