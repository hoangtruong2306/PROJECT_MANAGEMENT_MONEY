const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");

router.get("/user/:userId", statsController.getUserStats);
router.get("/monthly/:userId", statsController.getMonthlyStats);
router.get("/category/:userId", statsController.getCategoryStats);
router.get("/trend/:userId", statsController.getTrendStats);
router.get("/daily/:userId", statsController.getDailyStats);
router.get("/recent/:userId", statsController.getRecentTransactions);
module.exports = router;
