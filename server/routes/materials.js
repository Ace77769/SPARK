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

// File filter (PDF only)
function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ----------------- ROUTES -----------------

// Upload material (teacher)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });

    const material = new Material({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploader: req.body.uploader || "teacher",
      stdClass: req.body.class, // map body.class -> stdClass
      subject: req.body.subject,
      category: req.body.category || "Textbooks", // ✅ NEW: category support
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await material.save();
    res.json({ ok: true, message: "Uploaded", material });
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
    if (req.query.category) query.category = req.query.category; // ✅ NEW

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

    // Delete file from uploads folder (if exists)
    const filePath = path.join(__dirname, "../uploads", material.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fsErr) {
        console.error("Failed to delete file from disk:", fsErr);
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
