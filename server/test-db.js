const { db } = require('./src/config/firebaseAdmin');

async function testDB() {
    try {
        console.log("Attempting to write to Firestore...");
        await db.collection('test').doc('ping').set({ message: 'pong', timestamp: new Date() });
        console.log("Write successful!");

        console.log("Attempting to read from Firestore...");
        const doc = await db.collection('test').doc('ping').get();
        console.log("Read successful:", doc.data());
    } catch (error) {
        console.error("Firestore Test Failed:", error);
    }
}

testDB();
