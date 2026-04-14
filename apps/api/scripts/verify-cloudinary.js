const { uploadToCloudinary, deleteFromCloudinary } = require('../src/utils/cloudinary');
const path = require('path');
const fs = require('fs');

async function verifyCloudinary() {
    try {
        console.log("--- Starting Cloudinary Verification ---");

        // Create a dummy image buffer (1x1 transparent pixel png)
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

        console.log("Uploading test image...");
        const url = await uploadToCloudinary(buffer, 'trendkart/test');
        console.log("Upload Successful! URL:", url);

        console.log("Deleting test image...");
        await deleteFromCloudinary(url);
        console.log("Delete Successful!");

        console.log("Verification Complete!");
    } catch (error) {
        console.error("Verification Failed:", error);
    }
}

verifyCloudinary();

