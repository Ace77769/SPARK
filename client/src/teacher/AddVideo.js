// client/src/teacher/AddVideo.js
import React, { useState } from "react";
import TeacherNav from "./TeacherNav";
import "./AddVideo.css";

export default function AddVideo() {
  const [title, setTitle] = useState("");
  const [stdClass, setStdClass] = useState("1");
  const [subject, setSubject] = useState("Mathematics");
  const [videoType, setVideoType] = useState("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!title.trim()) {
      setMessage("❌ Please enter a title");
      setLoading(false);
      return;
    }

    if (videoType === "upload" && !file) {
      setMessage("❌ Please select a video file");
      setLoading(false);
      return;
    }

    if (videoType !== "upload" && !videoUrl.trim()) {
      setMessage("❌ Please enter a video URL");
      setLoading(false);
      return;
    }

    if (videoType === "youtube") {
      const videoId = extractYouTubeVideoId(videoUrl);
      if (!videoId) {
        setMessage("❌ Please enter a valid YouTube URL");
        setLoading(false);
        return;
      }
      console.log("Extracted YouTube video ID:", videoId); // Debug log
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("class", stdClass);
    formData.append("subject", subject);
    formData.append("category", "Videos");
    formData.append("videoType", videoType);
    formData.append("description", description);

    if (videoType === "upload" && file) {
      formData.append("file", file);
    } else {
      formData.append("videoUrl", videoUrl);
    }

    try {
      const res = await fetch("http://localhost:5000/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.ok) {
        setMessage("✅ Video added successfully!");
        setTitle("");
        setVideoUrl("");
        setDescription("");
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        setMessage("❌ Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error uploading video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TeacherNav />
      <div className="add-video-container">
        <h2>🎥 Add Video Content</h2>
        <form onSubmit={handleUpload} className="video-form">
          <div className="form-group">
            <label>Video Title *</label>
            <input
              type="text"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Class *</label>
              <select value={stdClass} onChange={(e) => setStdClass(e.target.value)}>
                {[1,2,3,4,5,6,7,8].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {[
                  "Mathematics",
                  "Science",
                  "English",
                  "Social Studies",
                  "Hindi",
                  "Marathi",
                  "Computer",
                  "EVS",
                  "Sanskrit",
                ].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Video Type *</label>
            <div className="video-type-tabs">
              <button
                type="button"
                className={`tab-btn ${videoType === "youtube" ? "active" : ""}`}
                onClick={() => setVideoType("youtube")}
              >
                📺 YouTube Link
              </button>
              <button
                type="button"
                className={`tab-btn ${videoType === "upload" ? "active" : ""}`}
                onClick={() => setVideoType("upload")}
              >
                📁 Upload Video
              </button>
              <button
                type="button"
                className={`tab-btn ${videoType === "other" ? "active" : ""}`}
                onClick={() => setVideoType("other")}
              >
                🔗 Other URL
              </button>
            </div>
          </div>

          {videoType === "youtube" && (
            <div className="form-group">
              <label>YouTube URL *</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <small>Paste the YouTube video URL here</small>
            </div>
          )}

          {videoType === "upload" && (
            <div className="form-group">
              <label>Upload Video File *</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <small>Supported formats: MP4, AVI, MOV, WMV, WebM (Max: 500MB)</small>
            </div>
          )}

          {videoType === "other" && (
            <div className="form-group">
              <label>Video URL *</label>
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <small>Enter direct video URL or embed link</small>
            </div>
          )}

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Enter video description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Adding Video...
              </>
            ) : (
              "🎥 Add Video"
            )}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}