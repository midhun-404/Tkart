const { db } = require('../src/config/firebaseAdmin');

async function makeAdmin(email) {
    if (!email) {
        console.error("Please provide an email. Usage: node make_admin.js <email>");
        process.exit(1);
    }

    try {
        const usersSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (usersSnapshot.empty) {
            console.log(`User with email ${email} not found in Firestore.`);
            console.log("Please sign up first through the frontend, then run this script again.");
            process.exit(0);
        }

        const userDoc = usersSnapshot.docs[0];

        await db.collection('users').doc(userDoc.id).update({
            role: 'admin'
        });

        console.log(`✅ Successfully made ${email} an admin!`);
        console.log("You can now login at http://localhost:5173/admin/login with this email.");
    } catch (error) {
        console.error("Error updating user role:", error);
    }
}

const args = process.argv.slice(2);
makeAdmin(args[0]);

