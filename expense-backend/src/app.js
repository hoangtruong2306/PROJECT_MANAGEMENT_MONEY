const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const expenseRoutes = require("./routes/expense.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/stats", statsRoutes);

module.exports = app;
console.log("AuthRoutes:", authRoutes);
