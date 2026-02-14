const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./trendkart.sqlite');

db.all("SELECT id, name, email, role, password_hash FROM users WHERE email='admin@trendkart.com'", (err, rows) => {
    if (err) console.error(err);
    else {
        console.log("Found Users:", rows.length);
        rows.forEach(r => {
            console.log(`ID: ${r.id}`);
            console.log(`Email: '${r.email}'`); // Quotes to reveal spaces
            console.log(`Role: '${r.role}'`);
            console.log(`Hash Info: Length=${r.password_hash.length}, Start=${r.password_hash.substring(0, 5)}`);
        });
    }
    db.close();
});
