
const admin = require('firebase-admin');

console.log("Testing Firebase Connection...");

try {
    // Attempt to initialize (mimic app.js/firebaseAdmin.js)
    if (!admin.apps.length) {
        admin.initializeApp(); // Uses Google Application Default Credentials
    }

    const db = admin.firestore();
    console.log("Firebase initialized.");

    async function testDb() {
        try {
            console.log("Attempting to read from Firestore...");
            // Try to read a non-existent doc just to check connection
            const testDoc = await db.collection('test_connection').doc('ping').get();
            console.log("Firestore connection SUCCESS. Doc exists:", testDoc.exists);
        } catch (error) {
            console.error("Firestore connection FAILED:", error.message);
            console.error("Detailed Error:", error);
        }
    }

    testDb();

} catch (error) {
    console.error("Firebase Init FAILED:", error.message);
}
