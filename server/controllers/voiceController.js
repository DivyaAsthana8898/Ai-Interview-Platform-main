const {
  transcribeAudio,
} = require("../services/aiService");

const transcribeVoiceAnswer = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No audio file received.",
      });
    }

    console.log(
      "Received audio:",
      req.file.size,
      "bytes"
    );

    const transcript =
      await transcribeAudio(req.file.buffer);

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        message:
          "Could not detect speech in the audio.",
      });
    }

    res.status(200).json({
      message: "Audio transcribed successfully",
      transcript: transcript.trim(),
    });

  } catch (error) {
    console.log(
      "Voice Transcription Controller Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to transcribe audio.",
      error: error.message,
    });
  }
};

module.exports = {
  transcribeVoiceAnswer,
};