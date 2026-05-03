const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

// Require auth and admin for all routes in this file
router.use(authMiddleware, adminMiddleware);

router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/password", adminController.resetUserPassword);
router.get("/stats", adminController.getSystemStats);

module.exports = router;
