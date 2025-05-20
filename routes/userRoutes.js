const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);
router.post("/forget-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
//
