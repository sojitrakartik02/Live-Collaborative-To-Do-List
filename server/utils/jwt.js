const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

/**
 * Generates a signed JWT token for a user
 * @param {string} userId - The user ID to embed in the token
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verifies a JWT token and returns decoded data
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded payload if valid, null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
