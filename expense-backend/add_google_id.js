const db = require("./src/config/db");

async function addGoogleId() {
    try {
        const [cols] = await db.execute("SHOW COLUMNS FROM users LIKE 'google_id'");
        if (cols.length === 0) {
            await db.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE DEFAULT NULL");
            console.log("Added google_id column to users table.");
        } else {
            console.log("google_id column already exists.");
        }
    } catch (err) {
        console.error("Error altering table:", err);
    } finally {
        process.exit();
    }
}

addGoogleId();
