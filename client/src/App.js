// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClassSelection from './components/classSelection';
import SubjectSelection from './components/SubjectSelection'; // Create this next
import ContentPage from './components/contentpage'; // Create this next 
import MaterialPage from './components/materialpage'; // Create this next

// teacher pages
import TeacherDashboard from "./teacher/teacherdashboard";
import AddMaterial from "./teacher/AddMaterial";
import CreateQuiz from "./teacher/CreateQuiz";
import ManageContent from "./teacher/ManageContent";


function App() {
  return (
    <Router>
      <div>
        <h1>Digital Learning Hub</h1>
        <Routes>
          <Route path="/" element={<ClassSelection />} />
         <Route path="/subject" element={<SubjectSelection />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/materials" element={<MaterialPage />} />

           {/* Teacher UI (after login) */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/add-material" element={<AddMaterial />} />
        <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
        <Route path="/teacher/manage" element={<ManageContent />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
