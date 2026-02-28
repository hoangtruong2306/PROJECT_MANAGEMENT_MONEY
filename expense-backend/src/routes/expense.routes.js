const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");

router.post("/", expenseController.createExpense);
router.get("/user/:userId", expenseController.getUserExpenses);
router.get("/:id", expenseController.getById);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);


module.exports = router;
