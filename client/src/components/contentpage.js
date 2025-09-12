import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ContentPage.css";

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject, subpart } = location.state || {};

  const categories = ["Textbooks", "Question Papers"];

  const handleCategoryClick = (category) => {
    navigate("/materials", {
      state: { selectedClass, subject, category },
    });
  };

  return (
    <div className="content-container">
      <h2 className="page-title">
  📘 Explore {subpart} in {subject} – {selectedClass}
</h2>


      {subpart === "Materials" ? (
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className="category-card"
              onClick={() => handleCategoryClick(category)}
            >
              <h3>{category}</h3>
              <p>Explore {category} for {subject}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="content-info">
          Here you can display study {subpart.toLowerCase()} for {subject}.
        </p>
      )}

      <button className="back-button" onClick={() => navigate(-1)}>
        🔙 Back
      </button>
    </div>
  );
}
