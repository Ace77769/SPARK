import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ContentPage.css";

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject, subpart } = location.state || {};

  return (
    <div className="content-container">
      <h2>
        {subpart} for {subject} ({selectedClass})
      </h2>
      <p className="content-info">
        Here you can display study {subpart.toLowerCase()} for{" "}
        {subject}.
      </p>

      <button className="back-button" onClick={() => navigate(-1)}>
        🔙 Back
      </button>
    </div>
  );
}
