const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const imageRoutes = require("./routes/imagesRoutes");
const offerRoutes = require("./routes/offerRoute");
const newsLetterRoutes = require("./routes/newsLetterRoute");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const path = require("path");

// Middleware
app.use(express.json());

// Static file handling for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS configuration
const allowedOrigins = [
  "https://api.labzkit.com.au/",
  "https://labzkit.com.au",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// HTTP request logging
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/offer", offerRoutes);
app.use("/api/newsLetter", newsLetterRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Deployed");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
