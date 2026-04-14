const { auth } = require('../src/config/firebaseAdmin');

async function resetPassword(email, newPassword) {
    try {
        console.log(`Looking up user with email: ${email}...`);
        const userRecord = await auth.getUserByEmail(email);

        console.log(`Found user! UID: ${userRecord.uid}`);
        console.log(`Updating password to: ${newPassword}...`);

        await auth.updateUser(userRecord.uid, {
            password: newPassword
        });

        console.log(`✅ Successfully updated password for ${email}!`);
        console.log(`You can now log in at http://localhost:5173/admin/login`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.error(`❌ No user found with email: ${email}`);
            console.error(`Please sign up first on the frontend before trying to reset the password.`);
        } else {
            console.error("❌ Error updating password:", error);
        }
    }
}

resetPassword('midhunjr2222@gmail.com', 'admin1234');

