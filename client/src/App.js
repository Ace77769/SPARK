// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './components/Login';
import ClassSelection from './components/ClassSelection';
import SubjectSelection from './components/SubjectSelection';
import ContentPage from './components/ContentPage';
import MaterialPage from './components/MaterialPage';

// ✅ Quiz components
import QuizList from './components/QuizList';
import TakeQuiz from './components/TakeQuiz';
import QuizResult from './components/QuizResult'; // Single quiz result after submission
import QuizResults from './components/QuizResults'; // Student attempt history

// teacher pages
import TeacherDashboard from "./teacher/teacherdashboard";
import AddMaterial from "./teacher/AddMaterial";
import AddVideo from "./teacher/AddVideo";
import CreateQuiz from "./teacher/CreateQuiz";
import ManageContent from "./teacher/ManageContent";
import ManageQuizzes from "./teacher/ManageQuizzes"; // ✅ Teacher quiz management

import ProtectedRoute from './components/ProtectedRoute';
import LogoutButton from './components/LogoutButton';

// small wrapper so we can use useLocation easily and keep App clean
function AppWrapper() {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // update local state whenever the route changes (so header reacts after login)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [location]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Only show when user is logged in */}
      {user && (
        <div className="app-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "80px",
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)",
          padding: "0 30px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "4px solid #FF6347"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: "900",
            color: "#fff",
            fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
            textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ fontSize: "2.5rem" }}>⭐</span> SPARK Learning
          </h1>

          <div className="app-header-user" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              fontSize: "1rem",
              color: "#fff",
              fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
              background: "rgba(255, 255, 255, 0.3)",
              padding: "10px 20px",
              borderRadius: "25px",
              fontWeight: "bold",
              border: "3px solid #fff",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)"
            }}>
              👤 {user.username} <span style={{ fontSize: "0.85rem" }}>({user.role === 'teacher' ? '👩‍🏫 Teacher' : '👨‍🎓 Student'})</span>
            </span>
            {/* pass setUser so LogoutButton can clear state when logging out */}
            <LogoutButton onLogout={() => setUser(null)} />
          </div>
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* protected: student pages (any logged-in user) */}
        <Route
          path="/class"
          element={
            <ProtectedRoute>
              <ClassSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject"
          element={
            <ProtectedRoute>
              <SubjectSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <ContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <MaterialPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Quiz routes for students */}
        <Route
          path="/quiz/list"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/take"
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/result"
          element={
            <ProtectedRoute>
              <QuizResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/results"
          element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          }
        />

        {/* teacher routes: require teacher role */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/add-material"
          element={
            <ProtectedRoute requiredRole="teacher">
              <AddMaterial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/add-video"
          element={
            <ProtectedRoute requiredRole="teacher">
              <AddVideo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/create-quiz"
          element={
            <ProtectedRoute requiredRole="teacher">
              <CreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/manage"
          element={
            <ProtectedRoute requiredRole="teacher">
              <ManageContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/manage-quizzes"
          element={
            <ProtectedRoute requiredRole="teacher">
              <ManageQuizzes />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}