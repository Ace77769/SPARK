import React from 'react';
import './ClassSelection.css';

export default function ClassSelection({ selectedClass, setSelectedClass }) {
  const handleClick = (classNum) => {
    setSelectedClass(`Class ${classNum}`);
  };

  return (
    <div className="class-selection-container">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
        const title = `Class ${num}`;
        const isSelected = selectedClass === title;
        return (
          <div
            key={num}
            className={`class-card${isSelected ? ' selected' : ''}`}
            onClick={() => handleClick(num)}
          >
            <h3 className="class-title">{title}</h3>
            <p className="class-description">
              {isSelected
                ? 'This class is selected'
                : 'Click to select this class'}
            </p>
          </div>
        );
      })}
    </div>
  );
}