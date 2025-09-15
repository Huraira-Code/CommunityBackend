const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    tenureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenure",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },

    // Separate assignment
    assignedToTeamLead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedToMember: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Separate marks
    teamLeadMarks: { type: Number, default: 0 },
    memberMarks: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["TeamLead", "TeamMember", "Completed"],
      default: "TeamLead",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
