// src/teacher/TeacherNav.js
import React from "react";
import { Link } from "react-router-dom";
import "./teacher.css";

export default function TeacherNav() {
  return (
    <nav className="teacher-nav">
      <div className="brand">Teacher Panel</div>
      <div className="links">
        <Link to="/teacher/dashboard">Dashboard</Link>
        <Link to="/teacher/add-material">Add Material</Link>
        <Link to="/teacher/add-video">Add Video</Link>
        <Link to="/teacher/create-quiz">Create Quiz</Link>
        <Link to="/teacher/manage">Manage Content</Link>
      </div>
    </nav>
  );
}