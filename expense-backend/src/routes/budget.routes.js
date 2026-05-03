const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller");

router.get("/user/:userId", budgetController.getBudgets);
router.get("/alerts/:userId", budgetController.getBudgetAlerts);
router.post("/", budgetController.createBudget);
router.put("/:id", budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
