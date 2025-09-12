import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SubjectSelection.css';

export default function SubjectSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedClass = location.state?.selectedClass;

  const subjects = ['Maths', 'Science', 'English'];
  const subParts = ['Materials', 'Videos', 'Quiz'];

  const handleSubpartClick = (subject, subpart) => {
    navigate('/content', { state: { selectedClass, subject, subpart } });
  };

  return (
    <div className="subject-selection-container">
      <h2 className="heading">
        Select Subject for {selectedClass || 'Class'}
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
  );
}
