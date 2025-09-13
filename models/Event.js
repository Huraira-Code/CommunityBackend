const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  tenureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenure', required: true },
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: who created the event
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
