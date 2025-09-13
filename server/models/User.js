// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','teacher','admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
