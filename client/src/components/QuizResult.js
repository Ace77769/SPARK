// client/src/components/QuizResult.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizResult.css';

export default function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz, answers, quizId, selectedClass, subject } = location.state || {};

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!result || !quiz) {
      console.error('Missing result or quiz data');
    }
  }, [result, quiz]);

  if (!result || !quiz) {
    return (
      <div className="quiz-result-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>Quiz result data is missing. Please try taking the quiz again.</p>
          <button onClick={() => navigate('/class')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  return (
    <div className="quiz-result-container">
      {/* Score Card */}
      <div className="score-card">
        <div className="score-header">
          <h1>{result.isPassed ? '🎉 Congratulations!' : '📝 Quiz Completed'}</h1>
          <p className="quiz-title">{quiz.title}</p>
        </div>

        <div className="score-display">
          <div
            className="score-circle"
            style={{ borderColor: getScoreColor(result.percentage) }}
          >
            <span
              className="percentage"
              style={{ color: getScoreColor(result.percentage) }}
            >
              {result.percentage}%
            </span>
            <span className="fraction">
              {result.score}/{result.totalQuestions}
            </span>
          </div>

          <div className="score-details">
            <div className={`status ${result.isPassed ? 'passed' : 'failed'}`}>
              {result.isPassed ? '✅ Passed' : '❌ Failed'}
            </div>
            <div className="time-taken">
              ⏱️ Time Taken: {result.timeTaken} minutes
            </div>
          </div>
        </div>

        <div className="score-stats">
          <div className="stat">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{result.score}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat">
            <span className="stat-icon">❌</span>
            <span className="stat-value">{result.totalQuestions - result.score}</span>
            <span className="stat-label">Incorrect</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🎯</span>
            <span className="stat-value">{quiz.passingScore}%</span>
            <span className="stat-label">Passing Score</span>
          </div>
        </div>
      </div>

      {/* Detailed Answers Section */}
      {result.detailedAnswers && (
        <div className="detailed-answers-section">
          <div className="section-header">
            <h2>📋 Detailed Results</h2>
            <button
              className="toggle-details-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '▼ Hide Details' : '▶ Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className="questions-review">
              {result.detailedAnswers.map((item, index) => (
                <div
                  key={item.questionId}
                  className={`question-review-card ${item.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-review-header">
                    <div className="question-number">
                      Question {index + 1}
                      {item.isCorrect ? (
                        <span className="result-badge correct">✓ Correct</span>
                      ) : (
                        <span className="result-badge incorrect">✗ Incorrect</span>
                      )}
                    </div>
                  </div>

                  <div className="question-text">{item.question}</div>

                  <div className="options-review">
                    {item.options.map((option, optIndex) => {
                      const isUserAnswer = item.userAnswer === optIndex;
                      const isCorrectAnswer = item.correctAnswer === optIndex;

                      let optionClass = 'option-review';
                      if (isCorrectAnswer) {
                        optionClass += ' correct-answer';
                      }
                      if (isUserAnswer && !isCorrectAnswer) {
                        optionClass += ' wrong-answer';
                      }
                      if (isUserAnswer && isCorrectAnswer) {
                        optionClass += ' user-correct';
                      }

                      return (
                        <div key={optIndex} className={optionClass}>
                          <span className="option-indicator">
                            {getOptionLabel(optIndex)}
                          </span>
                          <span className="option-text">{option}</span>
                          {isCorrectAnswer && (
                            <span className="answer-label">✓ Correct Answer</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="answer-label">Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="explanation">
                      <strong>💡 Explanation:</strong> {item.explanation}
                    </div>
                  )}

                  {item.userAnswer === -1 && (
                    <div className="not-answered">
                      ⚠️ You did not answer this question
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={() => navigate('/class')}
          className="btn-secondary"
        >
          🏠 Home
        </button>

        {quiz.allowRetake && (
          <button
            onClick={() => navigate('/quiz/take', {
              state: { quizId, selectedClass, subject }
            })}
            className="btn-primary"
          >
            🔄 Retake Quiz
          </button>
        )}

        <button
          onClick={() => navigate('/quiz/results', {
            state: { quizId, selectedClass, subject }
          })}
          className="btn-secondary"
        >
          📊 View All Results
        </button>

        <button
          onClick={() => navigate('/quiz/list', {
            state: { selectedClass, subject }
          })}
          className="btn-secondary"
        >
          📝 Back to Quizzes
        </button>
      </div>
    </div>
  );
}