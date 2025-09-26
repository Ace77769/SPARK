// server/models/Material.js
const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String }, // for uploaded files (PDFs, videos)
  originalName: { type: String }, // original uploaded name
  uploader: { type: String }, // username or teacher ID
  stdClass: { type: String, required: true },
  subject: { type: String, required: true }, 
  category: {
    type: String,
    enum: ["Textbooks", "Question Papers", "Videos", "Other"], // ✅ Added Videos
    default: "Textbooks"
  },
  // ✅ NEW: Video-specific fields
  videoType: {
    type: String,
    enum: ["upload", "youtube", "other"],
    required: function() { return this.category === "Videos"; }
  },
  videoUrl: {
    type: String, // YouTube URL or other external video URL
    required: function() { return this.category === "Videos" && this.videoType !== "upload"; }
  },
  youtubeVideoId: { type: String }, // Extracted YouTube video ID for embedding
  description: { type: String }, // Video description
  duration: { type: String }, // Video duration (optional)
  thumbnail: { type: String }, // Thumbnail image path (optional)
  
  mimetype: { type: String },
  size: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);