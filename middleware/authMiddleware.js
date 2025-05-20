const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header("Authorization");

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Remove the 'Bearer ' part from the token if it exists
  const tokenWithoutBearer = token.replace("Bearer ", "");

  try {
    // Verify the token
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ msg: "Token is invalid" });
    }

    // Find the user by the decoded userId
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ msg: "User Not Found!" });
    }

    // Attach the user ID to the request object
    req.user = decoded;
    next(); // Call the next middleware
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token, authorization denied" });
  }
};

module.exports = authenticate;
