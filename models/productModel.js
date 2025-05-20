const mongoose = require("mongoose");

// Product schema definition
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    default: 0,
  },
  size: {
    type: [String],
    required: true,
  },
  color: {
    type: [String],
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    // Change to an array for multiple images
    type: [String],
    default: [],
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

// Product model creation
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
