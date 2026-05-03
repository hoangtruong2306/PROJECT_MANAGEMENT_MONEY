require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Run: npx kill-port ${PORT}`);
  } else {
    console.error("Server error:", err.message);
  }
  process.exit(1);
});
