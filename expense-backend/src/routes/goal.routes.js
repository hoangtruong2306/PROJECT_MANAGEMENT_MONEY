const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goal.controller");

router.post("/", goalController.createGoal);
router.get("/user/:userId", goalController.getGoalsByUser);
router.get("/:id", goalController.getGoalById);
router.put("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);
router.patch("/:id/deposit", goalController.depositGoal);

module.exports = router;
