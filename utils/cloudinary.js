
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
        } else {
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
        console.error("Error uploading to Cloudinary:", error);
        throw new Error("Failed to upload images to Cloudinary");
    }
};

module.exports = {uploadImagesToCloudinary};
