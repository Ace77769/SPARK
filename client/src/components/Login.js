// client/src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      // replace with your actual login call
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // store token/user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "teacher") navigate("/teacher/dashboard");
      else navigate("/class");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit} aria-labelledby="login-heading">
        <h2 id="login-heading" className="login-title">Login</h2>

        <label className="input-label" htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={change}
          placeholder="Enter username"
          className="text-input"
          autoComplete="username"
          aria-required="true"
        />

        <label className="input-label" htmlFor="password">Password</label>
        <div className="password-row">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            value={form.password}
            onChange={change}
            placeholder="Enter password"
            className="text-input password-input"
            autoComplete="current-password"
            aria-required="true"
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="icon-btn"
          >
            {show ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <div role="alert" className="error">{error}</div>}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : "Sign in"}
        </button>
      </form>
    </div>
  );
}
