const { sendEmail, sendOrderConfirmation } = require("../config/emailService");
const Order = require("../models/OrderModel");
const Product = require("../models/productModel");

const createOrder = async (req, res) => {
  try {
    const {
      products,
      address,
      city,
      state,
      postCode,
      country,
      name,
      email,
      numberOne,
      numberTwo = "",
      description = "",
    } = req.body;

    // Validate input
    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate total price
    let totalPrice = 0;
    for (let product of products) {
      const productData = await Product.findById(product.productId);
      if (!productData) {
        return res
          .status(404)
          .json({ message: `Product not found: ${product.productId}` });
      }

      // Ensure there is enough stock for the order
      if (productData.quantity < product.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product: ${product.productId}`,
        });
      }

      // Calculate total price for this product
      const price = productData.discountedPrice
        ? productData.discountedPrice
        : productData.price;
      totalPrice += price * product.quantity;

      // Subtract the ordered quantity from the product's stock
      productData.quantity -= product.quantity;
      await productData.save(); // Save the updated product data
    }

    // Create the order
    const newOrder = new Order({
      products,
      totalPrice,
      address,
      city,
      name,
      email,
      state,
      postCode,
      country,
      numberOne,
      numberTwo: numberTwo || "",
      description,
    });

    await newOrder.save();
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("email")
      .populate("products.productId"); // Send success response

    await sendOrderConfirmation(populatedOrder);
    res.status(201).json({
      message: "Order processed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = { createOrder };
