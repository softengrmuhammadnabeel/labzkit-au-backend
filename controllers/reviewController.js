const Review = require("../models/reviewModel");
const Product = require("../models/productModel");

const getAllReviews = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found!" });
  }
  const reviews = await Review.find({ product: productId }).populate('user', 'firstName lastName email');
  res.json({ reviews });
};

const addReview = async (req, res) => {
  try {
    const { productId, rating, reviewText } = req.body;

    // Validate the input
    if (!productId || !rating) {
      return res
        .status(400)
        .json({ message: "Product ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create a new review
    const newReview = new Review({
      user: req.user.userId, // Assuming you have user data in `req.user` from authentication
      product: productId,
      rating,
      reviewText,
    });

    await newReview.save();
    await product.save();

    // Send success response
    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const reviews = await Review.findOneAndDelete(reviewId);
  res.json({ reviews });
};

module.exports = { getAllReviews, addReview, deleteReview };
