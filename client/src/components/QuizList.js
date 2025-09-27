// client/src/components/QuizList.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizList.css';

export default function QuizList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedClass, subject } = location.state || {};
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedClass || !subject) {
      navigate('/class');
      return;
    }

    fetchQuizzes();
  }, [selectedClass, subject, navigate]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quiz?stdClass=${selectedClass}&subject=${subject}`);
      const data = await response.json();

      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Fetch quizzes error:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate('/quiz/take', { state: { quizId, selectedClass, subject } });
  };

  const handleViewResults = (quizId) => {
    navigate('/quiz/results', { state: { quizId, selectedClass, subject } });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="quiz-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-header">
        <h2>📝 {subject} Quizzes - Class {selectedClass}</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {quizzes.length === 0 && !error ? (
        <div className="no-quizzes">
          <div className="no-content-icon">📝</div>
          <h3>No Quizzes Available</h3>
          <p>Your teacher hasn't created any quizzes for {subject} yet.</p>
          <p>Check back later or ask your teacher to add some quizzes!</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-header">
                <h3 className="quiz-title">{quiz.title}</h3>
                <div className="quiz-badge">
                  {quiz.questions.length} Question{quiz.questions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {quiz.description && (
                <p className="quiz-description">{quiz.description}</p>
              )}

              <div className="quiz-details">
                <div className="quiz-detail">
                  <span className="detail-icon">⏱️</span>
                  <span>Time Limit: {formatDuration(quiz.timeLimit)}</span>
                </div>
                
                <div className="quiz-detail">
                  <span className="detail-icon">🎯</span>
                  <span>Passing Score: {quiz.passingScore}%</span>
                </div>
                
                <div className="quiz-detail">
                  <span className="detail-icon">🏆</span>
                  <span>Total Marks: {quiz.totalMarks}</span>
                </div>

                {quiz.allowRetake && (
                  <div className="quiz-detail">
                    <span className="detail-icon">🔄</span>
                    <span>Retakes Allowed</span>
                  </div>
                )}
              </div>

              <div className="quiz-meta">
                <span className="created-by">Created by {quiz.creator}</span>
                <span className="created-date">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="quiz-actions">
                <button 
                  className="start-quiz-btn"
                  onClick={() => handleStartQuiz(quiz._id)}
                >
                  ▶️ Start Quiz
                </button>
                
                <button 
                  className="view-results-btn"
                  onClick={() => handleViewResults(quiz._id)}
                >
                  📊 View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}