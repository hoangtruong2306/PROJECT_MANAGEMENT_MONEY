const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const expenseRoutes = require("./routes/transaction.routes");
const statsRoutes = require("./routes/stats.routes");
const walletRoutes = require("./routes/wallet.routes");
const categoryRoutes = require("./routes/category.routes");
const adminRoutes = require("./routes/admin.routes");
const goalRoutes = require("./routes/goal.routes");
const budgetRoutes = require("./routes/budget.routes");
const aiRoutes = require("./routes/ai.routes");
const syncRoutes = require("./routes/sync.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/transactions", expenseRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sync", syncRoutes);

module.exports = app;
