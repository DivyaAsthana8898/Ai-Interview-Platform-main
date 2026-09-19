const Interview = require("../models/Interview");

const {
  evaluateAnswer,
  generateCareerInsights,
  generateInterviewQuestions,
} = require("../services/aiService");
// Start Interview
const startInterview = async (req, res) => {
  try {
    const {
      interviewType,
      difficulty,
      numberOfQuestions,
    } = req.body;

    // Validate input
    if (
      !interviewType ||
      !difficulty ||
      !numberOfQuestions
    ) {
      return res.status(400).json({
        message:
          "Interview type, difficulty and number of questions are required.",
      });
    }

    const questionCount =
      Number(numberOfQuestions);

    // Validate question count
    if (![5, 10, 15].includes(questionCount)) {
      return res.status(400).json({
        message:
          "Number of questions must be 5, 10, or 15.",
      });
    }

    // Validate interview type
    const allowedTypes = [
      "Technical",
      "HR",
      "Mixed",
    ];

    if (!allowedTypes.includes(interviewType)) {
      return res.status(400).json({
        message: "Invalid interview type.",
      });
    }

    // Validate difficulty
    const allowedDifficulty = [
      "Easy",
      "Medium",
      "Hard",
    ];

    if (
      !allowedDifficulty.includes(difficulty)
    ) {
      return res.status(400).json({
        message: "Invalid difficulty.",
      });
    }

    // Get candidate
    const user = req.user;

    console.log(
      "Generating AI interview for:",
      user.name
    );

    console.log("Skills:", user.skills);

    console.log(
      "Target Role:",
      user.targetRole
    );

    // Generate questions using Groq
    const generatedQuestions =
      await generateInterviewQuestions({
        user,
        interviewType,
        difficulty,
        numberOfQuestions:
          questionCount,
      });

    // Convert AI questions to MongoDB format
    const questions =
      generatedQuestions.map((item) => ({
        question: item.question,
        answer: "",
        score: 0,
        feedback: "",
        strengths: [],
        improvements: [],
      }));

    // Create interview
    const interview =
      await Interview.create({
        user: user._id,

        interviewType,

        difficulty,

        numberOfQuestions:
          questionCount,

        questions,

        status: "in-progress",
      });

    res.status(201).json({
      message:
        "AI interview created successfully",

      interview,
    });

  } catch (error) {
    console.log(
      "Start Interview Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate interview",

      error: error.message,
    });
  }
};

// Get Interview By ID
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(
      req.params.id
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    // Make sure the interview belongs to logged-in user
    if (
      interview.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to access this interview",
      });
    }

    res.status(200).json({
      message: "Interview fetched successfully",
      interview,
    });

  } catch (error) {
    console.log("Get Interview Error:", error);

    res.status(500).json({
      message: "Failed to fetch interview",
      error: error.message,
    });
  }
};

const getInterviewResult = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    // Check ownership
    if (
      interview.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    res.status(200).json({
      message: "Interview result fetched successfully",
      interview,
    });

  } catch (error) {
    console.log("Result Error:", error);

    res.status(500).json({
      message: "Failed to fetch interview result",
      error: error.message,
    });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;

    const interview = await Interview.findById(
      req.params.id
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (
      interview.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const questionIndex = req.body.questionIndex;

    if (
      questionIndex < 0 ||
      questionIndex >= interview.questions.length
    ) {
      return res.status(400).json({
        message: "Invalid question index",
      });
    }

    const question =
      interview.questions[questionIndex];

    question.answer = answer;

    // AI evaluation
    const evaluation = await evaluateAnswer({
      question: question.question,
      answer: answer,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
    });

    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.strengths = evaluation.strengths;
    question.improvements = evaluation.improvements;

    // If this was the final question
    if (
      questionIndex ===
      interview.questions.length - 1
    ) {
      interview.status = "completed";
    }

    await interview.save();

    res.status(200).json({
      message: "Answer submitted successfully",
      question,
      status: interview.status,
    });

  } catch (error) {
    console.log("Submit Answer Error:", error);

    res.status(500).json({
      message: "Failed to submit answer",
      error: error.message,
    });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Interview history fetched successfully",
      interviews,
    });
  } catch (error) {
    console.log("Interview History Error:", error);

    res.status(500).json({
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
};

/* =========================
   Save Answer
========================= */

const saveAnswer = async (req, res) => {
  try {
    const { answer, questionIndex } = req.body;

    const interview = await Interview.findById(
      req.params.id
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (
      interview.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (
      questionIndex < 0 ||
      questionIndex >= interview.questions.length
    ) {
      return res.status(400).json({
        message: "Invalid question index",
      });
    }

    interview.questions[questionIndex].answer =
      answer || "";

    await interview.save();

    res.status(200).json({
      message: "Answer saved successfully",
      question:
        interview.questions[questionIndex],
    });
  } catch (error) {
    console.log(
      "Save Answer Error:",
      error
    );

    res.status(500).json({
      message: "Failed to save answer",
      error: error.message,
    });
  }
};

const getCareerInsights = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
      status: "completed",
    }).sort({
      createdAt: -1,
    });

    if (interviews.length === 0) {
      return res.status(400).json({
        message:
          "Complete at least one interview to generate career insights.",
      });
    }

    const insights = await generateCareerInsights({
      interviews,
      user: req.user,
    });

    res.status(200).json({
      message: "Career insights generated successfully",
      insights,
    });
  } catch (error) {
    console.log("Career Insights Error:", error);

    res.status(500).json({
      message: "Failed to generate career insights",
      error: error.message,
    });
  }
};

// IMPORTANT: exports MUST be at the bottom
module.exports = {
  startInterview,
  getInterviewById,
  submitAnswer,
  saveAnswer,
  getInterviewHistory,
  getCareerInsights,
};