const { db } = require('../src/config/firebaseAdmin');

async function verifyUser() {
    try {
        const userId = 'SabeY84nIGFlVTw3Vl9o'; // From previous log
        console.log(`Fetching user: ${userId}`);
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            console.log("User Found:", doc.data());
        } else {
            console.log("User NOT Found with this ID.");
            // List all users to see what IDs look like
            const snapshot = await db.collection('users').limit(5).get();
            console.log("Sample Users:");
            snapshot.docs.forEach(d => console.log(d.id, d.data().email));
        }
    } catch (error) {
        console.error("Error verifying user:", error);
    }
}

verifyUser();

