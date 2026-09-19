const express = require("express");
const router = express.Router();

const {
  startInterview,
  getInterviewById,
  submitAnswer,
  saveAnswer,
  getInterviewHistory,
  getCareerInsights,
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

router.post("/start", protect, startInterview);

router.get("/history", protect, getInterviewHistory);

router.get("/career-insights", protect, getCareerInsights);

router.get("/:id", protect, getInterviewById);

router.put("/:id/save-answer", protect, saveAnswer);

router.put("/:id/answer", protect, submitAnswer);

module.exports = router;
