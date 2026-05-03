const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/transaction.controller");

router.post("/", expenseController.createTransaction);
router.get("/user/:userId", expenseController.getUserTransactions);
router.get("/:id", expenseController.getTransactionById);
router.put("/:id", expenseController.updateTransaction);
router.delete("/:id", expenseController.deleteTransaction);
router.get("/recent/:userId", expenseController.getRecentTransactions);

module.exports = router;
