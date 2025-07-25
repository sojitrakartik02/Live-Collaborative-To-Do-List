const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { generateToken } = require("../utils/jwt");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create({ username, email, password });

    
    const token = generateToken(user._id);
    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};
