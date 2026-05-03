const db = require("../config/db");

async function migrate() {
    try {
        console.log("Creating admins table...");
        await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Migration successful.");
    } catch (error) {
        process.exit(0);
    } finally {
        process.exit(0);
    }
}

migrate();
