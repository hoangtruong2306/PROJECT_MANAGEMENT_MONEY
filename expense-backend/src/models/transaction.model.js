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
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Lấy transaction cũ
    const [oldRows] = await connection.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    if (oldRows.length === 0) {
      throw new Error("Transaction not found");
    }

    const oldTransaction = oldRows[0];

    // 2️⃣ Hoàn tác transaction cũ
    if (oldTransaction.type === "income") {
      await connection.execute(
        "UPDATE wallets SET balance = balance - ? WHERE id = ?",
        [oldTransaction.amount, oldTransaction.wallet_id]
      );
    } else {
      await connection.execute(
        "UPDATE wallets SET balance = balance + ? WHERE id = ?",
        [oldTransaction.amount, oldTransaction.wallet_id]
      );
    }

    // 3️⃣ Update transaction
    await connection.execute(
      `UPDATE transactions 
       SET wallet_id = ?, 
           category_id = ?, 
           type = ?, 
           amount = ?, 
           note = ?, 
           transaction_date = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        data.wallet_id,
        data.category_id,
        data.type,
        data.amount,
        data.note,
        data.transaction_date,
        id
      ]
    );

    // 4️⃣ Áp dụng transaction mới
    if (data.type === "income") {
      await connection.execute(
        "UPDATE wallets SET balance = balance + ? WHERE id = ?",
        [data.amount, data.wallet_id]
      );
    } else {
      await connection.execute(
        "UPDATE wallets SET balance = balance - ? WHERE id = ?",
        [data.amount, data.wallet_id]
      );
    }

    await connection.commit();

    // 5️⃣ Trả transaction mới
    const [rows] = await connection.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    return rows[0];

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Xóa một giao dịch
const remove = async (id) => {
  await db.execute("DELETE FROM transactions WHERE id = ?", [id]);
};
const getRecentTransactions = async (user_id) => {

  const [rows] = await db.execute(
    `
    SELECT *
    FROM transactions
    WHERE user_id = ?
    ORDER BY transaction_date DESC
    LIMIT 5
    `,
    [user_id]
  );

  return rows;
};

module.exports = {
  create,
  getById,
  update,
  remove,
  getByUser,
  getRecentTransactions
};
