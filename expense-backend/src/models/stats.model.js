const db = require("../config/db");

const getUserStats = async (user_id) => {

  const [income] = await db.execute(
    "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type='income'",
    [user_id]
  );

  const [expense] = await db.execute(
    "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type='expense'",
    [user_id]
  );

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = currentYear - 1;
  }

  const [expThisMonth] = await db.execute(
    "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type='expense' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?",
    [user_id, currentMonth, currentYear]
  );

  const [expLastMonth] = await db.execute(
    "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type='expense' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?",
    [user_id, prevMonth, prevYear]
  );

  const [topCat] = await db.execute(
    "SELECT c.name, SUM(t.amount) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? AND t.type='expense' AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ? GROUP BY c.id ORDER BY total DESC LIMIT 1",
    [user_id, currentMonth, currentYear]
  );

  return {
    total_income: income[0].total || 0,
    total_expense: expense[0].total || 0,
    balance: (income[0].total || 0) - (expense[0].total || 0),
    expense_this_month: expThisMonth[0].total || 0,
    expense_last_month: expLastMonth[0].total || 0,
    top_category: topCat.length > 0 ? topCat[0].name : "Không có",
    top_category_amount: topCat.length > 0 ? topCat[0].total : 0
  };
};


module.exports = {
  getUserStats
};
