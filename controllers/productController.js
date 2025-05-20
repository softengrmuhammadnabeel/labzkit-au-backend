const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const { uploadImagesToCloudinary } = require("../utils/cloudinary");

// Initialize DOMPurify with JSDOM for server-side use
const window = new JSDOM("").window;
const DOMPurifyInstance = DOMPurify(window);

const createProduct = async (req, res) => {
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
  } = req.body;
  // const images = req.files?.map((file) => uploadImagesToCloudinary(file, 'product_images')) || [];
  // Upload images to Cloudinary and get the image URLs
  const images = req.files ? await uploadImagesToCloudinary(req.files, 'product_images') : [];
  try {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category does not exist" });
    }
    // Ensure size and color are arrays
    const sizeArray = Array.isArray(size) ? size : JSON.parse(size);
    const colorArray = Array.isArray(color) ? size : JSON.parse(color);

    // Sanitize description
    const sanitizedDescription = DOMPurifyInstance.sanitize(description);

    const product = new Product({
      name,
      category: categoryDoc._id,
      price,
      quantity,
      discountedPrice,
      size: sizeArray,
      color: colorArray,
      gender,
      description: sanitizedDescription,
      images,
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
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
    let newImages;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {};

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
    if (size) updateData.size = Array.isArray(size) ? size : JSON.parse(size);
    if (color)
      updateData.color = Array.isArray(color) ? color : JSON.parse(color);
    if (gender) updateData.gender = gender;
    if (description) updateData.description = description;
    // if (req.files.length > 0) {
    //   newImages = req.files?.map((file) => file.filename) || [];
    //   updateData.images = [...product.images, ...newImages]; // Merge new images with existing ones
    // } else {
    //   newImages = req.body.images;
    //   if (!Array.isArray(newImages)) {
    //     newImages = [];
    //   }
    //   updateData.images = newImages;
    // }

    if (req.files && req.files.length > 0) {
      // Upload to Cloudinary
      const uploadResults = await uploadImagesToCloudinary(req.files, 'product_images');

      // Cloudinary returns full objects, extract the secure URLs
      const newImages = uploadResults.map(result => result.secure_url);

      // Merge with existing images
      updateData.images = [...product.images, ...newImages];
    } else {
      newImages = req.body.images;
      if (!Array.isArray(newImages)) {
        newImages = [];
      }
      updateData.images = newImages;
    }


    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category");

    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllProductsByCategory,
  getProductById,
  deleteProduct,
  updateProduct,
};
