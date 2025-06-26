
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require('path')
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY_VALUE,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImagesToCloudinary = async (files, folder_name) => {
    try {

        let uploadResults = [];

        // Handle single file (category image)
        if (folder_name === ('category_images' || 'banner_images')) {
            const result = await cloudinary.uploader.upload(path.resolve(files.path), { folder: folder_name });
            uploadResults.push(result);

            // Delete local file
            fs.unlinkSync(files.path);
            uploadResults = [result];
        } else if (folder_name === 'product_images') {
            // Handle multiple files
            const uploadPromises = await files.map((file) =>
                cloudinary.uploader.upload(path.resolve(file.path), { folder: folder_name })
            );

            uploadResults = await Promise.all(uploadPromises);

            // Delete all uploaded local files
            for (const file of files) {
                fs.unlinkSync(file.path);
            }
        }
        else {
            // Handle multiple files
            const uploadPromises = files.map((file) =>
                cloudinary.uploader.upload(path.resolve(file.path), { folder: folder_name })
            );

            uploadResults = await Promise.all(uploadPromises);

            // Delete all uploaded local files
            for (const file of files) {
                fs.unlinkSync(file.path);
            }
        }

        // Return array of Cloudinary URLs
        return uploadResults.map(result => result.secure_url);

    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);

        // Delete any local files even on error
        if (Array.isArray(files)) {
            files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        } else {
            if (fs.existsSync(files.path)) fs.unlinkSync(files.path);
        }

        // Re-throw the original error so that controller can handle it
        throw error;
    }
};


const deleteImagesFromCloudinary = async (imageUrls) => {
    if (!imageUrls.length === 0) {
        throw new Error("No image URLs provided for deletion.");
    }

    try {
        const publicId = extractPublicIdFromUrl(imageUrls);
        const results = await cloudinary.uploader.destroy(publicId);


        return results;
    } catch (error) {
        console.error("Error deleting images from Cloudinary:", error.message);
        throw error;
    }
};


const extractPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const filenameWithExtension = parts[parts.length - 1]; // e.g., "image_name.jpg"
        const publicId = filenameWithExtension.split('.')[0]; // Extract "image_name"
        const folderPath = parts.slice(parts.length - 2, parts.length - 1).join('/'); // Extract folder name

        if (!publicId || !folderPath) {
            throw new Error("Invalid Cloudinary URL format");
        }

        return `${folderPath}/${publicId}`; // Combine folder and public_id
    } catch (error) {
        console.error("Error extracting public ID from URL:", error.message);
        return null; // Return null in case of errors
    }
};


module.exports = { uploadImagesToCloudinary, deleteImagesFromCloudinary };
