// server/models/Material.js
const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true }, // saved filename on disk
  originalName: { type: String }, // original uploaded name
  uploader: { type: String }, // username or teacher ID
  stdClass: { type: String, required: true }, // ✅ safe name instead of "class"
  subject: { type: String, required: true }, 
  category: {  // ✅ NEW field
    type: String,
    enum: ["Textbooks", "Question Papers", "Other"],
    default: "Textbooks"
  },
  mimetype: { type: String },
  size: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
