// client/src/teacher/ManageContent.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherNav from "./TeacherNav";
import "./teacher.css";

export default function ManageContent() {
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/materials")
      .then((res) => setMaterials(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete content.");
    }
  };

  const filteredMaterials = materials.filter(material => {
    if (filter === "all") return true;
    return material.category === filter;
  });

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Textbooks": return "📚";
      case "Question Papers": return "📝";
      case "Videos": return "🎥";
      default: return "📄";
    }
  };

  const getVideoTypeIcon = (videoType) => {
    switch(videoType) {
      case "youtube": return "📺";
      case "upload": return "📁";
      case "other": return "🔗";
      default: return "🎥";
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 50%, #FFDAB9 100%)',
      padding: '20px'
    }}>
      <TeacherNav />
      <div className="manage-container">
      <h2>📂 Manage Uploaded Content</h2>

      {/* Filter buttons */}
      <div className="filter-buttons">
        <button 
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All Content
        </button>
        <button 
          className={filter === "Textbooks" ? "active" : ""}
          onClick={() => setFilter("Textbooks")}
        >
          📚 Textbooks
        </button>
        <button 
          className={filter === "Question Papers" ? "active" : ""}
          onClick={() => setFilter("Question Papers")}
        >
          📝 Question Papers
        </button>
        <button 
          className={filter === "Videos" ? "active" : ""}
          onClick={() => setFilter("Videos")}
        >
          🎥 Videos
        </button>
      </div>

      <div className="materials-list">
        {filteredMaterials.length === 0 ? (
          <p>No {filter === "all" ? "content" : filter.toLowerCase()} uploaded yet.</p>
        ) : (
          filteredMaterials.map((m) => (
            <div key={m._id} className={`material-item ${m.category === "Videos" ? "video-item" : ""}`}>
              <div className="material-info">
                <div className="material-header">
                  <span className="category-badge">
                    {getCategoryIcon(m.category)} {m.category}
                  </span>
                  {m.category === "Videos" && (
                    <span className="video-type-badge">
                      {getVideoTypeIcon(m.videoType)} {m.videoType}
                    </span>
                  )}
                </div>
                
                <h3 className="material-title">
                  {m.title || m.originalName}
                </h3>
                
                <div className="material-meta">
                  <span>Class {m.stdClass}</span>
                  <span>•</span>
                  <span>{m.subject}</span>
                  {m.description && (
                    <>
                      <span>•</span>
                      <span className="description-preview">
                        {m.description.length > 50 ? 
                          `${m.description.substring(0, 50)}...` : 
                          m.description
                        }
                      </span>
                    </>
                  )}
                </div>

                {m.category === "Videos" && m.videoType === "youtube" && (
                  <div className="video-thumbnail-small">
                    {(() => {
                      let videoId = m.youtubeVideoId;
                      
                      // If no stored video ID, try to extract from URL
                      if (!videoId && m.videoUrl) {
                        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                        const match = m.videoUrl.match(regex);
                        videoId = match ? match[1] : null;
                      }
                      
                      return videoId ? (
                        <img 
                          src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                          alt={m.title}
                          className="thumbnail-preview"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="thumbnail-preview" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: '#374151',
                          color: '#9ca3af'
                        }}>
                          🎥
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="actions">
                {/* View/Play */}
                {m.category === "Videos" ? (
                  m.videoType === "youtube" ? (
                    <a
                      href={m.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="view-btn"
                      title="Watch on YouTube"
                    >
                      ▶ Play
                    </a>
                  ) : m.videoType === "upload" ? (
                    <a
                      href={m.fileUrl || `http://localhost:5000/uploads/${m.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="view-btn"
                      title="Play Video"
                    >
                      ▶ Play
                    </a>
                  ) : (
                    <a
                      href={m.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="view-btn"
                      title="Play Video"
                    >
                      ▶ Play
                    </a>
                  )
                ) : (
                  <a
                    href={m.viewableUrl ? `http://localhost:5000${m.viewableUrl}` : (m.fileUrl || `http://localhost:5000/uploads/${m.filename}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="view-btn"
                    title="View Document"
                  >
                    👁 View
                  </a>
                )}

                {/* Download (only for uploaded files) */}
                {(m.fileUrl || m.filename) && (
                  <a
                    href={m.downloadUrl || m.fileUrl || `http://localhost:5000/uploads/${m.filename}`}
                    download={m.originalName}
                    className="download-btn"
                    title="Download"
                  >
                    📥 Download
                  </a>
                )}

                {/* Delete */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(m._id)}
                  title="Delete"
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}