const budgetModel = require("../models/budget.model");
const db = require("../config/db");

exports.getBudgets = async (req, res) => {
    try {
        const budgets = await budgetModel.getByUser(req.params.userId);
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createBudget = async (req, res) => {
    try {
        const budget = await budgetModel.create(req.body);
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const budget = await budgetModel.update(req.params.id, req.body);
        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        await budgetModel.remove(req.params.id);
        res.json({ message: "Budget deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Trả về danh sách budgets kèm chi tiêu thực tế và % sử dụng.
 * Dùng để hiển thị cảnh báo ngân sách.
 *
 * Response: { data: [ { budget, spent, percent, status } ] }
 * status: "safe" | "warning" (>=80%) | "exceeded" (>=100%)
 */
exports.getBudgetAlerts = async (req, res) => {
    try {
        const { userId } = req.params;

        // Lấy tất cả budgets của user
        const budgets = await budgetModel.getByUser(userId);

        if (!budgets || budgets.length === 0) {
            return res.json({ data: [] });
        }

        // Tính tổng chi tiêu tháng này theo từng category
        const now = new Date();
        const firstDayOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const [rows] = await db.execute(
            `SELECT category_id, COALESCE(SUM(amount), 0) as total_spent
             FROM transactions
             WHERE user_id = ? AND type = 'expense' AND transaction_date >= ?
             GROUP BY category_id`,
            [userId, firstDayOfMonth]
        );

        // Map category_id → total_spent
        const spentMap = {};
        for (const row of rows) {
            spentMap[row.category_id] = parseFloat(row.total_spent);
        }

        // Build alerts
        const alerts = budgets.map(budget => {
            const spent = spentMap[budget.category_id] || 0;
            const limit = parseFloat(budget.limit_amount) || 0;
            const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            let status = "safe";
            if (percent >= 100) status = "exceeded";
            else if (percent >= 80) status = "warning";

            return {
                budget,
                spent,
                percent,
                status,
                remaining: Math.max(0, limit - spent)
            };
        });

        // Sắp xếp: exceeded > warning > safe
        alerts.sort((a, b) => {
            const order = { exceeded: 0, warning: 1, safe: 2 };
            return order[a.status] - order[b.status];
        });

        res.json({ data: alerts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

