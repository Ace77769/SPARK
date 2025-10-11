// Utility function to get subjects for each class
export const getSubjectsForClass = (classNum) => {
  const classNumber = parseInt(classNum);

  // Classes 1-5: Same subjects
  if (classNumber >= 1 && classNumber <= 5) {
    return [
      "Marathi",
      "English",
      "Mathematics",
      "Environmental Studies (EVS)"
    ];
  }

  // Classes 6-7: Extended subjects
  if (classNumber >= 6 && classNumber <= 7) {
    return [
      "English",
      "Marathi",
      "Mathematics",
      "History",
      "Civics",
      "Geography",
      "Science"
    ];
  }

  // Class 8 and above: All subjects (fallback)
  return [
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
};
