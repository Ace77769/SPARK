// server/models/QuizAttempt.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedAnswer: { type: Number, required: true }, // Index of selected option
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number }, // Time taken for this question in seconds
});

const QuizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentUsername: { type: String, required: true },
  answers: [AnswerSchema],
  score: { type: Number, required: true }, // Number of correct answers
  percentage: { type: Number, required: true }, // Percentage score
  totalQuestions: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // Total time taken in minutes
  status: { 
    type: String, 
    enum: ['completed', 'in-progress', 'abandoned'], 
    default: 'completed' 
  },
  isPassed: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);