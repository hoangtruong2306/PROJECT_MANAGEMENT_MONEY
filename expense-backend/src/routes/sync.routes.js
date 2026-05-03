const express = require("express");
const router = express.Router();

const syncController = require("../controllers/sync.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Health check — không cần auth (mobile ping để kiểm tra server online)
router.get("/health", syncController.health);

// Batch sync — cần auth
router.post("/batch", authMiddleware, syncController.batchSync);

// Sync status
router.get("/status/:userId", authMiddleware, syncController.getSyncStatus);

module.exports = router;
