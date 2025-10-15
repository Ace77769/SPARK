// client/src/components/MaterialPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import "./MaterialPage.css";

export default function MaterialsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject, category } = location.state || {};

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (!selectedClass || !subject || !category) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `http://localhost:5000/api/materials?stdClass=${selectedClass}&subject=${subject}&category=${category}`;
        console.log("Fetching:", url);

        const res = await fetch(url);
        const data = await res.json();
        console.log("Received:", data);

        setFiles(data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass, subject, category]);

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  const renderFileCard = (file) => {
    console.log('Rendering file:', file); // Debug log
    
    // Check if this is a video based on category OR if it has video-specific properties
    const isVideo = file.category === "Videos" || file.videoType || file.videoUrl;
    
    if (isVideo) {
      // For YouTube videos, get thumbnail using video ID
      let thumbnailUrl = null;
      if (file.videoType === "youtube") {
        let videoId = file.youtubeVideoId;
        
        // If no stored video ID, try to extract from URL
        if (!videoId && file.videoUrl) {
          const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
          const match = file.videoUrl.match(regex);
          videoId = match ? match[1] : null;
        }
        
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }

      return (
        <div key={file._id} className="file-card video-card">
          <div className="video-thumbnail">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl}
                alt={file.title}
                className="thumbnail-img"
                onError={(e) => {
                  // Fallback if thumbnail fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="default-thumbnail" style={{ display: thumbnailUrl ? 'none' : 'flex' }}>
              🎥
            </div>
            <div className="play-overlay" onClick={() => handleVideoPlay(file)}>
              <div className="play-button">▶</div>
            </div>
          </div>
          
          <div className="video-info">
            <h3 className="video-title">{file.title}</h3>
            {file.description && (
              <p className="video-description">{file.description}</p>
            )}
            <div className="video-meta">
              <span className="video-type">
                {file.videoType === "youtube" ? "📺 YouTube" : 
                 file.videoType === "upload" ? "📁 Uploaded" : "🔗 External"}
              </span>
              {file.duration && (
                <span className="video-duration">{file.duration}</span>
              )}
            </div>
          </div>

          <div className="video-actions">
            <button 
              className="play-btn"
              onClick={() => handleVideoPlay(file)}
            >
              ▶ Play Video
            </button>
            {file.videoType === "youtube" && file.videoUrl && (
              <a
                href={file.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="external-btn"
              >
                🔗 YouTube
              </a>
            )}
            {/* Only show download for uploaded videos that have files */}
            {file.videoType === "upload" && (file.fileUrl || file.filename) && (
              <a
                href={file.fileUrl || `http://localhost:5000/uploads/${file.filename}`}
                download={file.originalName}
                className="download-btn"
              >
                📥 Download
              </a>
            )}
          </div>
        </div>
      );
    } else {
      // Original PDF/document rendering
      // Use viewableUrl for viewing (proxy route that serves inline), downloadUrl for downloading
      const viewLink = file.viewableUrl
        ? `http://localhost:5000${file.viewableUrl}`
        : (file.fileUrl || `http://localhost:5000/uploads/${file.filename}`);
      const downloadLink = file.downloadUrl || file.fileUrl || `http://localhost:5000/uploads/${file.filename}`;

      return (
        <div key={file._id} className="file-card">
          <div className="file-icon">📄</div>
          <p className="file-title">{file.title || file.originalName}</p>

          <div className="file-actions">
            <a
              href={viewLink}
              target="_blank"
              rel="noreferrer"
              className="view-btn"
            >
              👁 View
            </a>
            <a
              href={downloadLink}
              download={file.originalName}
              className="download-btn"
            >
              📥 Download
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="materials-container">
      <h2>
        {category === "Videos" ? "🎥" : "📚"} {category} - {subject} (Class {selectedClass})
      </h2>

      {loading && <p className="loading-text">Loading {category.toLowerCase()}...</p>}

      <div className={`files-grid ${category === "Videos" ? "videos-grid" : ""}`}>
        {!loading && files.length === 0 && (
          <div className="no-content">
            <p>No {category.toLowerCase()} found.</p>
            <p>Ask your teacher to add some content!</p>
          </div>
        )}

        {files.map(renderFileCard)}
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        🔙 Back
      </button>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo} 
          onClose={closeVideoPlayer} 
        />
      )}
    </div>
  );
}