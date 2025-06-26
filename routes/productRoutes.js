const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  getAllProductsByCategory,
  updateProduct,
  deleteProductImages,
} = require("../controllers/productController");
const upload = require("../config/multerConfig");
const router = express.Router();

// POST route to create a new product

// router.post("/", createProduct);
router.post("/", upload.array("images", 5), createProduct);
router.get("/category/:categoryId", getAllProductsByCategory);

// GET route to fetch all products
router.get("/", getAllProducts);

// GET route to fetch a product by ID
router.get("/:id", getProductById);

// DELETE route to delete a product by ID
router.delete("/:id", deleteProduct);
router.delete('/:id/images', deleteProductImages);

// PUT Updatedelete a product by ID
// router.put("/update/:id",  updateProduct);
router.put("/update/:id", upload.array("images"), updateProduct);

module.exports = router;
