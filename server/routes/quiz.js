// server/routes/quiz.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Create a new quiz (Teachers only)
router.post('/create', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      subject, 
      stdClass, 
      questions, 
      timeLimit, 
      allowRetake, 
      showCorrectAnswers, 
      passingScore 
    } = req.body;

    if (!title || !subject || !stdClass || !questions || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields or no questions provided' 
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length !== 4 || 
          typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({ 
          success: false, 
          message: `Question ${i + 1} is invalid. Each question must have 4 options and a valid correct answer (0-3).` 
        });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      subject,
      stdClass,
      creator: req.body.creator || 'teacher', // In a real app, get from JWT
      questions,
      timeLimit: timeLimit || 30,
      allowRetake: allowRetake || false,
      showCorrectAnswers: showCorrectAnswers !== false,
      passingScore: passingScore || 60
    });

    await quiz.save();
    res.json({ success: true, message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
  }
});

// Get all quizzes (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { stdClass, subject, creator, includeInactive } = req.query;
    const filter = {};

    // Only filter by isActive if not explicitly requesting inactive quizzes
    // This allows teachers to see all quizzes in manage section
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }


    if (stdClass) filter.stdClass = stdClass;
    if (subject) filter.subject = subject;
    if (creator) filter.creator = creator;

    const quizzes = await Quiz.find(filter)
      .select('-questions.correctAnswer -questions.explanation') // Hide answers from students
      .sort({ createdAt: -1 });


    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// Get quiz for taking (students) - without correct answers
router.get('/:id/take', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer -questions.explanation');
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ success: false, message: 'Quiz not found or inactive' });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Get quiz for taking error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// Submit quiz attempt
router.post('/:id/submit', async (req, res) => {
  try {
    const { studentUsername, answers, timeTaken } = req.body;
    
    if (!studentUsername || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ success: false, message: 'Quiz not found or inactive' });
    }

    // Check if retakes are allowed
    if (!quiz.allowRetake) {
      const existingAttempt = await QuizAttempt.findOne({
        quizId: req.params.id,
        studentUsername,
        status: 'completed'
      });
      
      if (existingAttempt) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already attempted this quiz. Retakes are not allowed.' 
        });
      }
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = quiz.questions.id(answer.questionId);
      
      if (!question) {
        return res.status(400).json({ 
          success: false, 
          message: `Question with ID ${answer.questionId} not found` 
        });
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;

      processedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeTaken: answer.timeTaken || 0
      });
    }

    const percentage = (correctAnswers / quiz.questions.length) * 100;
    const isPassed = percentage >= quiz.passingScore;

    const attempt = new QuizAttempt({
      quizId: req.params.id,
      studentUsername,
      answers: processedAnswers,
      score: correctAnswers,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      totalQuestions: quiz.questions.length,
      timeTaken: timeTaken || 0,
      isPassed,
      status: 'completed'
    });

    await attempt.save();

    // Prepare response with detailed question results
    const response = {
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        score: correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage: attempt.percentage,
        isPassed,
        timeTaken: attempt.timeTaken,
        attemptId: attempt._id
      }
    };

    // Include detailed answers if allowed
    if (quiz.showCorrectAnswers) {
      response.result.detailedAnswers = quiz.questions.map((q, index) => {
        const userAnswer = processedAnswers.find(a => a.questionId.toString() === q._id.toString());
        return {
          questionId: q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
          explanation: q.explanation
        };
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
});

// Get quiz attempts for a student
router.get('/attempts/:studentUsername', async (req, res) => {
  try {
    const { studentUsername } = req.params;
    const attempts = await QuizAttempt.find({ studentUsername })
      .populate('quizId', 'title subject stdClass totalMarks passingScore')
      .sort({ submittedAt: -1 });

    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
  }
});

// Get detailed attempt with answers
router.get('/attempt/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const quiz = attempt.quizId;

    // Build detailed results
    const detailedAnswers = quiz.questions.map((q) => {
      const userAnswer = attempt.answers.find(a => a.questionId.toString() === q._id.toString());
      return {
        questionId: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: quiz.showCorrectAnswers ? q.correctAnswer : undefined,
        userAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect: userAnswer ? userAnswer.isCorrect : false,
        explanation: quiz.showCorrectAnswers ? q.explanation : undefined
      };
    });

    res.json({
      success: true,
      attempt: {
        ...attempt.toObject(),
        detailedAnswers
      }
    });
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attempt details' });
  }
});

// Get all attempts for a quiz (Teachers)
router.get('/:id/attempts', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quizId: req.params.id })
      .populate('quizId', 'title')
      .sort({ submittedAt: -1 });

    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz attempts' });
  }
});

// Get quiz details for teachers (with answers)
router.get('/:id/manage', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Get quiz details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz details' });
  }
});

// Update quiz
router.put('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, message: 'Quiz updated successfully', quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  }
});

// Delete quiz
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quizId: req.params.id });

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
});

module.exports = router;