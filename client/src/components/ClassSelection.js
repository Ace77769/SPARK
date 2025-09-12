import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassSelection.css';

export default function ClassSelection() {
  const navigate = useNavigate();

  const handleClick = (classNum) => {
    const selected = `Class ${classNum}`;
    navigate('/subject', { state: { selectedClass: selected } });
  };

  return (
    <div className="class-selection-container">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
        const title = `Class ${num}`;
        return (
          <div
            key={num}
            className="class-card"
            onClick={() => handleClick(num)}
          >
            <h3 className="class-title">{title}</h3>
            <p className="class-description">
              Click to select this class
            </p>
          </div>
        );
      })}
    </div>
  );
}
