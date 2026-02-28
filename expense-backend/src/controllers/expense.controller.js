const Transaction = require("../models/transaction.model");
// Tạo một giao dịch mới
exports.createExpense = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      message: "Transaction created",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
// Lấy tất cả giao dịch của một người dùng
exports.getUserExpenses = async (req, res) => {
  try {
    const data = await Transaction.getByUser(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Lấy chi tiết một giao dịch
exports.getById = async (req, res) => {
  try {
    const transaction = await Transaction.getById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Cập nhật một giao dịch
exports.updateExpense = async (req, res) => {
  try {
    const transaction = await Transaction.update(req.params.id, req.body);
    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
      message: "Transaction updated",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  console.log("BODY:", req.body);
};
// Xóa một giao dịch
exports.deleteExpense = async (req, res) => {
  try {
    await Transaction.remove(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
