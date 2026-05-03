const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");

router.post("/", walletController.createWallet);
router.get("/user/:userId", walletController.getWalletsByUser);
router.get("/:id", walletController.getWalletById);
router.put("/:id", walletController.updateWallet);
router.delete("/:id", walletController.deleteWallet);
module.exports = router;
