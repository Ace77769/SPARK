// src/teacher/TeacherDashboard.js
import React from "react";
import TeacherNav from "./TeacherNav";
import { Link } from "react-router-dom";
import "./teacher.css";

export default function TeacherDashboard() {
  return (
    <div>
      <TeacherNav />
      <div className="teacher-dashboard">
        <h1>Welcome Teacher 👩‍🏫</h1>
        <div className="teacher-cards">
          <Link to="/teacher/add-material" className="card">
            <h3>📄 Add Materials</h3>
            <p>Upload PDFs, notes or textbooks</p>
          </Link>
          <Link to="/teacher/add-video" className="card video-card-dashboard">
            <h3>🎥 Add Videos</h3>
            <p>Upload videos or link YouTube content</p>
          </Link>
          <Link to="/teacher/create-quiz" className="card">
            <h3>📝 Create Quiz</h3>
            <p>Build multiple-choice quizzes</p>
          </Link>
          <Link to="/teacher/manage" className="card">
            <h3>🗂️ Manage Content</h3>
            <p>Edit or delete uploaded resources</p>
          </Link>
        </div>
      </div>
    </div>
  );
}