const db = require("../config/db");
const statsModel = require("../models/stats.model");
const transactionModel = require("../models/transaction.model");
// =======================
// GET USER STATS
// =======================
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await statsModel.getUserStats(userId);

    res.json({
      message: "User stats fetched",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =======================
// GET RECENT TRANSACTIONS (for stats page)
// =======================
exports.getRecentTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await transactionModel.getRecentTransactions(userId);

    res.json({
      message: "Recent transactions fetched",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =======================
// GET MONTHLY STATS
// =======================
exports.getMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        DATE_FORMAT(transaction_date,'%Y-%m') as month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ?
      GROUP BY month
      ORDER BY month DESC
      `,
      [userId],
    );

    res.json({
      message: "Monthly stats fetched",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =======================
// GET CATEGORY STATS
// =======================
exports.getCategoryStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        t.category_id,
        c.name as category_name,
        SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.type='expense'
      GROUP BY t.category_id
      ORDER BY total DESC
      `,
      [userId],
    );

    res.json({
      message: "Category stats fetched",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// GET TREND STATS (For Line Chart)
// =======================
exports.getTrendStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        YEAR(transaction_date) as year,
        MONTH(transaction_date) as month,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND type='expense'
      GROUP BY year, month
      `,
      [userId]
    );

    const date = new Date();
    let currentMonth = date.getMonth() + 1;
    let currentYear = date.getFullYear();

    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }

      const currentData = rows.find(r => r.year === y && r.month === m);
      const previousData = rows.find(r => r.year === y - 1 && r.month === m);

      chartData.push({
        month: `Tháng ${m}`,
        current: currentData ? Number(currentData.total) : 0,
        previous: previousData ? Number(previousData.total) : 0,
        forecast: null
      });
    }

    res.json({
      message: "Trend stats fetched",
      data: chartData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// GET DAILY STATS (For Mobile Analytics 30 days)
// =======================
exports.getDailyStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        DATE(transaction_date) as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE user_id = ? AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(transaction_date)
      ORDER BY date ASC
      `,
      [userId]
    );

    res.json({
      message: "Daily stats fetched",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
