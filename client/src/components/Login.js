// client/src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

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
    <>
      <style>{`
        @keyframes sparkFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spark-float {
          animation: sparkFloat 6s ease-in-out infinite;
        }
        .username-input::placeholder,
        .password-input::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 1 !important;
        }
        .username-input::-webkit-input-placeholder,
        .password-input::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        .username-input::-moz-placeholder,
        .password-input::-moz-placeholder {
          color: rgba(255, 255, 255, 0.7);
          opacity: 1;
        }
        .username-input:-ms-input-placeholder,
        .password-input:-ms-input-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #581c87 0%, #1e40af 50%, #312e81 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          inset: '0',
          opacity: '0.2',
          pointerEvents: 'none'
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="spark-float"
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                background: 'white',
                borderRadius: '50%',
                filter: 'blur(1px)'
              }}></div>
            </div>
          ))}
        </div>

        {/* Main container - properly centered */}
        <div style={{
          position: 'relative',
          zIndex: '10',
          width: '100%',
          maxWidth: '450px',
          margin: '0 auto'
        }}>
          {/* Logo and Title */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '5rem',
              height: '5rem',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              borderRadius: '1rem',
              marginBottom: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Sparkles style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
            </div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, white, #fde047)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              marginBottom: '0.5rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              SPARK
            </h1>
            <p style={{ 
              color: '#bfdbfe', 
              fontSize: '1.25rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textAlign: 'center'
            }}>
              Ignite Your Learning Journey
            </p>
          </div>

          {/* Login Card - properly centered */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <form onSubmit={submit}>
              {/* Username Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    color: 'white',
                    fontSize: '1.1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    boxSizing: 'border-box'
                  }}
                  className="username-input"
                  placeholder="Enter your username"
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.3)';
                    e.target.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>
              
              {/* Password Field */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      paddingRight: '3.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '1rem',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    className="password-input"
                    placeholder="Enter your password"
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.3)';
                      e.target.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'white'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                  padding: '1rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.95rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  background: loading ? '#6b7280' : 'linear-gradient(to right, #fbbf24, #f97316)',
                  color: 'white',
                  fontWeight: '700',
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: loading ? 'none' : '0 10px 25px rgba(251, 191, 36, 0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? '0.7' : '1',
                  transition: 'all 0.3s ease',
                  fontSize: '1.1rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 35px rgba(251, 191, 36, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 25px rgba(251, 191, 36, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}