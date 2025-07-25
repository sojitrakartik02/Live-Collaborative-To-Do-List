const express = require("express");
const router = express.Router();
const {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask
} = require("../controllers/task.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/", getAllTasks);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

module.exports = router;
