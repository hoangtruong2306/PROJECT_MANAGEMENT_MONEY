const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const create = async (data) => {
    const id = uuidv4();
    await db.execute(
        "INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?, ?, ?)",
        [id, data.user_id, data.name, data.target_amount, data.current_amount || 0, data.deadline]
    );
    const [rows] = await db.execute("SELECT * FROM goals WHERE id = ?", [id]);
    return rows[0];
};

const getByUser = async (userId) => {
    const [rows] = await db.execute("SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC", [userId]);
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute("SELECT * FROM goals WHERE id = ?", [id]);
    return rows[0];
};

const update = async (id, data) => {
    await db.execute(
        "UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ? WHERE id = ?",
        [data.name, data.target_amount, data.current_amount, data.deadline, id]
    );
    return getById(id);
};

const remove = async (id) => {
    await db.execute("DELETE FROM goals WHERE id = ?", [id]);
};

// Add money to current_amount (deposit toward goal)
const deposit = async (id, amount) => {
    await db.execute(
        "UPDATE goals SET current_amount = current_amount + ? WHERE id = ?",
        [amount, id]
    );
    return getById(id);
};

module.exports = {
    create,
    getByUser,
    getById,
    update,
    remove,
    deposit,
};
