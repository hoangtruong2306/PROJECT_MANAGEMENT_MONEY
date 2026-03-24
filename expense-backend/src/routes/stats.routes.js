const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");

router.get("/monthly/:userId", statsController.getMonthlyExpense);

module.exports = router;
