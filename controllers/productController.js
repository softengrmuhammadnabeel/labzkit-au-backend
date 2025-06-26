const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require("../utils/cloudinary");


// Initialize DOMPurify with JSDOM for server-side use
const window = new JSDOM("").window;
const DOMPurifyInstance = DOMPurify(window);
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      discountedPrice,
      quantity,
      size,
      color,
      gender,
      description,
      existingImages = "[]", // Comes as a stringified JSON
    } = req.body;

    // Parse arrays from form-data fields
    const sizeArray = Array.isArray(size) ? size : JSON.parse(size);
    const colorArray = Array.isArray(color) ? color : JSON.parse(color);
    const oldImages = JSON.parse(existingImages);

    // Upload new images (req.files.images[] for multiple)
    let newImages = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      newImages = await uploadImagesToCloudinary(files, "product_images"); // Must return secure_url
    }

    const finalImages = [
      ...oldImages, // From front-end (already uploaded)
      ...newImages.map((img) => img.secure_url), // From new upload
    ];

    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category does not exist" });
    }

    // Sanitize rich text
    const sanitizedDescription = DOMPurifyInstance.sanitize(description);

    const product = new Product({
      name,
      category: categoryDoc._id,
      price,
      discountedPrice,
      quantity,
      size: sizeArray,
      color: colorArray,
      gender,
      description: sanitizedDescription,
      images: finalImages,
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Product creation failed:", error);
    if (error?.http_code === 400 && error.message.includes("File size too large")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const getAllProducts = async (req, res) => {
  try {
    const { name, gender, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Apply filters if query parameters are provided
    if (name) filter.name = new RegExp(name, "i");
    if (gender) filter.gender = gender;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * pageLimit;

    // Fetch products with pagination and populate category
    const products = await Product.find(filter)
      .skip(skip)
      .limit(pageLimit)
      .populate("category");

    // Get total count of products to calculate the total pages
    const totalProducts = await Product.countDocuments(filter);
    // console.log(products);
    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / pageLimit);

    res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

const getAllProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name, gender } = req.query;

  try {
    // Find the category by ID and select only the name field
    const category = await Category.findById(categoryId).select("name");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const filter = { category: categoryId };
    if (name) filter.name = new RegExp(name, "i");
    if (gender) filter.gender = gender;

    const products = await Product.find(filter).populate("category");

    res.status(200).json({ products, category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).populate("category"); // Populate category for the product
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    price,
    quantity,
    size,
    discountedPrice,
    color,
    gender,
    description,
  } = req.body;

  try {

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {};

    // Update basic fields
    if (name) updateData.name = name;
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({ message: "Category does not exist" });
      }
      updateData.category = categoryDoc._id;
    }
    if (price) updateData.price = price;
    if (discountedPrice) updateData.discountedPrice = discountedPrice || 0;
    if (quantity) updateData.quantity = quantity;
    if (size) updateData.size = Array.isArray(size) ? size : JSON.parse(size || "[]");
    if (color) updateData.color = Array.isArray(color) ? color : JSON.parse(color || "[]");
    if (gender) updateData.gender = gender;
    if (description) updateData.description = description;

    // Handle images
    if (req.files && req.files.length > 0) {
      try {
        const newImages = await uploadImagesToCloudinary(req.files, "product_images");

        const existingImages = Array.isArray(product.images) ? product.images : [];
        updateData.images = [...existingImages, ...newImages];
      } catch (error) {
        console.error('Image Upload Error:', error);
        return res.status(500).json({ message: "Image upload failed", error: error.message });
      }
    } else {
      // If no new images, retain existing images
      updateData.images = Array.isArray(product.images) ? product.images : [];
    }


    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category");

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

const deleteProductImages = async (req, res) => {
  const { id } = req.params; // Product ID
  const { imagesToDelete } = req.body; // Array of image URLs to delete
  if (!imagesToDelete.length === 0) {
    return res.status(400).json({ message: "No images specified for deletion." });
  }

  try {
    // Find the product in the database
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Delete specified images from Cloudinary
    try {
      const deleteResults = await deleteImagesFromCloudinary(imagesToDelete);
    } catch (cloudinaryError) {
      // console.error("Cloudinary Deletion Error:", cloudinaryError.message);
    }

    // Remove only the specified images from the MongoDB images array
    const updatedImages = product.images.filter(
      (image) => !imagesToDelete.includes(image)
    );

    // Update the product's images array in MongoDB
    product.images = updatedImages;
    await product.save();

    // Respond with the updated product
    res.status(200).json({
      message: "Images deleted successfully from Cloudinary and MongoDB.",
      updatedProduct: product,
    });
  } catch (error) {
    console.error("Error deleting product images:", error);
    res.status(500).json({ message: "Error deleting images.", error: error.message });
  }
};



module.exports = {
  createProduct,
  getAllProducts,
  getAllProductsByCategory,
  getProductById,
  deleteProduct,
  updateProduct,
  deleteProductImages
};
