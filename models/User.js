const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored as plain text (not secure)
  role: { 
    type: String, 
    enum: ['admin', 'supervisor', 'president', 'teamLead', 'member'], 
    required: true 
  },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' }, // supervisor and below
  tenureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenure' }, // president and below
  teamLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // member only
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
