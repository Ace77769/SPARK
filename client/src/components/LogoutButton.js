// client/src/components/LogoutButton.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton({ className, style, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // remove stored token and user
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // If you later set an httpOnly cookie from server, call logout API to clear cookie:
      // await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

      // notify parent (App) to update UI immediately
      if (typeof onLogout === 'function') onLogout();
    } catch (e) {
      console.warn("Logout error", e);
    } finally {
      // navigate to login page
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
      style={{
        padding: "10px 24px",
        borderRadius: "25px",
        background: "#FF4757",
        color: "white",
        border: "3px solid #fff",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
        fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
        ...style
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.15)";
      }}
    >
      👋 Logout
    </button>
  );
}
