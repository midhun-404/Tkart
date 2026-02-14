const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./trendkart.sqlite');

const fixAdmin = async () => {
    const email = 'admin@trendkart.com';
    const password = 'password123';

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            console.error("DB Error:", err);
            return;
        }

        if (!user) {
            console.log("Admin not found. Creating...");
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Admin User', email, hash, 'admin'], (err) => {
                    if (err) console.error("Insert Failed:", err);
                    else console.log("Admin Created.");
                });
        } else {
            console.log("Admin found. Testing password...");
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                console.log("SUCCESS: Password 'password123' IS VALID for this hash.");
            } else {
                console.log("FAILURE: Password mismatch. Resetting...");
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);

                db.run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, user.id], async (updateErr) => {
                    if (updateErr) console.error("Update Failed:", updateErr);
                    else {
                        console.log("Password updated. Verifying...");
                        const valid = await bcrypt.compare(password, hash);
                        console.log("Verification of new hash:", valid);
                    }
                });
            }
        }
    });
};

fixAdmin();
