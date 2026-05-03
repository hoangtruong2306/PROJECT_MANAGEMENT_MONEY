const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// CREATE
const create = async (data) => {
  const id = uuidv4();

  await db.execute(
    `INSERT INTO wallets (id, user_id, name, balance)
     VALUES (?, ?, ?, ?)`,
    [id, data.user_id, data.name, data.balance || 0]
  );

  return { id, ...data };
};

// GET BY ID
const getById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM wallets WHERE id = ?",
    [id]
  );
  return rows[0];
};

// Lấy tất cả ví của 1 user kèm tổng thu chi
const getByUser = async (user_id) => {
  const query = `
    SELECT 
      w.*,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense
    FROM wallets w
    LEFT JOIN transactions t ON w.id = t.wallet_id
    WHERE w.user_id = ?
    GROUP BY w.id
  `;
  const [rows] = await db.execute(query, [user_id]);
  return rows;
};

// UPDATE
const update = async (id, data) => {
  await db.execute(
    `UPDATE wallets
     SET name = ?
     WHERE id = ?`,
    [data.name, id]
  );

  return await getById(id);
};

// DELETE
const remove = async (id) => {
  await db.execute(
    "DELETE FROM wallets WHERE id = ?",
    [id]
  );
};

module.exports = {
  create,
  getById,
  getByUser,
  update,
  remove
};

