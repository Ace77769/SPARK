// client/src/teacher/CreateQuiz.js
import React, { useState } from "react";
import TeacherNav from "./TeacherNav";
import "./CreateQuiz.css";

export default function CreateQuiz() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "Mathematics",
    stdClass: "1",
    timeLimit: 30,
    allowRetake: false,
    showCorrectAnswers: true,
    passingScore: 60
  });

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const subjects = [
    "Mathematics", "Science", "English", "Social Studies", 
    "Hindi", "Marathi", "Computer", "EVS", "Sanskrit"
  ];

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'options') {
      updatedQuestions[currentQuestion].options = value;
    } else {
      updatedQuestions[currentQuestion][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }]);
    setCurrentQuestion(questions.length);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      setMessage("❌ Quiz must have at least one question");
      return;
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    
    if (currentQuestion >= updatedQuestions.length) {
      setCurrentQuestion(updatedQuestions.length - 1);
    }
  };

  const validateQuiz = () => {
    if (!formData.title.trim()) {
      return "Quiz title is required";
    }
    
    if (questions.length === 0) {
      return "Quiz must have at least one question";
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        return `Question ${i + 1} text is required`;
      }
      
      const filledOptions = q.options.filter(opt => opt.trim()).length;
      if (filledOptions < 2) {
        return `Question ${i + 1} must have at least 2 options`;
      }
      
      if (!q.options[q.correctAnswer] || !q.options[q.correctAnswer].trim()) {
        return `Question ${i + 1} has an invalid correct answer selection`;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateQuiz();
    if (validationError) {
      setMessage(`❌ ${validationError}`);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/quiz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions: questions.map(q => ({
            ...q,
            options: q.options.filter(opt => opt.trim()) // Remove empty options
          })),
          creator: 'teacher' // In real app, get from auth context
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Quiz "${formData.title}" created successfully!`);
        // Reset form
        setFormData({
          title: "",
          description: "",
          subject: "Mathematics",
          stdClass: "1",
          timeLimit: 30,
          allowRetake: false,
          showCorrectAnswers: true,
          passingScore: 60
        });
        setQuestions([{
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: ""
        }]);
        setCurrentQuestion(0);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Create quiz error:', error);
      setMessage("❌ Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TeacherNav />
      <div className="create-quiz-container">
        <h2>📝 Create New Quiz</h2>
        
        <form onSubmit={handleSubmit} className="quiz-form">
          {/* Quiz Basic Info */}
          <div className="form-section">
            <h3>📋 Quiz Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Quiz Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Time Limit (minutes)</label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => handleFormChange('timeLimit', parseInt(e.target.value))}
                  min="5"
                  max="180"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Class *</label>
                <select
                  value={formData.stdClass}
                  onChange={(e) => handleFormChange('stdClass', e.target.value)}
                >
                  {[1,2,3,4,5,6,7,8].map(c => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Enter quiz description..."
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Passing Score (%)</label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => handleFormChange('passingScore', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.allowRetake}
                  onChange={(e) => handleFormChange('allowRetake', e.target.checked)}
                />
                <span>Allow students to retake this quiz</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.showCorrectAnswers}
                  onChange={(e) => handleFormChange('showCorrectAnswers', e.target.checked)}
                />
                <span>Show correct answers after completion</span>
              </label>
            </div>
          </div>

          {/* Question Management */}
          <div className="form-section">
            <div className="questions-header">
              <h3>❓ Questions ({questions.length})</h3>
              <button type="button" onClick={addQuestion} className="add-question-btn">
                ➕ Add Question
              </button>
            </div>

            {/* Question Navigation */}
            <div className="question-nav">
              {questions.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`question-nav-btn ${currentQuestion === index ? 'active' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>

            {/* Current Question Editor */}
            <div className="question-editor">
              <div className="question-header">
                <h4>Question {currentQuestion + 1}</h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(currentQuestion)}
                    className="delete-question-btn"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={questions[currentQuestion].question}
                  onChange={(e) => handleQuestionChange('question', e.target.value)}
                  placeholder="Enter your question..."
                  rows="3"
                  required
                />
              </div>

              <div className="options-grid">
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="option-group">
                    <label>Option {String.fromCharCode(65 + index)}</label>
                    <div className="option-input-group">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                      />
                      <input
                        type="radio"
                        name={`correct-${currentQuestion}`}
                        checked={questions[currentQuestion].correctAnswer === index}
                        onChange={() => handleQuestionChange('correctAnswer', index)}
                        title="Mark as correct answer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Explanation (Optional)</label>
                <textarea
                  value={questions[currentQuestion].explanation}
                  onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Quiz...
                </>
              ) : (
                "📝 Create Quiz"
              )}
            </button>
          </div>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}