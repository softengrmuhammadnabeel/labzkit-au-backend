// // // utils/cloudinary.js
// // import { v2 as cloudinary } from 'cloudinary';

// // cloudinary.config({
// //     cloud_name: 'backendsetup',
// //     api_key: '372874573586515',
// //     api_secret: process.env.CLOUDINARY_API_SECRET // Use env vars!
// // });

// // export default cloudinary;



// const cloudinary = require("cloudinary").v2;
// const fs = require("fs");

// // Set up Cloudinary config (ensure your Cloudinary credentials are in your .env file)
// cloudinary.config({
//     cloud_name: 'backendsetup',
//     api_key: '372874573586515',
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /**
//  * Uploads a single or multiple images to Cloudinary
//  * @param {Array} files - Array of files to be uploaded (single or multiple)
//  * @returns {Promise<Array>} - Returns an array of image URLs
//  */
// const uploadImagesToCloudinary = async (files, folder_name) => {
//     try {
//         let uploadPromises = ''
//         console.log("Category", files);
//         // If files is an array, upload each file to Cloudinary
//         if (folder_name === 'category_images') {
//             uploadPromises = cloudinary.uploader.upload(files.path, { folder: folder_name })
//             console.log("I runded ");
//         }
//         else {
//             uploadPromises = files.map((file) =>
//                 cloudinary.uploader.upload(file.path, { folder: folder_name })
//             );
//             console.log("I runded else");
//         }

//         // Wait for all uploads to complete and get the results
//         const uploadResults = await Promise.all(uploadPromises);

//         fs.unlinkSync(file.path);
//         // Return an array of image URLs
//         return uploadResults.map((result) => result.secure_url);
//     } catch (error) {
//         console.error("Error uploading to Cloudinary:", error);
//         throw new Error("Failed to upload images to Cloudinary");
//     }
// };

// module.exports = { uploadImagesToCloudinary };



const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require('path')
cloudinary.config({
    cloud_name: 'backendsetup',
    api_key: '372874573586515',
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
