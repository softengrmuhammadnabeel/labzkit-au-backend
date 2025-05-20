const express = require("express");
const { createOrder } = require("../controllers/orderController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

// POST route to create a new category
router.post("/create", createOrder);

module.exports = router;
