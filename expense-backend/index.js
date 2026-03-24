const express = require("express");
const cors = require("cors");
require("dotenv").config();

const expenseRoutes = require("./src/routes/expense.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/expenses", expenseRoutes);

app.listen(8080, () => {
  console.log("Backend running at http://localhost:8080");
});
console.log(__dirname);
