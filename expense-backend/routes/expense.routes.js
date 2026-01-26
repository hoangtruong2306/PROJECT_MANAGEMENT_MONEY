const express = require("express");
const router = express.Router();
const controller = require("../controllers/expense.controller");

router.post("/expenses", controller.addExpense);
router.get("/ai/predict", controller.getPrediction);

module.exports = router;
