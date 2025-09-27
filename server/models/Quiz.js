// server/models/Quiz.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of 4 options
  correctAnswer: { type: Number, required: true }, // Index of correct option (0-3)
  explanation: { type: String }, // Optional explanation for the answer
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  stdClass: { type: String, required: true },
  creator: { type: String, required: true }, // Teacher username
  questions: [QuestionSchema],
  timeLimit: { type: Number, default: 30 }, // Time limit in minutes
  totalMarks: { type: Number, default: 0 }, // Auto-calculated
  isActive: { type: Boolean, default: true },
  allowRetake: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: true }, // Show answers after completion
  passingScore: { type: Number, default: 60 }, // Percentage needed to pass
}, { timestamps: true });

// Auto-calculate total marks before saving
QuizSchema.pre('save', function(next) {
  this.totalMarks = this.questions.length;
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);