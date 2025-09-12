// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClassSelection from './components/classSelection';
import SubjectSelection from './components/SubjectSelection'; // Create this next
import ContentPage from './components/contentpage'; // Create this next 
function App() {
  return (
    <Router>
      <div>
        <h1>Digital Learning Hub</h1>
        <Routes>
          <Route path="/" element={<ClassSelection />} />
         <Route path="/subject" element={<SubjectSelection />} />
          <Route path="/content" element={<ContentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
