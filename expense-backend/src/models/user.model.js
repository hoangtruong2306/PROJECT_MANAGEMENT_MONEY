const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createUser = async ({ name, email, password, avatar_url = null, currency = null }) => {
  const id = uuidv4();

  await db.execute(
    `INSERT INTO users (id, email, password_hash, full_name, avatar_url, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [id, email, password, name, avatar_url, currency]
  );

  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  updatePassword: async (id, passwordHash) => {
    await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },
  savePasswordResetToken: async (id, token, expires) => {
    await db.execute(
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
      [token, expires, id]
    );
  },
  findByPasswordResetToken: async (token) => {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()",
      [token]
    );
    return rows[0];
  },
};
