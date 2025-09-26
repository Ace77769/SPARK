// client/src/components/VideoPlayer.js
import React from "react";
import "./VideoPlayer.css";

export default function VideoPlayer({ video, onClose }) {
  if (!video) return null;

  const renderVideoPlayer = () => {
    console.log('Video data:', video); // Debug log
    
    if (video.videoType === "youtube") {
      // For YouTube videos, use the youtubeVideoId if available, otherwise extract from URL
      let videoId = video.youtubeVideoId;
      
      if (!videoId && video.videoUrl) {
        // Extract video ID from URL if not already stored
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = video.videoUrl.match(regex);
        videoId = match ? match[1] : null;
      }
      
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
            title={video.title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="video-iframe"
          />
        );
      } else {
        return (
          <div className="video-error">
            <p>❌ Invalid YouTube video</p>
            <p>Could not extract video ID from URL</p>
          </div>
        );
      }
    } else if (video.videoType === "upload" && video.filename) {
      return (
        <video
          controls
          className="video-element"
          preload="metadata"
        >
          <source 
            src={`http://localhost:5000/uploads/${video.filename}`} 
            type={video.mimetype || "video/mp4"} 
          />
          Your browser does not support the video tag.
        </video>
      );
    } else if (video.videoType === "other" && video.videoUrl) {
      // Handle other external video URLs
      const isDirectVideo = video.videoUrl.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i);
      
      if (isDirectVideo) {
        return (
          <video
            controls
            className="video-element"
            preload="metadata"
          >
            <source src={video.videoUrl} />
            Your browser does not support the video tag.
          </video>
        );
      } else {
        return (
          <iframe
            src={video.videoUrl}
            title={video.title}
            allowFullScreen
            className="video-iframe"
          />
        );
      }
    }

    return (
      <div className="video-error">
        <p>❌ Unable to load video</p>
        <p>Video type: {video.videoType || 'unknown'}</p>
        <p>Please check the video configuration</p>
      </div>
    );
  };

  return (
    <div className="video-player-overlay">
      <div className="video-player-modal">
        <div className="video-header">
          <h3>{video.title}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="video-content">
          {renderVideoPlayer()}
        </div>
        
        {video.description && (
          <div className="video-description">
            <h4>📝 Description</h4>
            <p>{video.description}</p>
          </div>
        )}
        
        <div className="video-info">
          <div className="info-row">
            <span><strong>Subject:</strong> {video.subject}</span>
            <span><strong>Class:</strong> {video.stdClass}</span>
          </div>
          {video.videoType === "youtube" && (
            <div className="external-link">
              <a 
                href={video.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="youtube-link"
              >
                🔗 Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}