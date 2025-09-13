import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassSelection.css';

export default function ClassSelection() {
  const navigate = useNavigate();

  const handleClick = (classNum) => {
    // Store only the number as string (to match teacher upload)
    navigate('/subject', { state: { selectedClass: String(classNum) } });
  };

  const classColors = [
    "gradient-1", "gradient-2", "gradient-3", "gradient-4",
    "gradient-5", "gradient-6", "gradient-7", "gradient-8"
  ];

  const classIcons = ["🎓","📘","✏️","📚","🧮","🧪","🌍","💡"];

  return (
    <div className="class-selection-container">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
        <div
          key={num}
          className={`class-card ${classColors[index]}`}
          onClick={() => handleClick(num)}
        >
          <div className="icon">{classIcons[index]}</div>
          {/* Display "Class X" for UI, but only pass "X" */}
          <h3 className="class-title">Class {num}</h3>
          <p className="class-description">Click to explore subjects</p>
        </div>
      ))}
    </div>
  );
}
