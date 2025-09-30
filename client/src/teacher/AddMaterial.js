// client/src/teacher/AddMaterial.js
import React, { useState } from "react";
import "./AddMaterial.css";

export default function AddMaterial() {
  const [title, setTitle] = useState("");
  const [stdClass, setStdClass] = useState("1");
  const [subject, setSubject] = useState("Mathematics");
  const [category, setCategory] = useState("Textbooks"); // ✅ NEW
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
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
          {[
            "Mathematics",
            "Science",
            "English",
            "Social Studies",
            "Hindi",
            "Marathi",
            "Computer",
            "EVS",
            "Sanskrit",
          ].map((s) => (
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
