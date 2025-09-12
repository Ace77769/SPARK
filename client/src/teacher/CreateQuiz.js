// src/teacher/CreateQuiz.js
import React, { useState } from "react";
import TeacherNav from "./TeacherNav";
import "./teacher.css";

export default function CreateQuiz() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Quiz Saved: ${question}`);
  };

  return (
    <>
      <TeacherNav />
      <form className="teacher-form" onSubmit={handleSubmit}>
        <h2>Create Quiz</h2>
        <label>Question</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
        />
        <label>Options</label>
        {options.map((opt, idx) => (
          <input
            key={idx}
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[idx] = e.target.value;
              setOptions(newOpts);
            }}
            placeholder={`Option ${idx + 1}`}
          />
        ))}
        <button type="submit" className="primary">Save Quiz</button>
      </form>
    </>
  );
}
