const mongoose = require('mongoose');

// Category schema definition
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
});

// Category model creation
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
