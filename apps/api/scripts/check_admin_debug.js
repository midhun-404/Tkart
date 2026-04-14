const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../data/trendkart.sqlite');

db.serialize(() => {
    db.all("SELECT id, name, email, role, password_hash FROM users", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Users in DB:", rows);
        }
        db.close();
    });
});

