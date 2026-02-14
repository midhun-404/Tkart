const { admin, db } = require('./src/config/firebaseAdmin');

const setAdminRole = async (email) => {
    try {
        console.log(`Looking for user with email: ${email}`);

        // 1. Find user by email (Auth)
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`Found UID: ${uid}`);

        // 2. Update Firestore Document
        await db.collection('users').doc(uid).set({
            role: 'admin'
        }, { merge: true });

        console.log(`SUCCESS: Role for ${email} set to 'admin' in Firestore.`);
    } catch (error) {
        console.error("Error setting admin role:", error.message);
    }
};

const email = process.argv[2];
if (!email) {
    console.log("Usage: node set_admin.js <email>");
    process.exit(1);
}

setAdminRole(email);
