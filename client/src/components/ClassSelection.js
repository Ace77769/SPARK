import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassSelection.css';

export default function ClassSelection() {
  const navigate = useNavigate();

  const handleClick = (classNum) => {
    const selected = `Class ${classNum}`;
    navigate('/subject', { state: { selectedClass: selected } });
  };

  const classColors = [
    "gradient-1", "gradient-2", "gradient-3", "gradient-4",
    "gradient-5", "gradient-6", "gradient-7", "gradient-8"
  ];

  const classIcons = ["🎓","📘","✏️","📚","🧮","🧪","🌍","💡"];

  return (
    <div className="class-selection-container">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => {
        const title = `Class ${num}`;
        return (
          <div
            key={num}
            className={`class-card ${classColors[index]}`}
            onClick={() => handleClick(num)}
          >
            <div className="icon">{classIcons[index]}</div>
            <h3 className="class-title">{title}</h3>
            <p className="class-description">Click to explore subjects</p>
          </div>
        );
      })}
    </div>
  );
}
