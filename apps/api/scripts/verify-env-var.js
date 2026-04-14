const admin = require('firebase-admin');
const serviceAccount = require('../src/config/serviceAccountKey.json');

// Simulate the Render Environment
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(serviceAccount);

// Force reload of the config file
delete require.cache[require.resolve('./src/config/firebaseAdmin')];
const { db, bucket } = require('../src/config/firebaseAdmin');

async function verify() {
    try {
        console.log("Attempting to initialize from ENV VAR...");
        if (admin.apps.length) {
            console.log("Success: App initialized.");
            console.log("Bucket:", bucket.name);
        } else {
            console.error("Failed: App not initialized.");
        }
    } catch (e) {
        console.error(e);
    }
}

verify();

