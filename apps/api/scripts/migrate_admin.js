const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../data/trendkart.sqlite');

const runQuery = (query) => {
    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) {
                // Ignore "duplicate column name" errors
                if (err.message.includes('duplicate column name')) {
                    resolve();
                } else {
                    console.warn(`Query failed: ${query} - ${err.message}`);
                    resolve(); // Resolve anyway to continue
                }
            } else {
                resolve();
            }
        });
    });
};

const migrate = async () => {
    console.log("Starting Migration...");

    // 1. Create New Tables
    const createCategories = `
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        image_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;

    const createBrands = `
    CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        logo_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;

    const createSettings = `
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;

    await runQuery(createCategories);
    await runQuery(createBrands);
    await runQuery(createSettings);

    // 2. Add Columns to Existing Tables
    await runQuery("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT 0");
    await runQuery("ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT 1");
    // Add these just in case they are missing from previous steps or manual edits
    await runQuery("ALTER TABLE products ADD COLUMN discount_percentage REAL DEFAULT 0");
    await runQuery("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0");
    await runQuery("ALTER TABLE products ADD COLUMN is_deal BOOLEAN DEFAULT 0");

    console.log("Migration Completed.");
    db.close();
};

migrate();

