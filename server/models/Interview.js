const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  answer: {
    type: String,
    default: "",
  },

  score: {
    type: Number,
    default: 0,
  },

  feedback: {
    type: String,
    default: "",
  },

  strengths: {
    type: [String],
    default: [],
  },

  improvements: {
    type: [String],
    default: [],
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewType: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      required: true,
    },

    numberOfQuestions: {
      type: Number,
      required: true,
    },

    questions: [questionSchema],

    status: {
      type: String,
      default: "in-progress",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Interview",
  interviewSchema
);