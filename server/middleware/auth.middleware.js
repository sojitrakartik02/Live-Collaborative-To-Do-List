const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyToken } = require("../utils/jwt");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Token verification failed." });
  }
};
