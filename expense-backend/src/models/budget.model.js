const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const getByUser = async (userId) => {
    const [rows] = await db.execute(
        `SELECT b.*, c.name as category_name
     FROM budgets b
     LEFT JOIN categories c ON b.category_id = c.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
        [userId]
    );
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute("SELECT * FROM budgets WHERE id = ?", [id]);
    return rows[0];
};

const create = async (data) => {
    const id = uuidv4();
    await db.execute(
        "INSERT INTO budgets (id, user_id, category_id, limit_amount, month) VALUES (?, ?, ?, ?, ?)",
        [id, data.user_id, data.category_id, data.amount ?? data.limit_amount, data.month || data.period || new Date().toISOString().slice(0, 7)]
    );
    const [rows] = await db.execute(
        `SELECT b.*, c.name as category_name FROM budgets b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
        [id]
    );
    return rows[0];
};

const update = async (id, data) => {
    await db.execute(
        "UPDATE budgets SET limit_amount = ?, month = ? WHERE id = ?",
        [data.amount ?? data.limit_amount, data.month || data.period || new Date().toISOString().slice(0, 7), id]
    );
    return getById(id);
};

const remove = async (id) => {
    await db.execute("DELETE FROM budgets WHERE id = ?", [id]);
};

module.exports = { getByUser, getById, create, update, remove };
