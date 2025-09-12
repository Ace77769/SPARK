// src/teacher/AddMaterial.js
import React, { useState } from "react";
import TeacherNav from "./TeacherNav";
import "./teacher.css";

export default function AddMaterial() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Material Saved: ${title} - ${desc}`);
  };

  return (
    <>
      <TeacherNav />
      <form className="teacher-form" onSubmit={handleSubmit}>
        <h2>Add Material</h2>
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter material title"
        />
        <label>Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Enter description"
        />
        <button type="submit" className="primary">Save</button>
      </form>
    </>
  );
}
