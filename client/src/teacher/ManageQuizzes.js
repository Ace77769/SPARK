// client/src/teacher/ManageQuizzes.js
import React, { useState, useEffect } from 'react';
import TeacherNav from './TeacherNav';
import './ManageQuizzes.css';

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showAttempts, setShowAttempts] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // Add includeInactive=true to fetch all quizzes (both active and inactive)
      console.log('Fetching quizzes with includeInactive=true...');
      const response = await fetch('/api/quiz?includeInactive=true');
      const data = await response.json();

      console.log('Received quizzes:', data.quizzes?.length, 'quizzes');
      console.log('Active:', data.quizzes?.filter(q => q.isActive).length);
      console.log('Inactive:', data.quizzes?.filter(q => !q.isActive).length);

      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        console.error('Failed to fetch quizzes:', data.message);
      }
    } catch (error) {
      console.error('Fetch quizzes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async (quizId) => {
    try {
      setAttemptsLoading(true);
      const response = await fetch(`/api/quiz/${quizId}/attempts`);
      const data = await response.json();
      
      if (data.success) {
        setAttempts(data.attempts);
        setShowAttempts(true);
      } else {
        console.error('Failed to fetch attempts:', data.message);
        alert('Failed to load quiz attempts');
      }
    } catch (error) {
      console.error('Fetch attempts error:', error);
      alert('Error loading quiz attempts');
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${quizTitle}"?\n\nThis will permanently delete:\n- The quiz and all its questions\n- All student attempts and scores\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuizzes(prev => prev.filter(quiz => quiz._id !== quizId));
        alert('✅ Quiz deleted successfully');
        
        // Close modals if this quiz was selected
        if (selectedQuiz?._id === quizId) {
          setSelectedQuiz(null);
        }
        if (showAttempts) {
          setShowAttempts(false);
        }
      } else {
        alert(`❌ Failed to delete quiz: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete quiz error:', error);
      alert('❌ Error deleting quiz. Please try again.');
    }
  };

  const toggleQuizStatus = async (quizId, currentStatus) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the quiz in the local state
        setQuizzes(prev => prev.map(quiz => 
          quiz._id === quizId ? { ...quiz, isActive: !currentStatus } : quiz
        ));
        
        // Update selected quiz if it's the one being toggled
        if (selectedQuiz?._id === quizId) {
          setSelectedQuiz(prev => ({ ...prev, isActive: !currentStatus }));
        }

        // Show success message
        const newStatus = !currentStatus;
        alert(`✅ Quiz ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        
      } else {
        alert(`Failed to update quiz status: ${data.message}`);
      }
    } catch (error) {
      console.error('Update quiz error:', error);
      alert('Error updating quiz status');
    }
  };

  const getFilteredQuizzes = () => {
    // First, filter by status (all, active, inactive)
    let filtered = quizzes;

    // Apply status filter
    if (filter === 'active') {
      filtered = quizzes.filter(q => q.isActive);
    } else if (filter === 'inactive') {
      filtered = quizzes.filter(q => !q.isActive);
    } else if (filter === 'all') {
      filtered = quizzes; // Show all quizzes regardless of status
    } else if (subjects.includes(filter)) {
      // If filter is a subject name, filter by that subject but show all statuses
      filtered = quizzes.filter(q => q.subject === filter);
    }

    return filtered;
  };

  const getQuizStats = (quizId) => {
    const quizAttempts = attempts.filter(a => a.quizId._id === quizId || a.quizId === quizId);
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter(a => a.isPassed).length;
    const avgScore = quizAttempts.length > 0 
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
      : 0;
    
    return { totalAttempts, passedAttempts, avgScore };
  };

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Marathi', 'Computer', 'EVS', 'Sanskrit'];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <TeacherNav />
        <div className="manage-quizzes-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingBottom: '40px'
    }}>
      <TeacherNav />
      <div className="manage-quizzes-container">
        <div className="page-header">
          <h2>📝 Manage Quizzes</h2>
          <div className="quiz-summary">
            <span className="total-count">Total: {quizzes.length}</span>
            <span className="active-count">Active: {quizzes.filter(q => q.isActive).length}</span>
            <span className="inactive-count">Inactive: {quizzes.filter(q => !q.isActive).length}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              📊 All Quizzes
            </button>
            <button 
              className={filter === 'active' ? 'active' : ''}
              onClick={() => setFilter('active')}
            >
              🟢 Active ({quizzes.filter(q => q.isActive).length})
            </button>
            <button 
              className={filter === 'inactive' ? 'active' : ''}
              onClick={() => setFilter('inactive')}
            >
              🔴 Inactive ({quizzes.filter(q => !q.isActive).length})
            </button>
          </div>
          
          <select 
            value={subjects.includes(filter) ? filter : 'all'}
            onChange={(e) => setFilter(e.target.value)}
            className="subject-filter"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject} ({quizzes.filter(q => q.subject === subject).length})
              </option>
            ))}
          </select>
        </div>

        {/* Quizzes List */}
        <div className="quizzes-grid">
          {getFilteredQuizzes().length === 0 ? (
            <div className="no-quizzes">
              <div className="no-content-icon">📝</div>
              <h3>No Quizzes Found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't created any quizzes yet. Click 'Create Quiz' to get started!"
                  : filter === 'active'
                  ? "No active quizzes found. Activate some quizzes or create new ones!"
                  : filter === 'inactive'
                  ? "No inactive quizzes found. All your quizzes are currently active!"
                  : `No quizzes found for ${filter}. Try creating a quiz for this subject!`
                }
              </p>
            </div>
          ) : (
            getFilteredQuizzes().map(quiz => (
              <div key={quiz._id} className={`quiz-card ${!quiz.isActive ? 'inactive' : ''}`}>
                <div className="quiz-header">
                  <div className="quiz-title-section">
                    <h3 className="quiz-title">{quiz.title}</h3>
                    <div className="quiz-status">
                      {quiz.isActive ? (
                        <span className="status-badge active">🟢 Active</span>
                      ) : (
                        <span className="status-badge inactive">🔴 Inactive</span>
                      )}
                    </div>
                  </div>
                </div>

                {quiz.description && (
                  <p className="quiz-description">{quiz.description}</p>
                )}

                <div className="quiz-meta">
                  <div className="meta-row">
                    <span>📚 {quiz.subject}</span>
                    <span>🎓 Class {quiz.stdClass}</span>
                  </div>
                  <div className="meta-row">
                    <span>❓ {quiz.questions.length} Questions</span>
                    <span>⏱️ {quiz.timeLimit} min</span>
                  </div>
                  <div className="meta-row">
                    <span>🎯 Pass: {quiz.passingScore}%</span>
                    <span>🔄 Retakes: {quiz.allowRetake ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="quiz-date">
                  <small>Created: {new Date(quiz.createdAt).toLocaleDateString()}</small>
                </div>

                <div className="quiz-actions">
                  <button 
                    className="view-attempts-btn"
                    onClick={() => fetchQuizAttempts(quiz._id)}
                    disabled={attemptsLoading}
                  >
                    {attemptsLoading ? '⏳' : '📊'} View Attempts
                  </button>
                  
                  <button 
                    className="edit-btn"
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    ✏️ Details
                  </button>
                  
                  <button 
                    className={`toggle-btn ${quiz.isActive ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleQuizStatus(quiz._id, quiz.isActive)}
                  >
                    {quiz.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                  </button>
                  
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quiz Attempts Modal */}
        {showAttempts && (
          <div className="modal-overlay" onClick={() => setShowAttempts(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📊 Quiz Attempts</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAttempts(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="attempts-content">
                {attempts.length === 0 ? (
                  <div className="no-attempts">
                    <p>No students have attempted this quiz yet.</p>
                    <p>Share the quiz with your students to see their attempts here.</p>
                  </div>
                ) : (
                  <>
                    <div className="attempts-summary">
                      <div className="summary-stat">
                        <span className="stat-number">{attempts.length}</span>
                        <span className="stat-label">Total Attempts</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-number">
                          {attempts.filter(a => a.isPassed).length}
                        </span>
                        <span className="stat-label">Passed</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-number">
                          {attempts.length > 0 
                            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
                            : 0}%
                        </span>
                        <span className="stat-label">Avg Score</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-number">
                          {new Set(attempts.map(a => a.studentUsername)).size}
                        </span>
                        <span className="stat-label">Students</span>
                      </div>
                    </div>

                    <div className="attempts-list">
                      {attempts.map(attempt => (
                        <div key={attempt._id} className="attempt-item">
                          <div className="attempt-info">
                            <div className="student-name">
                              👤 {attempt.studentUsername}
                            </div>
                            <div className="attempt-score">
                              <span className={`score ${attempt.isPassed ? 'passed' : 'failed'}`}>
                                {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                              </span>
                              <span className={`status ${attempt.isPassed ? 'passed' : 'failed'}`}>
                                {attempt.isPassed ? '✅ Passed' : '❌ Failed'}
                              </span>
                            </div>
                            <div className="attempt-details">
                              <span>⏱️ {attempt.timeTaken} min</span>
                              <span>{new Date(attempt.submittedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Details Modal */}
        {selectedQuiz && (
          <div className="modal-overlay" onClick={() => setSelectedQuiz(null)}>
            <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Quiz Details</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedQuiz(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="edit-content">
                <div className="quiz-info">
                  <h4>{selectedQuiz.title}</h4>
                  {selectedQuiz.description && <p>{selectedQuiz.description}</p>}
                  
                  <div className="quiz-details">
                    <div className="detail-row">
                      <strong>Subject:</strong> <span>{selectedQuiz.subject}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Class:</strong> <span>{selectedQuiz.stdClass}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Questions:</strong> <span>{selectedQuiz.questions.length}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Time Limit:</strong> <span>{selectedQuiz.timeLimit} minutes</span>
                    </div>
                    <div className="detail-row">
                      <strong>Passing Score:</strong> <span>{selectedQuiz.passingScore}%</span>
                    </div>
                    <div className="detail-row">
                      <strong>Allow Retakes:</strong> <span>{selectedQuiz.allowRetake ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Show Answers:</strong> <span>{selectedQuiz.showCorrectAnswers ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Status:</strong> 
                      <span className={selectedQuiz.isActive ? 'active-text' : 'inactive-text'}>
                        {selectedQuiz.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="questions-preview">
                  <h4>Questions Preview ({selectedQuiz.questions.length}):</h4>
                  <div className="questions-list">
                    {selectedQuiz.questions.map((question, index) => (
                      <div key={index} className="question-preview">
                        <div className="question-number">Q{index + 1}</div>
                        <div className="question-text">{question.question}</div>
                        <div className="options-preview">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className="option-preview"
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="question-explanation">
                            <strong>💡 Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="edit-actions">
                  <button 
                    className="toggle-status-btn"
                    onClick={() => {
                      toggleQuizStatus(selectedQuiz._id, selectedQuiz.isActive);
                    }}
                  >
                    {selectedQuiz.isActive ? '🔴 Deactivate Quiz' : '🟢 Activate Quiz'}
                  </button>
                  
                  <button 
                    className="view-attempts-modal-btn"
                    onClick={() => {
                      setSelectedQuiz(null);
                      fetchQuizAttempts(selectedQuiz._id);
                    }}
                  >
                    📊 View Attempts
                  </button>
                  
                  <button 
                    className="close-modal-btn"
                    onClick={() => setSelectedQuiz(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}