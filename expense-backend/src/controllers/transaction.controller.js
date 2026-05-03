const transactionModel = require("../models/transaction.model");
const walletModel = require("../models/wallet.model");
const db = require("../config/db");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { wallet_id, type, amount } = req.body;

    // 1️⃣ Tạo transaction
    const transaction = await transactionModel.create(req.body, connection);

    // 2️⃣ Cập nhật balance
    if (type === "expense") {
      await connection.execute(
        `UPDATE wallets SET balance = balance - ? WHERE id = ?`,
        [amount, wallet_id],
      );
    } else {
      await connection.execute(
        `UPDATE wallets SET balance = balance + ? WHERE id = ?`,
        [amount, wallet_id],
      );
    }

    await connection.commit();

    const wallet = await walletModel.getById(wallet_id);

    res.status(201).json({
      message: "Transaction created",
      transaction,
      currentBalance: wallet.balance,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// GET BY ID
// =======================
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionModel.getById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// GET BY USER
// =======================
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.getByUser(req.params.userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// UPDATE TRANSACTION
// =======================
exports.updateTransaction = async (req, res) => {
  try {
    const updated = await transactionModel.update(req.params.id, req.body);

    res.json({
      message: "Transaction updated",
      transaction: updated,
      balance: (await walletModel.getById(updated.wallet_id)).balance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// DELETE TRANSACTION
// =======================
exports.deleteTransaction = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const transaction = await transactionModel.getById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 1️⃣ Rollback balance
    if (transaction.type === "expense") {
      await connection.execute(
        `UPDATE wallets SET balance = balance + ? WHERE id = ?`,
        [transaction.amount, transaction.wallet_id],
      );
    } else {
      await connection.execute(
        `UPDATE wallets SET balance = balance - ? WHERE id = ?`,
        [transaction.amount, transaction.wallet_id],
      );
    }

    // 2️⃣ Xoá transaction
    await transactionModel.remove(req.params.id, connection);

    await connection.commit();

    const wallet = await walletModel.getById(transaction.wallet_id);

    res.json({
      message: "Transaction deleted",
      currentBalance: wallet.balance,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};
exports.getRecentTransactions = async (req, res) => {
  try {

    const { userId } = req.params;

    const transactions = await transactionModel.getRecentTransactions(userId);

    res.json({
      message: "Recent transactions",
      data: transactions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
