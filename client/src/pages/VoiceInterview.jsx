import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./VoiceInterview.css";

function VoiceInterview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [transcript, setTranscript] = useState("");

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // MediaRecorder
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Speech Recognition
  const recognitionRef = useRef(null);
  const speechTranscriptRef = useRef("");

  // Prevent old recognition events from affecting next recording
  const recordingSessionRef = useRef(0);

  const token = localStorage.getItem("token");

  /*
  ========================================
  FETCH INTERVIEW
  ========================================
  */

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setError("");

        const response = await API.get(
          `/interview/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInterview(response.data.interview);
      } catch (err) {
        console.error(
          "Voice Interview Fetch Error:",
          err
        );

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
      }
    };

    fetchInterview();
  }, [id, navigate, token]);

  /*
  ========================================
  CLEANUP
  ========================================
  */

  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  /*
  ========================================
  STOP EVERYTHING
  ========================================
  */

  const stopEverything = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Speech recognition already stopped."
        );
      }

      recognitionRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current) {
      try {
        if (
          mediaRecorderRef.current.state !==
          "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.log(
          "Media recorder already stopped."
        );
      }

      mediaRecorderRef.current = null;
    }

    // Stop microphone
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }
  };

  /*
  ========================================
  CURRENT QUESTION
  ========================================
  */

  const questions =
    interview?.questions || [];

  const totalQuestions =
    questions.length;

  const question =
    questions[currentQuestion];

  /*
  ========================================
  READ QUESTION
  ========================================
  */

  const readQuestion = () => {
    if (!question?.question) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        question.question
      );

    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );
  };

  /*
  ========================================
  START BROWSER SPEECH RECOGNITION
  ========================================
  */

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log(
        "Browser Speech Recognition is not supported."
      );

      return null;
    }

    try {
      const recognition =
        new SpeechRecognition();

      recognition.continuous = true;

      recognition.interimResults = true;

      recognition.lang = "en-US";

      recognition.maxAlternatives = 1;

      speechTranscriptRef.current = "";

      let finalText = "";

      recognition.onstart = () => {
        console.log(
          "Browser speech recognition started."
        );
      };

      recognition.onresult = (event) => {
        let interimText = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result =
            event.results[i];

          const text =
            result[0].transcript;

          if (result.isFinal) {
            finalText +=
              text + " ";
          } else {
            interimText += text;
          }
        }

        const combinedText =
          `${finalText} ${interimText}`.trim();

        speechTranscriptRef.current =
          finalText.trim();

        if (combinedText) {
          setTranscript(
            combinedText
          );
        }
      };

      recognition.onerror = (event) => {
        console.log(
          "Speech Recognition Error:",
          event.error
        );

        /*
        Don't stop the whole recording
        if browser speech recognition
        has a network problem.

        MediaRecorder will continue and
        Groq Whisper will be used as
        fallback.
        */

        if (
          event.error === "not-allowed"
        ) {
          console.log(
            "Speech recognition permission denied."
          );
        }

        if (
          event.error === "network"
        ) {
          console.log(
            "Browser speech recognition network error. Groq fallback will be used."
          );
        }
      };

      recognition.onend = () => {
        console.log(
          "Browser speech recognition ended."
        );
      };

      recognition.start();

      recognitionRef.current =
        recognition;

      return recognition;
    } catch (error) {
      console.error(
        "Speech Recognition Start Error:",
        error
      );

      return null;
    }
  };

  /*
  ========================================
  START RECORDING
  ========================================
  */

  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");

      audioChunksRef.current = [];

      speechTranscriptRef.current = "";

      recordingSessionRef.current += 1;

      /*
      Microphone support
      */

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        throw new Error(
          "Your browser does not support microphone recording."
        );
      }

      /*
      Get microphone
      */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
            },
          }
        );

      streamRef.current = stream;

      /*
      MediaRecorder support
      */

      if (!window.MediaRecorder) {
        throw new Error(
          "Your browser does not support audio recording."
        );
      }

      /*
      Find supported format
      */

      let mimeType =
        "audio/webm";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType =
          "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        mimeType =
          "audio/webm";
      }

      /*
      Create MediaRecorder
      */

      const recorder =
        new MediaRecorder(
          stream,
          {
            mimeType,
            audioBitsPerSecond: 128000,
          }
        );

      mediaRecorderRef.current =
        recorder;

      /*
      Collect audio
      */

      recorder.ondataavailable = (
        event
      ) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      /*
      IMPORTANT:
      Start browser speech recognition
      */

      startSpeechRecognition();

      /*
      Start audio recorder

      We use 1000ms chunks.
      MediaRecorder guarantees a final
      dataavailable event when stop()
      is called.
      */

      recorder.start(1000);

      setRecording(true);

      console.log(
        "Voice recording started."
      );
    } catch (err) {
      console.error(
        "Start Recording Error:",
        err
      );

      stopEverything();

      setRecording(false);

      setError(
        err.message ||
          "Could not access microphone."
      );
    }
  };

  /*
  ========================================
  STOP RECORDING
  ========================================
  */

  const stopRecording = () => {
    try {
      setRecording(false);

      /*
      Stop browser speech recognition
      */

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(
            "Speech recognition already stopped."
          );
        }
      }

      /*
      Stop MediaRecorder

      IMPORTANT:
      Do NOT stop microphone tracks
      before recorder.stop().

      The final dataavailable event
      is generated during stop().
      */

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state === "recording"
      ) {
        console.log(
          "Stopping MediaRecorder..."
        );

        recorder.stop();

        /*
        Process final audio after
        recorder has finished.
        */

        recorder.onstop = async () => {
          console.log(
            "MediaRecorder stopped."
          );

          /*
          Stop microphone tracks
          */

          if (streamRef.current) {
            streamRef.current
              .getTracks()
              .forEach((track) => {
                track.stop();
              });

            streamRef.current = null;
          }

          /*
          Create final audio blob
          */

          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type: mimeTypeFromRecorder(
                  recorder
                ),
              }
            );

          console.log(
            "Final audio size:",
            audioBlob.size
          );

          console.log(
            "Final audio type:",
            audioBlob.type
          );

          /*
          If browser speech produced
          a good transcript, use it.

          Otherwise use Groq.
          */

          const browserText =
            speechTranscriptRef.current.trim();

          if (
            browserText.length >= 10
          ) {
            console.log(
              "Using browser speech transcript."
            );

            setTranscript(
              browserText
            );

            return;
          }

          /*
          Browser speech unavailable
          or failed.

          Use Groq Whisper.
          */

          if (audioBlob.size < 1000) {
            setError(
              "Recording is too short. Please speak for at least 2 seconds."
            );

            return;
          }

          await transcribeAudio(
            audioBlob
          );
        };
      }
    } catch (error) {
      console.error(
        "Stop Recording Error:",
        error
      );

      setRecording(false);

      setError(
        "Could not stop the recording."
      );
    }
  };

  /*
  ========================================
  GET RECORDER MIME TYPE
  ========================================
  */

  const mimeTypeFromRecorder = (
    recorder
  ) => {
    if (recorder?.mimeType) {
      return recorder.mimeType;
    }

    return "audio/webm";
  };

  /*
  ========================================
  GROQ TRANSCRIPTION FALLBACK
  ========================================
  */

  const transcribeAudio = async (
    audioBlob
  ) => {
    try {
      setTranscribing(true);

      setError("");

      const formData =
        new FormData();

      formData.append(
        "audio",
        audioBlob,
        "answer.webm"
      );

      console.log(
        "Sending audio to Groq..."
      );

      const response =
        await API.post(
          "/voice/transcribe",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const text =
        response.data?.transcript ||
        "";

      if (!text.trim()) {
        setError(
          "No speech was detected. Please try again."
        );

        return;
      }

      console.log(
        "Groq Transcript:",
        text
      );

      setTranscript(
        text.trim()
      );
    } catch (err) {
      console.error(
        "Groq Transcription Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to transcribe your voice."
      );
    } finally {
      setTranscribing(false);
    }
  };

  /*
  ========================================
  SUBMIT ANSWER
  ========================================
  */

  const submitVoiceAnswer =
    async () => {
      if (!transcript.trim()) {
        setError(
          "Please record an answer first."
        );

        return;
      }

      try {
        setSubmitting(true);

        setError("");

        const response =
          await API.put(
            `/interview/${id}/answer`,
            {
              questionIndex:
                currentQuestion,

              answer:
                transcript.trim(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        console.log(
          "Voice answer evaluated:",
          response.data
        );

        /*
        Last question
        */

        if (
          currentQuestion ===
          totalQuestions - 1
        ) {
          navigate(
            `/result/${id}`
          );

          return;
        }

        /*
        Next question
        */

        const nextIndex =
          currentQuestion + 1;

        setCurrentQuestion(
          nextIndex
        );

        setTranscript("");

        speechTranscriptRef.current =
          "";

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (err) {
        console.error(
          "Submit Voice Answer Error:",
          err
        );

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          localStorage.removeItem(
            "token"
          );

          navigate("/login");

          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to submit voice answer."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
  ========================================
  EXIT
  ========================================
  */

  const exitInterview = () => {
    stopEverything();

    window.speechSynthesis.cancel();

    navigate("/dashboard");
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (!interview) {
    return (
      <div className="voice-page">
        <div className="voice-loading">
          <div className="voice-spinner"></div>

          <h2>
            Loading Voice Interview...
          </h2>

          <p>
            Preparing your interview question.
          </p>
        </div>
      </div>
    );
  }

  /*
  ========================================
  PROGRESS
  ========================================
  */

  const progress =
    totalQuestions > 0
      ? ((currentQuestion + 1) /
          totalQuestions) *
        100
      : 0;

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <div className="voice-page">

      {/* HEADER */}

      <div className="voice-header">

        <div>
          <div className="voice-title">
            🎙️ Voice Interview
          </div>

          <p>
            Speak naturally. Groq AI will
            transcribe and evaluate your answer.
          </p>
        </div>

        <button
          className="voice-exit-btn"
          onClick={exitInterview}
        >
          Exit Interview
        </button>

      </div>


      {/* PROGRESS */}

      <div className="voice-progress-card">

        <div className="voice-progress-header">

          <span className="progress-question-text">
            Question{" "}
            <strong>
              {currentQuestion + 1}
            </strong>{" "}
            of{" "}
            <strong>
              {totalQuestions}
            </strong>
          </span>

          <span className="progress-percentage">
            {Math.round(progress)}%
          </span>

        </div>

        <div className="voice-progress-track">

          <div
            className="voice-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>


      {/* QUESTION */}

      <div className="voice-question-card">

        <div className="voice-question-top">

          <span className="voice-question-number">
            Question {currentQuestion + 1}
          </span>

          <span className="voice-difficulty">
            {interview.difficulty}
          </span>

        </div>

        <h2 className="voice-question-text">
          {question?.question}
        </h2>

        <button
          className="read-question-btn"
          onClick={readQuestion}
        >
          🔊 Read Question Aloud
        </button>

      </div>


      {/* ANSWER */}

      <div className="voice-answer-card">

        <div className="voice-answer-header">

          <div
            className={`microphone ${
              recording
                ? "microphone-active"
                : ""
            }`}
          >
            🎙️
          </div>

          <div>

            <h2>
              {recording
                ? "Listening..."
                : transcribing
                ? "Processing your answer..."
                : "Ready for your answer"}
            </h2>

            <p>
              {recording
                ? "Speak clearly and naturally."
                : transcribing
                ? "Groq AI is converting your speech to text."
                : "Click Start Speaking to begin."}
            </p>

          </div>

        </div>


        {/* STATUS */}

        <div
          className={`recording-status ${
            recording
              ? "recording-active"
              : ""
          }`}
        >

          <span className="recording-dot"></span>

          {recording
            ? "Recording..."
            : "Microphone ready"}

        </div>


        {/* TRANSCRIPT */}

        <div className="transcript-box">

          {transcribing ? (
            <div className="transcript-loading">

              <div className="small-spinner"></div>

              <span>
                Groq is transcribing your voice...
              </span>

            </div>
          ) : transcript ? (
            <>

              <div className="transcript-label">
                Your Answer
              </div>

              <textarea
                value={transcript}
                onChange={(event) => {
                  setTranscript(
                    event.target.value
                  );

                  speechTranscriptRef.current =
                    event.target.value;
                }}
                placeholder="Your answer will appear here..."
              />

            </>
          ) : (
            <p className="empty-transcript">
              Your spoken answer will appear
              here after recording...
            </p>
          )}

        </div>


        {/* CONTROLS */}

        <div className="voice-controls">

          {!recording ? (
            <button
              className="start-speaking-btn"
              onClick={
                startRecording
              }
              disabled={
                transcribing ||
                submitting
              }
            >
              🎙️ Start Speaking
            </button>
          ) : (
            <button
              className="stop-speaking-btn"
              onClick={
                stopRecording
              }
            >
              ⏹ Stop Recording
            </button>
          )}


          <button
            className="submit-voice-btn"
            onClick={
              submitVoiceAnswer
            }
            disabled={
              !transcript.trim() ||
              transcribing ||
              recording ||
              submitting
            }
          >
            {submitting
              ? "🤖 AI Evaluating..."
              : currentQuestion ===
                  totalQuestions - 1
                ? "Submit & Finish"
                : "Submit Answer →"}
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="voice-inline-error">
            ⚠️ {error}
          </div>
        )}

      </div>

    </div>
  );
}

export default VoiceInterview;