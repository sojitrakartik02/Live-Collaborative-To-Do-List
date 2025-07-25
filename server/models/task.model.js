const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"   
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,versionKey:false
});

taskSchema.index({ createdBy: 1, status: 1 });


module.exports = mongoose.model("Task", taskSchema);
