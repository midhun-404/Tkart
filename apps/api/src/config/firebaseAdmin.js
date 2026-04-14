const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json'); // Moved inside try-catch

// Check if already initialized
if (!admin.apps.length) {
    try {
        let credential;

        // Option 1: Load from Environment Variable (Render/Production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccountConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccountConfig);
        }
        // Option 2: Load from Local File (Development)
        else {
            const serviceAccount = require('./serviceAccountKey.json');
            credential = admin.credential.cert(serviceAccount);
        }

        admin.initializeApp({
            credential: credential,
            storageBucket: 'trendkart-53484.appspot.com'
        });
        console.log("Firebase Admin Initialized");
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const bucket = storage.bucket();

module.exports = { admin, db, auth, storage, bucket };
