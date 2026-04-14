const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('../data/trendkart.sqlite');

const createAdmin = async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const sql = `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`;

    db.run(sql, ['Admin User', 'admin@trendkart.com', passwordHash, 'admin'], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                console.log('Admin user already exists.');
            } else {
                console.error(err.message);
            }
        } else {
            console.log(`Admin user created with ID: ${this.lastID}`);
        }
        db.close();
    });
};

createAdmin();

