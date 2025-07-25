const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const errorHandler = require("./middleware/error.middleware");
const initializeSocket = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todo")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error", err));

initializeSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
