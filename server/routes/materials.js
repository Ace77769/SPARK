// server/routes/materials.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Material = require("../models/Material");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and resource type based on file type
    const isPDF = file.mimetype === "application/pdf";
    const isVideo = file.mimetype.startsWith("video/");

    // Get file extension
    const fileExt = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, fileExt);

    const params = {
      folder: isPDF ? "spark/pdfs" : "spark/videos",
      resource_type: isVideo ? "video" : "raw", // Use 'raw' for PDFs
      public_id: `${Date.now()}-${nameWithoutExt}`, // filename without extension
    };

    // Add format for PDFs to ensure .pdf extension
    if (isPDF) {
      params.format = "pdf";
    }

    return params;
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

// Helper function to convert Cloudinary URL to inline (viewable) URL for PDFs
// Instead of modifying Cloudinary URL, we'll use our own proxy route
function getViewableUrl(cloudinaryUrl, materialId) {
  if (!cloudinaryUrl) return cloudinaryUrl;

  // For PDFs, return our proxy URL that serves inline
  if (cloudinaryUrl.includes('.pdf') && materialId) {
    return `/api/materials/view/${materialId}`;
  }

  return cloudinaryUrl;
}

// Helper function to generate signed Cloudinary URL for authenticated access
function getSignedUrl(cloudinaryId, resourceType = 'raw', format = null) {
  if (!cloudinaryId) return null;

  try {
    // cloudinaryId from multer-storage-cloudinary includes the folder path
    // e.g., "spark/pdfs/1760534983243-filename"
    // We need to ensure it has the file extension for raw resources

    let publicId = cloudinaryId;

    // Check if already has extension
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(cloudinaryId);

    if (!hasExtension && format) {
      publicId = `${cloudinaryId}.${format}`;
    }

    const urlOptions = {
      resource_type: resourceType,
      sign_url: true,
      secure: true,
      type: 'upload'
    };

    // Generate signed URL
    const signedUrl = cloudinary.url(publicId, urlOptions);

    return signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
}

// Helper function to get download URL with authentication
function getDownloadUrl(cloudinaryId, originalName, resourceType = 'raw') {
  // Extract format from originalName (e.g., "document.pdf" -> "pdf")
  const format = originalName ? path.extname(originalName).substring(1) : 'pdf';

  // Generate signed URL for authenticated access with format
  return getSignedUrl(cloudinaryId, resourceType, format);
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
        materialData.fileUrl = req.file.path; // Cloudinary URL
        materialData.cloudinaryId = req.file.filename; // Cloudinary public_id
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
      materialData.fileUrl = req.file.path; // Cloudinary URL
      materialData.cloudinaryId = req.file.filename; // Cloudinary public_id (includes folder path)
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

// Proxy route to serve PDF inline for viewing
router.get("/view/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).send("Material not found");
    }

    if (!material.cloudinaryId) {
      return res.status(404).send("File not found");
    }

    // Determine resource type
    const isVideo = material.category === "Videos" && material.videoType === "upload";
    const resourceType = isVideo ? "video" : "raw";

    // Extract format from originalName
    const format = material.originalName ? path.extname(material.originalName).substring(1) : 'pdf';

    // Generate signed URL for authenticated access
    const signedUrl = getSignedUrl(material.cloudinaryId, resourceType, format);

    if (!signedUrl) {
      return res.status(500).send("Error generating file URL");
    }

    // Use axios to fetch the PDF from Cloudinary
    const axios = require('axios');

    const response = await axios({
      method: 'get',
      url: signedUrl,
      responseType: 'stream',
      timeout: 30000 // 30 second timeout
    });

    // Set headers to display PDF inline in browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${material.originalName || 'document.pdf'}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Pipe the Cloudinary response to client
    response.data.pipe(res);

    response.data.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).send("Error streaming file");
      }
    });

  } catch (err) {
    console.error("Error viewing material:", err.message);
    if (!res.headersSent) {
      res.status(500).send("Error viewing material");
    }
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

    // Add viewable and download URLs for PDFs
    const materialsWithUrls = materials.map(material => {
      const materialObj = material.toObject();

      if (materialObj.cloudinaryId) {
        // Determine resource type
        const isVideo = materialObj.category === "Videos" && materialObj.videoType === "upload";
        const resourceType = isVideo ? "video" : "raw";

        // Use proxy route for viewing (handles inline display)
        materialObj.viewableUrl = getViewableUrl(materialObj.fileUrl, materialObj._id);

        // Generate signed URL for downloads
        materialObj.downloadUrl = getDownloadUrl(materialObj.cloudinaryId, materialObj.originalName, resourceType);
      }

      return materialObj;
    });

    res.json(materialsWithUrls);
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

    // Delete file from Cloudinary (if exists and has cloudinaryId)
    if (material.cloudinaryId) {
      try {
        // Determine resource type for deletion
        const isVideo = material.category === "Videos" && material.videoType === "upload";

        // PDFs are stored as 'raw' resource type in Cloudinary
        let resourceType = "raw"; // default for PDFs
        if (isVideo) resourceType = "video";

        await cloudinary.uploader.destroy(material.cloudinaryId, {
          resource_type: resourceType
        });
      } catch (cloudinaryErr) {
        console.error("Failed to delete file from Cloudinary:", cloudinaryErr);
        // Continue with database deletion even if Cloudinary deletion fails
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