import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./Interview.css";

function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [interview, setInterview] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [evaluation, setEvaluation] = useState(null);

  // 30 minutes = 1800 seconds
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Track questions visited by the user
  const [visitedQuestions, setVisitedQuestions] = useState([0]);

  /* =========================
     Fetch Interview
  ========================= */

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/interview/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setInterview(response.data.interview);
      } catch (err) {
        console.log("Fetch Interview Error:", err);

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to load interview."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, navigate, token]);

  /* =========================
     Set Current Answer
  ========================= */

  useEffect(() => {
    if (!interview) return;

    const current =
      interview.questions[currentQuestion];

    setAnswer(current?.answer || "");

    setEvaluation(null);

    setVisitedQuestions((previous) => {
      if (previous.includes(currentQuestion)) {
        return previous;
      }

      return [...previous, currentQuestion];
    });
  }, [currentQuestion, interview]);

  /* =========================
     Interview Timer
  ========================= */

  useEffect(() => {
    if (loading || !interview) return;

    if (timeLeft <= 0) {
      setError(
        "Interview time is over. Please submit your current answer."
      );

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, interview, timeLeft]);

  /* =========================
     Format Timer
  ========================= */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* =========================
     Timer Warning
  ========================= */

  const timerWarning = timeLeft <= 5 * 60;

  /* =========================
     Current Question
  ========================= */

  const current =
    interview?.questions?.[currentQuestion];

  /* =========================
     Progress
  ========================= */

  const totalQuestions =
    interview?.questions?.length || 0;

  const progress =
    totalQuestions > 0
      ? Math.round(
          ((currentQuestion + 1) / totalQuestions) * 100
        )
      : 0;

/* =========================
   Auto Save Current Answer
========================= */

const saveCurrentAnswer = async () => {
  if (!interview || !current) {
    return true;
  }

  try {
    await API.put(
      `/interview/${id}/save-answer`,
      {
        questionIndex: currentQuestion,
        answer: answer.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update local interview state
    setInterview((previous) => {
      if (!previous) return previous;

      const updatedQuestions = [
        ...previous.questions,
      ];

      updatedQuestions[currentQuestion] = {
        ...updatedQuestions[currentQuestion],
        answer: answer.trim(),
      };

      return {
        ...previous,
        questions: updatedQuestions,
      };
    });

    return true;
  } catch (err) {
    console.log(
      "Auto Save Answer Error:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Failed to save answer."
    );

    return false;
  }
};


/* =========================
   Previous Question
========================= */

const goToPreviousQuestion = async () => {
  if (
    currentQuestion <= 0 ||
    saving
  ) {
    return;
  }

  setSaving(true);
  setError("");

  const saved = await saveCurrentAnswer();

  if (!saved) {
    setSaving(false);
    return;
  }

  const previousQuestion =
    currentQuestion - 1;

  setCurrentQuestion(previousQuestion);

  setVisitedQuestions((previous) => {
    if (previous.includes(previousQuestion)) {
      return previous;
    }

    return [...previous, previousQuestion];
  });

  setSaving(false);
};


/* =========================
   Next Question
========================= */

const goToNextQuestion = async () => {
  if (!interview || saving) {
    return;
  }

  if (
    currentQuestion >=
    interview.questions.length - 1
  ) {
    return;
  }

  setSaving(true);
  setError("");

  const saved = await saveCurrentAnswer();

  if (!saved) {
    setSaving(false);
    return;
  }

  const nextQuestion =
    currentQuestion + 1;

  setCurrentQuestion(nextQuestion);

  setVisitedQuestions((previous) => {
    if (previous.includes(nextQuestion)) {
      return previous;
    }

    return [...previous, nextQuestion];
  });

  setSaving(false);
};


/* =========================
   Skip Question
========================= */

const skipQuestion = async () => {
  if (!interview || saving) {
    return;
  }

  if (
    currentQuestion >=
    interview.questions.length - 1
  ) {
    return;
  }

  setSaving(true);
  setError("");

  const saved = await saveCurrentAnswer();

  if (!saved) {
    setSaving(false);
    return;
  }

  const nextQuestion =
    currentQuestion + 1;

  setCurrentQuestion(nextQuestion);

  setVisitedQuestions((previous) => {
    if (previous.includes(nextQuestion)) {
      return previous;
    }

    return [...previous, nextQuestion];
  });

  setSaving(false);
};

  /* =========================
     Go To Specific Question
  ========================= */

const goToQuestion = async (index) => {
  if (
    index === currentQuestion ||
    saving
  ) {
    return;
  }

  setSaving(true);
  setError("");

  const saved = await saveCurrentAnswer();

  if (!saved) {
    setSaving(false);
    return;
  }

  setCurrentQuestion(index);

  setVisitedQuestions((previous) => {
    if (previous.includes(index)) {
      return previous;
    }

    return [...previous, index];
  });

  setSaving(false);
};

  /* =========================
     Submit Answer
  ========================= */

  const handleSubmitAnswer = async () => {
    if (!interview || !current) return;

    if (!answer.trim()) {
      setError(
        "Please write an answer before submitting."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setEvaluation(null);

      const response = await API.put(
        `/interview/${id}/answer`,
        {
          questionIndex: currentQuestion,
          answer: answer.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const evaluatedQuestion =
        response.data.question;

      setEvaluation(evaluatedQuestion);

      // Update local interview data
      setInterview((previous) => {
        if (!previous) return previous;

        const updatedQuestions = [
          ...previous.questions,
        ];

        updatedQuestions[currentQuestion] = {
          ...updatedQuestions[currentQuestion],
          answer: answer.trim(),
          score: evaluatedQuestion.score,
          feedback: evaluatedQuestion.feedback,
          strengths:
            evaluatedQuestion.strengths || [],
          improvements:
            evaluatedQuestion.improvements || [],
        };

        return {
          ...previous,
          questions: updatedQuestions,
        };
      });

      /*
        Wait a little so the user can see
        the AI evaluation.
      */

      setTimeout(() => {
        if (
          currentQuestion <
          interview.questions.length - 1
        ) {
          setCurrentQuestion(
            (previous) => previous + 1
          );
        } else {
          navigate(`/result/${id}`);
        }
      }, 1800);
    } catch (err) {
      console.log("Submit Answer Error:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to submit answer."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Exit Interview
  ========================= */

  const handleExitInterview = () => {
    const confirmed = window.confirm(
      "Are you sure you want to exit the interview?"
    );

    if (confirmed) {
      navigate("/dashboard");
    }
  };

  /* =========================
     Loading
  ========================= */

  if (loading) {
    return (
      <div className="interview-page">
        <div className="interview-loading">
          <div className="interview-spinner"></div>

          <h2>Loading Interview...</h2>

          <p>
            Preparing your personalized AI interview.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     Error
  ========================= */

  if (!interview) {
    return (
      <div className="interview-page">
        <div className="interview-error">
          <h2>Unable to Load Interview</h2>

          <p>
            {error || "Interview not found."}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">

      {/* =========================
          Header
      ========================= */}

      <div className="interview-header">

        <div>
          <p className="interview-eyebrow">
            AI INTERVIEW SESSION
          </p>

          <h1>Interview in Progress</h1>

          <p>
            Answer each question carefully and
            demonstrate your knowledge.
          </p>
        </div>

        <button
          className="exit-interview-btn"
          onClick={handleExitInterview}
          disabled={saving}
        >
          Exit Interview
        </button>

      </div>

      {/* =========================
          Timer
      ========================= */}

      <div
        className={`interview-timer-card ${
          timerWarning ? "timer-warning" : ""
        }`}
      >

        <div className="timer-label">
          <span>⏱️</span>
          <span>Time Remaining</span>
        </div>

        <strong>
          {formatTime(timeLeft)}
        </strong>

      </div>

      {/* =========================
          Progress
      ========================= */}

      <div className="interview-progress-card">

        <div className="interview-progress-header">

          <span>
            Question{" "}
            <strong>
              {currentQuestion + 1}
            </strong>{" "}
            of{" "}
            <strong>
              {totalQuestions}
            </strong>
          </span>

          <span className="interview-progress-percentage">
            {progress}%
          </span>

        </div>

        <div className="interview-progress-track">

          <div
            className="interview-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          ></div>

        </div>

      </div>

      {/* =========================
          Question Navigator
      ========================= */}

      <div className="question-navigator">

        <div className="navigator-title">

          <span>Questions</span>

          <span>
            {currentQuestion + 1} /{" "}
            {totalQuestions}
          </span>

        </div>

        <div className="question-buttons">

          {interview.questions.map(
            (question, index) => {

              const answered =
                question.answer &&
                question.answer.trim() !== "";

              return (
                <button
                  key={index}
                  className={`question-number-btn ${
                    currentQuestion === index
                      ? "active"
                      : ""
                  } ${
                    answered
                      ? "answered"
                      : ""
                  }`}
                  onClick={() =>
                    goToQuestion(index)
                  }
                  disabled={saving}
                >
                  {index + 1}
                </button>
              );
            }
          )}

        </div>

        <div className="navigator-legend">

          <span>
            <i className="legend-current"></i>
            Current
          </span>

          <span>
            <i className="legend-answered"></i>
            Answered
          </span>

          <span>
            <i className="legend-unanswered"></i>
            Unanswered
          </span>

        </div>

      </div>

      {/* =========================
          Error
      ========================= */}

      {error && (
        <div className="interview-inline-error">
          {error}
        </div>
      )}

      {/* =========================
          Question Card
      ========================= */}

      <div className="question-card">

        <div className="question-top">

          <span className="question-label">
            Question {currentQuestion + 1}
          </span>

          <span className="question-difficulty">
            {interview.difficulty}
          </span>

        </div>

        <h2 className="interview-question-text">
          {current.question}
        </h2>

        {/* =========================
            Answer
        ========================= */}

        <div className="answer-section">

          <label htmlFor="answer">
            Your Answer
          </label>

          <textarea
            id="answer"
            value={answer}
            onChange={(event) =>
              setAnswer(event.target.value)
            }
            placeholder="Type your answer here..."
            disabled={saving}
          />

          <div className="answer-info">
            <span>
              {answer.length} characters
            </span>

            <span>
              Take your time and explain clearly.
            </span>
          </div>

        </div>

        {/* =========================
            Actions
        ========================= */}

        <div className="interview-actions">

          <button
            className="voice-mode-btn"
            onClick={() =>
              navigate(
                `/voice-interview/${id}`
              )
            }
            disabled={saving}
          >
            🎙️ Voice Mode
          </button>

          <button
            className="submit-answer-btn"
            onClick={handleSubmitAnswer}
            disabled={
              saving ||
              !answer.trim() ||
              timeLeft <= 0
            }
          >
            {saving
              ? "AI Evaluating..."
              : "Submit Answer"}
          </button>

        </div>

      </div>

      {/* =========================
          Navigation
      ========================= */}

      <div className="interview-navigation">

        <button
          className="nav-btn previous-btn"
          onClick={goToPreviousQuestion}
          disabled={
            currentQuestion === 0 ||
            saving
          }
        >
          ← Previous
        </button>

        <button
          className="nav-btn skip-btn"
          onClick={skipQuestion}
          disabled={
            currentQuestion ===
              totalQuestions - 1 ||
            saving
          }
        >
          Skip →
        </button>

        <button
          className="nav-btn next-btn"
          onClick={goToNextQuestion}
          disabled={
            currentQuestion ===
              totalQuestions - 1 ||
            saving
          }
        >
          Next →
        </button>

      </div>

      {/* =========================
          AI Evaluation
      ========================= */}

      {evaluation && (
        <div className="interview-evaluation">

          <div className="evaluation-score">

            <span>AI Score</span>

            <strong>
              {evaluation.score}/10
            </strong>

          </div>

          <div className="evaluation-content">

            <h3>AI Feedback</h3>

            <p>
              {evaluation.feedback}
            </p>

            {evaluation.strengths?.length >
              0 && (
              <>
                <h4>Strengths</h4>

                <ul>
                  {evaluation.strengths.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {evaluation.improvements
              ?.length > 0 && (
              <>
                <h4>Areas to Improve</h4>

                <ul>
                  {evaluation.improvements.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Interview;