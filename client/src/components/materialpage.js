import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MaterialPage.css";

export default function MaterialsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject, category } = location.state || {};

  // Example files (replace later with real DB/API data)
  const files = [
    `${category} File 1 for ${subject}`,
    `${category} File 2 for ${subject}`,
    `${category} File 3 for ${subject}`,
  ];

  return (
    <div className="materials-container">
      <h2>
        {category} - {subject} ({selectedClass})
      </h2>

      <div className="files-grid">
        {files.map((file, index) => (
          <div key={index} className="file-card">
            <p>{file}</p>
            <button className="download-btn">📥 Download</button>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        🔙 Back
      </button>
    </div>
  );
}
