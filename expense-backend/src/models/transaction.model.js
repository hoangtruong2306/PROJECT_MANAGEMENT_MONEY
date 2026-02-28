const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
//Tạo một giao dịch mới
const create = async (data) => {
  const id = uuidv4();

  await db.execute(
    `INSERT INTO transactions 
     (id, user_id, wallet_id, category_id, type, amount, note, transaction_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.user_id,
      data.wallet_id,
      data.category_id,
      data.type,
      data.amount,
      data.note,
      data.transaction_date,
    ],
  );

  const [rows] = await db.execute("SELECT * FROM transactions WHERE id = ?", [
    id,
  ]);

  return rows[0];
};
// Lấy tất cả giao dịch của một người dùng
const getByUser = async (user_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC",
    [user_id],
  );

  return rows;
};
//Lấy chi tiết một giao dịch
const getById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM transactions WHERE id = ?", [
    id,
  ]);
  return rows[0];
};

// Cập nhật một giao dịch --> cach này cho phép cập nhật một số trường mà không cần phải gửi tất cả dữ liệu lên
const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.wallet_id !== undefined) {
    fields.push("wallet_id = ?");
    values.push(data.wallet_id);
  }

  if (data.category_id !== undefined) {
    fields.push("category_id = ?");
    values.push(data.category_id);
  }

  if (data.type !== undefined) {
    fields.push("type = ?");
    values.push(data.type);
  }

  if (data.amount !== undefined) {
    fields.push("amount = ?");
    values.push(data.amount);
  }

  if (data.note !== undefined) {
    fields.push("note = ?");
    values.push(data.note);
  }

  if (data.transaction_date !== undefined) {
    fields.push("transaction_date = ?");
    values.push(data.transaction_date);
  }
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const sql = `
    UPDATE transactions 
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = ?
  `;

  await db.execute(sql, values);

  const [rows] = await db.execute("SELECT * FROM transactions WHERE id = ?", [
    id,
  ]);

  return rows[0];
};

// Xóa một giao dịch
const remove = async (id) => {
  await db.execute("DELETE FROM transactions WHERE id = ?", [id]);
};

module.exports = {
  create,
  getByUser,
  getById,
  update,
  remove,
};
