const { bucket } = require('../config/firebaseAdmin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - The file object from multer (memory storage)
 * @param {String} folder - The folder in the bucket (default: 'uploads')
 * @returns {Promise<String>} - The public URL of the uploaded file
 */
const uploadImage = async (file, folder = 'uploads') => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject('No file provided');
        }

        const newFileName = `${folder}/${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
        const fileUpload = bucket.file(newFileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (error) => {
            console.error('Firebase Storage Upload Error:', error);
            reject('Something is wrong! Unable to upload at the moment.');
        });

        blobStream.on('finish', async () => {
            // Make the file public
            try {
                await fileUpload.makePublic();
                // Construct the public URL
                // Format: https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
                // OR specific for Firebase: https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/FILE_PATH?alt=media

                // Using the standard public URL for Google Cloud Storage objects if makePublic() is used:
                // const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;

                // However, for Firebase specifically, it's often better to generate a signed URL or use the token based one.
                // But since we used makePublic(), the GCS public link works. 
                // Let's use getSignedUrl for better control or just the public link.
                // For simplicity and "all storages on database" request, a long-lived public link is best.

                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
                resolve(publicUrl);
            } catch (err) {
                reject(err);
            }
        });

        blobStream.end(file.buffer);
    });
};

/**
 * Delete a file from Firebase Storage
 * @param {String} imageUrl - The full URL of the image
 */
const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        // Extract file path from URL
        // Expected URL: https://storage.googleapis.com/BUCKET_NAME/folder/filename

        // This simple split works if we follow the standard GCS URL format.
        // If it's a different format, we might need more robust parsing.

        const bucketName = bucket.name;
        const prefix = `https://storage.googleapis.com/${bucketName}/`;

        if (imageUrl.startsWith(prefix)) {
            const filePath = imageUrl.replace(prefix, '');
            const file = bucket.file(filePath);
            await file.delete();
            console.log(`Deleted file: ${filePath}`);
        } else {
            console.warn(`Could not extract file path from URL: ${imageUrl}, skipping delete.`);
        }

    } catch (error) {
        console.error('Firebase Storage Delete Error:', error);
        // Don't throw, just log. We don't want to break the main flow if deletion fails.
    }
};

module.exports = { uploadImage, deleteImage };
