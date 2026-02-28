const db = require("../config/db");

exports.getMonthlyExpense = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.execute(`
      SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month,
             SUM(amount) as total_expense
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
      GROUP BY month
      ORDER BY month
    `, [userId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
