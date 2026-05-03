const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const create = async (data) => {
  const id = uuidv4();

  await db.execute(
    "INSERT INTO categories (id, name, type) VALUES (?, ?, ?)",
    [id, data.name, data.type]
  );

  const [rows] = await db.execute(
    "SELECT * FROM categories WHERE id = ?",
    [id]
  );

  return rows[0];
};

const getAll = async () => {
  const [rows] = await db.execute("SELECT * FROM categories");
  return rows;
};

module.exports = {
  create,
  getAll
};
