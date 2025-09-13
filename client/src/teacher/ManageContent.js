// client/src/teacher/ManageContent.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./teacher.css";

export default function ManageContent() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/materials")
      .then((res) => setMaterials(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete material.");
    }
  };

  return (
    <div className="manage-container">
      <h2>📂 Manage Uploaded Materials</h2>

      <div className="materials-list">
        {materials.length === 0 ? (
          <p>No materials uploaded yet.</p>
        ) : (
          materials.map((m) => (
            <div key={m._id} className="material-item">
              <span>
                <strong>{m.title || m.originalName}</strong> — Class {m.stdClass} | {m.subject} | <em>{m.category}</em>
              </span>

              <div className="actions">
                {/* View */}
                <a
                  href={`http://localhost:5000/uploads/${m.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-btn"
                >
                  👁 View
                </a>

                {/* Download */}
                <a
                  href={`http://localhost:5000/uploads/${m.filename}`}
                  download={m.originalName}
                  className="download-btn"
                >
                  📥 Download
                </a>

                {/* Delete */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(m._id)}
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
