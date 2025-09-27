// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded PDFs and videos (static)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const materialsRoutes = require("./routes/materials");
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz"); // ✅ NEW: Quiz routes

app.use("/api/materials", materialsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes); // ✅ NEW: Quiz API endpoints

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Materials API: http://localhost:${PORT}/api/materials`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Quiz API: http://localhost:${PORT}/api/quiz`); // ✅ NEW
});