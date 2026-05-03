const db = require("./src/config/db");

async function checkUser() {
    try {
        const [admins] = await db.execute("SELECT * FROM admins WHERE email = 'hoang@gmaill.com'");
        const [users] = await db.execute("SELECT * FROM users WHERE email = 'hoang@gmaill.com'");

        console.log("Found in Admins table:", admins.length ? admins : "None");
        console.log("Found in Users table:", users.length ? users : "None");

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit();
    }
}

checkUser();
