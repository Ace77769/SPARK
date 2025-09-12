// src/teacher/ManageContent.js
import React from "react";
import TeacherNav from "./TeacherNav";
import "./teacher.css";

export default function ManageContent() {
  return (
    <>
      <TeacherNav />
      <div className="teacher-dashboard">
        <h2>Manage Uploaded Content</h2>
        <p>(Later you can connect this with database and show materials & quizzes here)</p>
      </div>
    </>
  );
}
