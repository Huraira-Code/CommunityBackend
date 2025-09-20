const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    tenureId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenure", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },

    // Who created the task (always supervisor)
    createdBySupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Assigned hierarchy
    assignedByPresident: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional until president assigns
    assignedToTeamLead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // team lead
    assignedByTeamLead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // which team lead assigned to member
    assignedToMember: { type: mongoose.Schema.Types.ObjectId, ref: "User" },    // final member

    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
