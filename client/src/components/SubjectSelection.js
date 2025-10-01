import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SubjectSelection.css';
import LogoutButton from './LogoutButton';

export default function SubjectSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedClass = location.state?.selectedClass;

  // Match teacher upload subjects exactly
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
    "Hindi",
    "Marathi",
    "Computer",
    "EVS",
    "Sanskrit"
  ];

  const subParts = ["Materials", "Videos", "Quiz"];

  const handleSubpartClick = (subject, subpart) => {
    navigate('/content', { state: { selectedClass, subject, subpart } });
  };

  return (
    <div className="subject-page-root">
      {/* Floating animated bubbles (background) */}
      <div className="bubbles" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <LogoutButton />
      </div>
      <div className="subject-selection-container">
        <h2 className="heading">
          📚 Learning Hub — {selectedClass ? `Class ${selectedClass}` : 'Select Class'}
        </h2>

        <div className="subjects-grid">
          {subjects.map((subject, index) => (
            <div key={index} className="subject-card">
              <h3 className="subject-title">{subject}</h3>
              <p className="subject-description">Explore {subject}</p>

              <div className="subparts-grid">
                {subParts.map((part, i) => (
                  <button
                    key={i}
                    className="subpart-button"
                    onClick={() => handleSubpartClick(subject, part)}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
