// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './components/Login';
import ClassSelection from './components/ClassSelection';
import SubjectSelection from './components/SubjectSelection';
import ContentPage from './components/ContentPage';
import MaterialPage from './components/MaterialPage';

// teacher pages
import TeacherDashboard from "./teacher/teacherdashboard";
import AddMaterial from "./teacher/AddMaterial";
import AddVideo from "./teacher/AddVideo"; // ✅ NEW
import CreateQuiz from "./teacher/CreateQuiz";
import ManageContent from "./teacher/ManageContent";

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
    <div style={{ padding: 12 }}>
      {/* Header */}
      <div style={{
         display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "60px",
      background: "#f0f0f0",
      padding: "0 20px"
      }}>
        <h1 style={{ margin: 0 }}>SPARK - Learning Hub Platform</h1>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#333" }}>
              Welcome, <b>{user.username}</b> ({user.role})
            </span>
            {/* pass setUser so LogoutButton can clear state when logging out */}
            <LogoutButton onLogout={() => setUser(null)} />
          </div>
        ) : null}
      </div>

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