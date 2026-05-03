const db = require("../config/db");

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute("SELECT id, email, full_name, avatar_url, currency, created_at FROM users ORDER BY created_at DESC");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.userId) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Xóa dữ liệu liên kết trước để tránh lỗi khóa ngoại
            await connection.execute("DELETE FROM ml_predictions WHERE user_id = ?", [id]);
            await connection.execute("DELETE FROM transactions WHERE user_id = ?", [id]);
            await connection.execute("DELETE FROM budgets WHERE user_id = ?", [id]);
            await connection.execute("DELETE FROM goals WHERE user_id = ?", [id]);
            await connection.execute("DELETE FROM categories WHERE user_id = ?", [id]);
            await connection.execute("DELETE FROM wallets WHERE user_id = ?", [id]);

            const [result] = await connection.execute("DELETE FROM users WHERE id = ?", [id]);

            await connection.commit();

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "User deleted successfully" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }

        const bcrypt = require("bcryptjs");
        const hashed = await bcrypt.hash(password, 10);

        const [result] = await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.execute("SELECT COUNT(*) as totalUsers FROM users");
        const [[{ totalTransactions }]] = await db.execute("SELECT COUNT(*) as totalTransactions FROM transactions");
        const [[{ totalWallets }]] = await db.execute("SELECT COUNT(*) as totalWallets FROM wallets");

        // Optional: sum of all transactions amount... this might require currency conversion but we can just sum
        const [[{ totalVolume }]] = await db.execute("SELECT SUM(amount) as totalVolume FROM transactions");

        res.json({
            totalUsers: parseInt(totalUsers || 0),
            totalTransactions: parseInt(totalTransactions || 0),
            totalWallets: parseInt(totalWallets || 0),
            totalVolume: totalVolume || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
