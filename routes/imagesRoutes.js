const express = require("express");
const { createImages, getImages, updateImages, deleteImages } = require("../controllers/imagesController");
const upload = require("../config/multerConfig");
const router = express.Router();

// Route to get all images
router.get("/", getImages);

// Route to create/upload new images
router.post("/", upload.array('images'), createImages);

// Route to update existing images by ID
router.put("/:id", upload.array('images'), updateImages);

// Route to delete an image document by ID
router.delete("/:id", deleteImages);

module.exports = router;
