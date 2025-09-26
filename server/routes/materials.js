// server/routes/materials.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Material = require("../models/Material");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (PDF and Video files)
function fileFilter(req, file, cb) {
  const allowedTypes = [
    "application/pdf",
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm",
    "video/mkv"
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and video files allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for videos
});

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ----------------- ROUTES -----------------

// Upload material (teacher) - Updated to handle videos
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, class: stdClass, subject, category, videoType, videoUrl, description } = req.body;

    // Validate required fields
    if (!title || !stdClass || !subject || !category) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const materialData = {
      title,
      uploader: req.body.uploader || "teacher",
      stdClass,
      subject,
      category,
      description
    };

    // Handle different content types
    if (category === "Videos") {
      if (!videoType) {
        return res.status(400).json({ ok: false, message: "Video type is required for videos" });
      }

      materialData.videoType = videoType;

      if (videoType === "upload") {
        // Handle uploaded video file
        if (!req.file) {
          return res.status(400).json({ ok: false, message: "No video file uploaded" });
        }
        materialData.filename = req.file.filename;
        materialData.originalName = req.file.originalname;
        materialData.mimetype = req.file.mimetype;
        materialData.size = req.file.size;
      } else if (videoType === "youtube") {
        // Handle YouTube URL
        if (!videoUrl) {
          return res.status(400).json({ ok: false, message: "YouTube URL is required" });
        }
        const videoId = extractYouTubeVideoId(videoUrl);
        if (!videoId) {
          return res.status(400).json({ ok: false, message: "Invalid YouTube URL" });
        }
        materialData.videoUrl = videoUrl;
        materialData.youtubeVideoId = videoId;
      } else {
        // Handle other external video URLs
        if (!videoUrl) {
          return res.status(400).json({ ok: false, message: "Video URL is required" });
        }
        materialData.videoUrl = videoUrl;
      }
    } else {
      // Handle PDF uploads (existing functionality)
      if (!req.file) {
        return res.status(400).json({ ok: false, message: "No file uploaded" });
      }
      materialData.filename = req.file.filename;
      materialData.originalName = req.file.originalname;
      materialData.mimetype = req.file.mimetype;
      materialData.size = req.file.size;
    }

    const material = new Material(materialData);
    await material.save();
    
    res.json({ ok: true, message: "Content uploaded successfully", material });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ ok: false, message: "Upload failed", error: err.message });
  }
});

// Get materials (optionally filtered by stdClass, subject, category)
router.get("/", async (req, res) => {
  try {
    const query = {};
    if (req.query.stdClass) query.stdClass = req.query.stdClass;
    if (req.query.subject) query.subject = req.query.subject;
    if (req.query.category) query.category = req.query.category;

    const materials = await Material.find(query).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    console.error("Fetch materials error:", err);
    res.status(500).json({ message: "Error fetching materials" });
  }
});

// DELETE a material and remove its file
router.delete("/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ ok: false, message: "Material not found" });

    // Delete file from uploads folder (if exists and is uploaded file)
    if (material.filename && material.videoType === "upload") {
      const filePath = path.join(__dirname, "../uploads", material.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fsErr) {
          console.error("Failed to delete file from disk:", fsErr);
        }
      }
    }

    await Material.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: "Material deleted" });
  } catch (err) {
    console.error("Delete material error:", err);
    res.status(500).json({ ok: false, message: "Delete failed", error: err.message });
  }
});

module.exports = router;