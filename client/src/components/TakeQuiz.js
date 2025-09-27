// client/src/components/TakeQuiz.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TakeQuiz.css';

export default function TakeQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = location.state || {};
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());

  // Get current user
  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.username || 'student';
    } catch {
      return 'student';
    }
  };

  // Fetch quiz data
  useEffect(() => {
    if (!quizId) {
      navigate('/class');
      return;
    }

    fetchQuiz();
  }, [quizId, navigate]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quiz/${quizId}/take`);
      const data = await response.json();

      if (data.success) {
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.timeLimit * 60); // Convert minutes to seconds
      } else {
        setError(data.message || 'Failed to load quiz');
      }
    } catch (err) {
      console.error('Fetch quiz error:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navigate between questions
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = useCallback(async () => {
    if (submitting) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit your quiz? You cannot change your answers after submission.'
    );
    
    if (!confirmSubmit && timeLeft > 0) return;

    setSubmitting(true);

    try {
      const timeTakenMinutes = Math.round((Date.now() - startTime) / 60000);
      const formattedAnswers = quiz.questions.map(question => ({
        questionId: question._id,
        selectedAnswer: answers[question._id] ?? -1, // -1 for unanswered
        timeTaken: 0 // Could track per-question timing if needed
      }));

      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentUsername: getCurrentUser(),
          answers: formattedAnswers,
          timeTaken: timeTakenMinutes
        })
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to results page with quiz result data
        navigate('/quiz/result', { 
          state: { 
            result: data.result,
            quiz: quiz,
            answers: answers,
            selectedClass: quiz.stdClass,
            subject: quiz.subject
          } 
        });
      } else {
        setError(data.message || 'Failed to submit quiz');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
  }, [quizId, quiz, answers, submitting, startTime, timeLeft, navigate]);

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quiz-container">
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
        </div>
        
        <div className="quiz-stats">
          <div className="stat-item">
            <span className="stat-icon">⏰</span>
            <span className={`timer ${timeLeft <= 300 ? 'warning' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span>{answeredCount} answered</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{Math.round(progress)}% Complete</span>
      </div>

      {/* Question Navigation */}
      <div className="question-nav">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            className={`question-nav-btn ${
              index === currentQuestion ? 'active' : ''
            } ${answers[quiz.questions[index]._id] !== undefined ? 'answered' : ''}`}
            onClick={() => goToQuestion(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      <div className="question-container">
        <div className="question-header">
          <h2>Question {currentQuestion + 1}</h2>
        </div>
        
        <div className="question-text">
          {currentQ.question}
        </div>

        <div className="options-container">
          {currentQ.options.map((option, index) => (
            <label
              key={index}
              className={`option-label ${
                answers[currentQ._id] === index ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQ._id}`}
                value={index}
                checked={answers[currentQ._id] === index}
                onChange={() => handleAnswerSelect(currentQ._id, index)}
              />
              <span className="option-indicator">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="quiz-controls">
        <div className="nav-buttons">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={currentQuestion === quiz.questions.length - 1}
            className="nav-btn next-btn"
          >
            Next →
          </button>
        </div>

        <button
          onClick={handleSubmitQuiz}
          disabled={submitting}
          className="submit-quiz-btn"
        >
          {submitting ? (
            <>
              <div className="spinner small"></div>
              Submitting...
            </>
          ) : (
            'Submit Quiz'
          )}
        </button>
      </div>

      {/* Submit Warning */}
      {answeredCount < quiz.questions.length && (
        <div className="warning-message">
          ⚠️ You have {quiz.questions.length - answeredCount} unanswered question(s).
          You can still submit, but unanswered questions will be marked as incorrect.
        </div>
      )}
    </div>
  );
}