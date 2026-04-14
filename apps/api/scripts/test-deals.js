const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../src/config/serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixDeals() {
    try {
        const snapshot = await db.collection('deals').get();
        if (snapshot.empty) {
            console.log("No deals found.");
            return;
        }

        console.log(`Found ${snapshot.size} deals.`);
        const batch = db.batch();

        snapshot.docs.forEach(doc => {
            console.log(`Deleting deal ID: ${doc.id}`);
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("All deals deleted successfully.");
    } catch (error) {
        console.error("Error fixing deals:", error);
    }
}

fixDeals();

