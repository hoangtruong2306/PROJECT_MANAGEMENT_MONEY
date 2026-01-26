const db = require("../db/db");

exports.addExpense = async (req, res) => {
  const { amount, category } = req.body;

  const sql = "INSERT INTO expenses (amount, category) VALUES (?, ?)";
  await db.execute(sql, [amount, category]);

  res.json({ message: "Expense added" });
};

exports.getPrediction = (req, res) => {
  // Tạm mock AI
  res.json({ amount: 3500000 });
};
