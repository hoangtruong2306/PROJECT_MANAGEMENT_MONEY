const goalModel = require("../models/goal.model");

// CREATE
exports.createGoal = async (req, res) => {
    try {
        const goal = await goalModel.create(req.body);
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL BY USER
exports.getGoalsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const goals = await goalModel.getByUser(userId);
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET BY ID
exports.getGoalById = async (req, res) => {
    try {
        const goal = await goalModel.getById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
exports.updateGoal = async (req, res) => {
    try {
        const goal = await goalModel.update(req.params.id, req.body);
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
exports.deleteGoal = async (req, res) => {
    try {
        await goalModel.remove(req.params.id);
        res.json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DEPOSIT (add money to current_amount)
exports.depositGoal = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: "Số tiền nạp phải lớn hơn 0" });
        }
        const goal = await goalModel.deposit(req.params.id, Number(amount));
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
