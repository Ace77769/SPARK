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
        padding: "8px 12px",
        borderRadius: 8,
        background: "#ef4444",
        color: "white",
        border: "none",
        cursor: "pointer",
        ...style
      }}
    >
      Logout
    </button>
  );
}
