// client/src/components/MaterialPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MaterialPage.css";

export default function MaterialsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject, category } = location.state || {};

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="materials-container">
      <h2>
        {category} - {subject} (Class {selectedClass})
      </h2>

      {loading && <p>Loading materials...</p>}

      <div className="files-grid">
        {!loading && files.length === 0 && <p>No materials found.</p>}

        {files.map((file) => (
          <div key={file._id} className="file-card">
            <p>{file.title || file.originalName}</p>

            <div className="file-actions">
              <a
                href={`http://localhost:5000/uploads/${file.filename}`}
                target="_blank"
                rel="noreferrer"
                className="view-btn"
              >
                👁 View
              </a>
              <a
                href={`http://localhost:5000/uploads/${file.filename}`}
                download={file.originalName}
                className="download-btn"
              >
                📥 Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        🔙 Back
      </button>
    </div>
  );
}
