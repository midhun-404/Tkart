const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Ensure env vars are read
dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Folder name in Cloudinary
 * @returns {Promise<String>} Secure URL of uploaded image
 */
const uploadToCloudinary = (buffer, folder = 'trendkart/products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Delete an image from Cloudinary
 * @param {String} imageUrl - Full URL of the image
 */
const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        // Extract Public ID
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567/trendkart/products/sample.jpg
        // Public ID: trendkart/products/sample

        const parts = imageUrl.split('/');
        const filename = parts.pop();
        const publicId = parts.slice(parts.indexOf('upload') + 2).join('/') + '/' + filename.split('.')[0];

        // Remove version number if present in publicId path extraction usually isn't needed if we split correctly
        // A safer regex approach:
        const regex = /\/v\d+\/([^/]+)\./;
        // This is tricky because folders can vary. 
        // Let's try a standard extraction assuming our folder structure.

        // Simpler way: Cloudinary URLs usually have `/upload/v<version>/<public_id>.<ext>`
        const splitUrl = imageUrl.split('/upload/');
        if (splitUrl.length < 2) return;

        const pathAfterUpload = splitUrl[1]; // v12345/folder/file.jpg
        const pathParts = pathAfterUpload.split('/');
        if (pathParts[0].startsWith('v')) {
            pathParts.shift(); // remove version
        }

        const publicIdWithExt = pathParts.join('/');
        const publicIdFinal = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension

        await cloudinary.uploader.destroy(publicIdFinal);
        console.log(`Deleted from Cloudinary: ${publicIdFinal}`);
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
