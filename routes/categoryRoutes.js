const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");
const upload = require("../config/multerConfig");
const router = express.Router();

// POST route to create a new category
router.post("/", upload.single("image"), createCategory);
router.put("/:id", upload.single("image"), updateCategory);

// GET route to fetch all categories
router.get("/", getAllCategories);

// GET route to fetch a category by ID
router.get("/:id", getCategoryById);

// DELETE route to delete a category by ID
router.delete("/:categoryId", deleteCategory);

module.exports = router;
