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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.1); }
          50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.2); }
        }
        .spark-float {
          animation: sparkFloat 6s ease-in-out infinite;
        }
        .login-card-animated {
          animation: slideUp 0.6s ease-out;
        }
        .logo-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .username-input,
        .password-input {
          color: #000000 !important;
          font-weight: 600 !important;
        }
        .username-input::placeholder,
        .password-input::placeholder {
          color: #8B7355 !important;
          opacity: 1 !important;
        }
        .username-input::-webkit-input-placeholder,
        .password-input::-webkit-input-placeholder {
          color: #8B7355;
        }
        .username-input::-moz-placeholder,
        .password-input::-moz-placeholder {
          color: #8B7355;
          opacity: 1;
        }
        .username-input:-ms-input-placeholder,
        .password-input:-ms-input-placeholder {
          color: #8B7355;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)',
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
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '6rem',
                height: '6rem',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                borderRadius: '50%',
                marginBottom: '1.5rem',
                transform: 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                border: '5px solid #fff',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15) rotate(15deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
            >
              <span style={{ fontSize: '3.5rem' }}>⭐</span>
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '900',
              color: '#FF6347',
              marginBottom: '0.5rem',
              fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
              textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
              letterSpacing: '2px'
            }}>
              SPARK
            </h1>
            <p style={{
              color: '#2C3E50',
              fontSize: '1.4rem',
              fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              🚀 Let's Learn Together! 📚
            </p>
          </div>

          {/* Login Card - properly centered */}
          <div
            className="login-card-animated"
            style={{
              background: '#fff',
              borderRadius: '2rem',
              padding: '2.5rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '5px solid #FFD700',
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <form onSubmit={submit}>
              {/* Username Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#2C3E50',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  fontFamily: "'Comic Sans MS', 'Arial', sans-serif"
                }}>
                  📝 Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: '#FFF9E6',
                    border: '3px solid #FFD700',
                    borderRadius: '15px',
                    color: '#000000',
                    fontSize: '1.1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
                    boxSizing: 'border-box',
                    fontWeight: '600'
                  }}
                  className="username-input"
                  placeholder="Type your username here"
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 4px rgba(255, 215, 0, 0.3)';
                    e.target.style.borderColor = '#FFA500';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#FFD700';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: '#2C3E50',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  fontFamily: "'Comic Sans MS', 'Arial', sans-serif"
                }}>
                  🔒 Password
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
                      background: '#FFF9E6',
                      border: '3px solid #FFD700',
                      borderRadius: '15px',
                      color: '#000000',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
                      boxSizing: 'border-box',
                      fontWeight: '600'
                    }}
                    className="password-input"
                    placeholder="Type your password here"
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 4px rgba(255, 215, 0, 0.3)';
                      e.target.style.borderColor = '#FFA500';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#FFD700';
                      e.target.style.transform = 'scale(1)';
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
                      color: '#FFA500',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF6347'}
                    onMouseLeave={(e) => e.target.style.color = '#FFA500'}
                  >
                    {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#FFE4E4',
                  color: '#DC143C',
                  padding: '1rem 1.25rem',
                  borderRadius: '15px',
                  border: '3px solid #FF6347',
                  fontSize: '1rem',
                  fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontWeight: '600'
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
                  background: loading ? '#D3D3D3' : 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: 'white',
                  fontWeight: '700',
                  borderRadius: '15px',
                  border: loading ? 'none' : '3px solid #fff',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(255, 165, 0, 0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? '0.7' : '1',
                  transition: 'all 0.3s ease',
                  fontSize: '1.2rem',
                  fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 30px rgba(255, 165, 0, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(255, 165, 0, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '3px solid white',
                      borderTop: '3px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>🚀 Sign In</>
                )}
              </button>
            </form>
          </div>

          {/* Info Section */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#fff',
            borderRadius: '20px',
            border: '4px solid #FFD700',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              color: '#FF6347',
              fontSize: '1.1rem',
              margin: '0 0 0.75rem 0',
              fontWeight: '700',
              fontFamily: "'Comic Sans MS', 'Arial', sans-serif"
            }}>
              🎓 Access Your Learning Dashboard
            </p>
            <p style={{
              color: '#5A6C7D',
              fontSize: '0.95rem',
              margin: '0',
              lineHeight: '1.6',
              fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
              fontWeight: '600'
            }}>
              📚 Students: Access courses, videos, and quizzes<br />
              👩‍🏫 Teachers: Manage content and track progress
            </p>
          </div>
        </div>
      </div>
    </>
  );
}