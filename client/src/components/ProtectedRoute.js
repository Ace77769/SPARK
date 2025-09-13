// client/src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * Props:
 *  - children: React node (the protected page)
 *  - requiredRole (optional): string role required to access (e.g. "teacher")
 *
 * Behavior:
 *  - if no user in localStorage -> redirect to /login
 *  - if requiredRole provided and user.role !== requiredRole -> redirect to /login (or a 403 page you can add)
 */
export default function ProtectedRoute({ children, requiredRole }) {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return <Navigate to="/login" replace />;

    const user = JSON.parse(raw);
    if (!user || !user.username) return <Navigate to="/login" replace />;

    if (requiredRole && user.role !== requiredRole) {
      // not authorized for this role
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (err) {
    // parsing error -> force login
    return <Navigate to="/login" replace />;
  }
}
