const { bucket, admin } = require('../src/config/firebaseAdmin');

async function verifyStorage() {
    try {
        console.log("--- Starting SIMPLE Verification ---");

        // Check bucket name
        // admin.storage().bucket() returns a bucket object immediately, doesn't validate existence.
        console.log(`Bucket Name configured: ${bucket.name}`);

        console.log("Attempting to list files...");
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log("Successfully connected to Storage.");
        console.log(`Found ${files.length} files.`);

        console.log("Verification Complete!");
    } catch (error) {
        console.log("--- ERROR CAUGHT ---");
        console.log("Message:", error.message);
        console.log("Code:", error.code);
        if (error.response) {
            console.log("Response Status:", error.response.status);
            console.log("Response Data:", JSON.stringify(error.response.data));
        }
        process.exit(1);
    }
}

verifyStorage();

