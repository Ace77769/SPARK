// client/src/components/ContentPage.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ContentPage.css";

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject, subpart } = location.state || {};

  const categories = ["Textbooks", "Question Papers", "Videos"]; // Materials categories

  const handleCategoryClick = (category) => {
    navigate("/materials", {
      state: { selectedClass, subject, category },
    });
  };

  const handleQuizClick = () => {
    navigate("/quiz/list", {
      state: { selectedClass, subject }
    });
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Textbooks": return "📚";
      case "Question Papers": return "📝";
      case "Videos": return "🎥";
      default: return "📄";
    }
  };

  const getCategoryDescription = (category) => {
    switch(category) {
      case "Textbooks": return `Study textbooks and reference materials`;
      case "Question Papers": return `Practice with past papers and tests`;
      case "Videos": return `Watch educational videos and tutorials`;
      default: return `Explore ${category.toLowerCase()}`;
    }
  };

  return (
    <div className="content-container">
      <h2 className="page-title">
        📘 Explore {subpart} in {subject} – Class {selectedClass}
      </h2>

      {subpart === "Materials" ? (
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`category-card ${category === "Videos" ? "video-category" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-icon">
                {getCategoryIcon(category)}
              </div>
              <h3>{category}</h3>
              <p>{getCategoryDescription(category)}</p>
            </div>
          ))}
        </div>
      ) : subpart === "Videos" ? (
        // Direct navigation to videos when Videos subpart is selected
        <div className="direct-video-access">
          <div
            className="category-card video-category featured"
            onClick={() => handleCategoryClick("Videos")}
          >
            <div className="category-icon">🎥</div>
            <h3>Watch Videos</h3>
            <p>Educational videos and tutorials for {subject}</p>
          </div>
        </div>
      ) : subpart === "Quiz" ? (
        // ✅ NEW: Direct navigation to quizzes
        <div className="direct-quiz-access">
          <div
            className="category-card quiz-category featured"
            onClick={handleQuizClick}
          >
            <div className="category-icon">📝</div>
            <h3>Take Quizzes</h3>
            <p>Test your knowledge with interactive quizzes for {subject}</p>
            <div className="quiz-features">
              <span>✅ Instant Results</span>
              <span>🏆 Track Progress</span>
              <span>💡 Learn from Mistakes</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="content-info">
          <p>Here you can explore {subpart.toLowerCase()} for {subject}.</p>
          <p>More content types coming soon!</p>
        </div>
      )}

      <button className="back-button" onClick={() => navigate(-1)}>
        🔙 Back
      </button>
    </div>
  );
}