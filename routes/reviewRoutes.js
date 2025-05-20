const express = require("express");
const {
  getAllReviews,
  addReview,
  deleteReview,
} = require("../controllers/reviewController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", authenticate, addReview);
router.delete("/delete/:reviewId", authenticate, deleteReview);
router.get("/:productId", getAllReviews);

module.exports = router;
