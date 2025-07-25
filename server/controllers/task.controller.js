const Task = require("../models/task.model");

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).populate("assignedTo", "username email");
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      createdBy: req.user._id,
      assignedTo
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Failed to create task." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found or unauthorized." });

    res.status(200).json(task);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Failed to update task." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found or unauthorized." });

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Failed to delete task." });
  }
};
