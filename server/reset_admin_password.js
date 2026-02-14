const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./trendkart.sqlite');

const resetPassword = async () => {
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    db.run("UPDATE users SET password_hash = ? WHERE email = 'admin@trendkart.com'", [hash], function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log(`Password reset for admin@trendkart.com. Rows affected: ${this.changes}`);
        }
        db.close();
    });
};

resetPassword();
