// client/src/teacher/AddMaterial.js
import React, { useState, useEffect } from "react";
import TeacherNav from "./TeacherNav";
import "./AddMaterial.css";
import { getSubjectsForClass } from "../utils/subjectUtils";

export default function AddMaterial() {
  const [title, setTitle] = useState("");
  const [stdClass, setStdClass] = useState("1");
  const [subjects, setSubjects] = useState(getSubjectsForClass("1"));
  const [subject, setSubject] = useState(getSubjectsForClass("1")[0]);
  const [category, setCategory] = useState("Textbooks"); // ✅ NEW
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  // Update subjects when class changes
  useEffect(() => {
    const newSubjects = getSubjectsForClass(stdClass);
    setSubjects(newSubjects);
    setSubject(newSubjects[0]); // Set first subject as default
  }, [stdClass]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("class", stdClass); // backend maps → stdClass
    fd.append("subject", subject);
    fd.append("category", category); // ✅ send category
    fd.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/materials/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.ok) {
        setMessage("✅ File uploaded successfully!");
        setTitle("");
        setFile(null);
      } else {
        setMessage("❌ Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error uploading file");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 50%, #FFDAB9 100%)',
      padding: '20px'
    }}>
      <TeacherNav />
      <div className="upload-container">
        <h2>📤 Add Material</h2>
        <form onSubmit={handleUpload} className="upload-form">
        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Choose Class:</label>
        <select value={stdClass} onChange={(e) => setStdClass(e.target.value)}>
          {[1,2,3,4,5,6,7,8].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label>Choose Subject:</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* ✅ NEW Category Dropdown */}
        <label>Choose Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Textbooks">Textbooks</option>
          <option value="Question Papers">Question Papers</option>
        </select>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit">Upload</button>
      </form>
      {message && <p className="upload-msg">{message}</p>}
      </div>
    </div>
  );
}
