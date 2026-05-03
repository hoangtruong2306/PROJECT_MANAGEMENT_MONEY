const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Require login to use chat (to have userId context)
router.post("/chat", authMiddleware, aiController.chat);

module.exports = router;
