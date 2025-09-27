// client/src/components/QuizResults.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizResults.css';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, selectedClass, subject } = location.state || {};
  
  // Debug logging
  console.log('QuizResults component loaded with:', {
    quizId,
    selectedClass,
    subject,
    locationState: location.state
  });
  
  const [attempts, setAttempts] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get current user
  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.username || 'student';
    } catch {
      return 'student';
    }
  };

  useEffect(() => {
    if (!quizId) {
      setError("Quiz ID not provided");
      setLoading(false);
      return;
    }

    fetchQuizAndAttempts();
  }, [quizId, navigate]);

  const fetchQuizAndAttempts = async () => {
    try {
      setLoading(true);
      setError('');
      const username = getCurrentUser();

      console.log('Fetching quiz and attempts for:', { quizId, username }); // Debug log

      // Fetch quiz details
      const quizResponse = await fetch(`/api/quiz/${quizId}/take`);
      const quizData = await quizResponse.json();

      console.log('Quiz response:', quizData); // Debug log

      if (!quizData.success) {
        setError(`Quiz not found: ${quizData.message || 'Unknown error'}`);
        return;
      }

      setQuiz(quizData.quiz);

      // Fetch user's attempts for this quiz
      const attemptsResponse = await fetch(`/api/quiz/attempts/${username}`);
      const attemptsData = await attemptsResponse.json();

      console.log('Attempts response:', attemptsData); // Debug log

      if (attemptsData.success) {
        // Filter attempts for this specific quiz
        const quizAttempts = attemptsData.attempts.filter(
          attempt => {
            // Handle both populated and non-populated quizId
            const attemptQuizId = attempt.quizId._id || attempt.quizId;
            return attemptQuizId === quizId;
          }
        );
        console.log('Filtered attempts:', quizAttempts); // Debug log
        setAttempts(quizAttempts);
      } else {
        console.warn('Failed to fetch attempts:', attemptsData.message);
        setAttempts([]); // Set empty array instead of error
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to load quiz results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRetakeQuiz = () => {
    navigate('/quiz/take', { 
      state: { 
        quizId, 
        selectedClass, 
        subject 
      } 
    });
  };

  if (loading) {
    return (
      <div className="quiz-results-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-results-container">
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#9ca3af' }}>
            <p>Debug Info:</p>
            <p>Quiz ID: {quizId || 'Not provided'}</p>
            <p>Selected Class: {selectedClass || 'Not provided'}</p>
            <p>Subject: {subject || 'Not provided'}</p>
          </div>
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <h1>📊 Quiz Results</h1>
        {quiz && <h2>{quiz.title}</h2>}
        <div className="quiz-meta">
          <span>📚 {subject}</span>
          <span>🎓 Class {selectedClass}</span>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="no-attempts">
          <div className="no-attempts-icon">📝</div>
          <h3>No Attempts Yet</h3>
          <p>You haven't taken this quiz yet.</p>
          <button onClick={handleRetakeQuiz} className="take-quiz-btn">
            📝 Take Quiz Now
          </button>
        </div>
      ) : (
        <>
          {/* Best Score Summary */}
          <div className="best-score-card">
            <h3>🏆 Your Best Performance</h3>
            {(() => {
              const bestAttempt = attempts.reduce((best, current) => 
                current.percentage > best.percentage ? current : best
              );
              return (
                <div className="score-display">
                  <div 
                    className="score-circle"
                    style={{ borderColor: getScoreColor(bestAttempt.percentage) }}
                  >
                    <span 
                      className="percentage"
                      style={{ color: getScoreColor(bestAttempt.percentage) }}
                    >
                      {bestAttempt.percentage}%
                    </span>
                    <span className="fraction">
                      {bestAttempt.score}/{bestAttempt.totalQuestions}
                    </span>
                  </div>
                  <div className="score-details">
                    <div className="status">
                      {bestAttempt.isPassed ? (
                        <span className="passed">✅ Passed</span>
                      ) : (
                        <span className="failed">❌ Failed</span>
                      )}
                    </div>
                    <div className="attempt-date">
                      {formatDate(bestAttempt.submittedAt)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Attempts History */}
          <div className="attempts-history">
            <h3>📜 Attempt History ({attempts.length})</h3>
            <div className="attempts-list">
              {attempts.map((attempt, index) => (
                <div key={attempt._id} className="attempt-item">
                  <div className="attempt-header">
                    <span className="attempt-number">
                      Attempt #{attempts.length - index}
                    </span>
                    <span className="attempt-date">
                      {formatDate(attempt.submittedAt)}
                    </span>
                  </div>
                  
                  <div className="attempt-details">
                    <div className="score-info">
                      <span 
                        className="score"
                        style={{ color: getScoreColor(attempt.percentage) }}
                      >
                        {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                      </span>
                      <span className={`status ${attempt.isPassed ? 'passed' : 'failed'}`}>
                        {attempt.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="time-taken">
                      ⏱️ {attempt.timeTaken} minutes
                    </div>
                  </div>

                  <div className="attempt-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${attempt.percentage}%`,
                          backgroundColor: getScoreColor(attempt.percentage)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="statistics-card">
            <h3>📈 Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{attempts.length}</span>
                <span className="stat-label">Total Attempts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)}%
                </span>
                <span className="stat-label">Average Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {attempts.filter(a => a.isPassed).length}
                </span>
                <span className="stat-label">Passed Attempts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {Math.round(attempts.reduce((sum, a) => sum + a.timeTaken, 0) / attempts.length)}
                </span>
                <span className="stat-label">Avg Time (min)</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Quizzes
        </button>
        
        {quiz?.allowRetake && (
          <button onClick={handleRetakeQuiz} className="retake-btn">
            🔄 Retake Quiz
          </button>
        )}
        
        <button 
          onClick={() => navigate('/class')}
          className="home-btn"
        >
          🏠 Home
        </button>
      </div>
    </div>
  );
}