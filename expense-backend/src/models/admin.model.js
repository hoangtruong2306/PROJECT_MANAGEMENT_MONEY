const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createAdmin = async ({ name, email, password, avatar_url = null }) => {
    const id = uuidv4();

    await db.execute(
        `INSERT INTO admins (id, email, password_hash, full_name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
        [id, email, password, name, avatar_url]
    );

    const [rows] = await db.execute("SELECT * FROM admins WHERE id = ?", [id]);
    return rows[0];
};

const findByEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await db.execute("SELECT * FROM admins WHERE id = ?", [id]);
    return rows[0];
};

module.exports = {
    createAdmin,
    findByEmail,
    findById,
};
