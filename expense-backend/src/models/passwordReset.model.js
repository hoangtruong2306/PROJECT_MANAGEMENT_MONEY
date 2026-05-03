const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Ensure table exists (id, user_id, token, expires_at, created_at)
const ensureTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(191) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const create = async ({ userId, token, expiresAt }) => {
  await ensureTable();
  const id = uuidv4();
  await db.execute(
    `INSERT INTO password_resets (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [id, userId, token, expiresAt]
  );
  const [rows] = await db.execute("SELECT * FROM password_resets WHERE id = ?", [id]);
  return rows[0];
};

const findByToken = async (token) => {
  await ensureTable();
  const [rows] = await db.execute("SELECT * FROM password_resets WHERE token = ?", [token]);
  return rows[0];
};

const deleteById = async (id) => {
  await db.execute("DELETE FROM password_resets WHERE id = ?", [id]);
};

const deleteByUser = async (userId) => {
  await db.execute("DELETE FROM password_resets WHERE user_id = ?", [userId]);
};

const cleanupExpired = async () => {
  await db.execute("DELETE FROM password_resets WHERE expires_at < NOW()");
};

module.exports = {
  create,
  findByToken,
  deleteById,
  deleteByUser,
  cleanupExpired,
};
