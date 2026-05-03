const walletModel = require("../models/wallet.model");

// CREATE
exports.createWallet = async (req, res) => {
  try {
    const wallet = await walletModel.create(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET
exports.getWalletById = async (req, res) => {
  try {
    const wallet = await walletModel.getById(req.params.id);

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL BY USER
exports.getWalletsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const wallets = await walletModel.getByUser(userId);
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateWallet = async (req, res) => {
  try {
    const wallet = await walletModel.update(req.params.id, req.body);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
exports.deleteWallet = async (req, res) => {
  try {
    await walletModel.remove(req.params.id);
    res.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

