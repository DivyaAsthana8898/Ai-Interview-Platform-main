const Groq = require("groq-sdk");

const { toFile } = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "openai/gpt-oss-120b";

/*
========================================
Evaluate Interview Answer
========================================
*/

const evaluateAnswer = async ({
  question,
  answer,
  interviewType,
  difficulty,
}) => {
  const prompt = `
You are an expert technical interviewer and career coach.

Evaluate the candidate's answer to the interview question.

Interview Type: ${interviewType}
Difficulty: ${difficulty}

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer based on:
- Correctness
- Relevance
- Technical knowledge
- Clarity
- Completeness
- Interview quality

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "feedback": "short and useful feedback",
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "improvements": [
    "improvement 1",
    "improvement 2"
  ]
}

Rules:
- score must be an integer from 0 to 10.
- feedback must be concise and specific.
- strengths must contain 1 to 4 items.
- improvements must contain 1 to 4 items.
- Do not make unsupported claims.
- Do not include markdown.
- Do not include code fences.
- Return JSON only.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer. Always return valid JSON according to the requested format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      response_format: {
        type: "json_object",
      },

      temperature: 0.2,
      max_completion_tokens: 1000,
    });

    const text = completion.choices?.[0]?.message?.content || "{}";

    console.log("Groq Evaluation Response:", text);

    return JSON.parse(text);
  } catch (error) {
    console.log("Groq Evaluation Error:", error.message);

    throw error;
  }
};

/*
========================================
Generate AI Career Insights
========================================
*/

const generateCareerInsights = async ({ interviews, user }) => {
  const interviewSummary = interviews.map((interview, index) => {
    const questions = interview.questions || [];

    const scores = questions.map((q) => Number(q.score) || 0);

    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

    return {
      interviewNumber: index + 1,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,

      averageScore: averageScore.toFixed(1),

      questions: questions.map((q) => ({
        question: q.question,
        score: q.score,
        feedback: q.feedback,
        strengths: q.strengths || [],
        improvements: q.improvements || [],
      })),
    };
  });

  const prompt = `
You are an expert career coach and technical interviewer.

Analyze the candidate's complete interview history.

Candidate:

Name:
${user.name}

Skills:
${(user.skills || []).join(", ")}

Target Role:
${user.targetRole || "Not specified"}

Interview History:
${JSON.stringify(interviewSummary, null, 2)}

Create a personalized career analysis.

Return ONLY valid JSON in this exact format:

{
  "overallAssessment": "short overall assessment",
  "careerReadiness": 0,

  "strongestAreas": [
    "area 1",
    "area 2",
    "area 3"
  ],

  "weakAreas": [
    "area 1",
    "area 2",
    "area 3"
  ],

  "recommendedTopics": [
    "topic 1",
    "topic 2",
    "topic 3",
    "topic 4"
  ],

  "interviewRecommendation": {
    "difficulty": "Easy",
    "reason": "short reason"
  },

  "improvementPlan": [
    {
      "priority": "High",
      "action": "specific action"
    },
    {
      "priority": "Medium",
      "action": "specific action"
    },
    {
      "priority": "Low",
      "action": "specific action"
    }
  ]
}

Rules:

- careerReadiness must be an integer from 0 to 100.
- strongestAreas must contain 2 to 4 items.
- weakAreas must contain 2 to 4 items.
- recommendedTopics must contain 3 to 6 items.
- difficulty must be exactly:
  Easy, Medium, or Hard.
- improvementPlan must contain 3 to 5 items.
- Be specific to the candidate's interview history.
- Do not make unsupported claims.
- Do not include markdown.
- Do not include code fences.
- Return JSON only.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an expert career coach. Always return valid JSON according to the requested format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      response_format: {
        type: "json_object",
      },

      temperature: 0.3,
      max_completion_tokens: 2000,
    });

    const text = completion.choices?.[0]?.message?.content || "{}";

    console.log("Groq Career Insights Response:", text);

    return JSON.parse(text);
  } catch (error) {
    console.log("Groq Career Insights Error:", error.message);

    throw error;
  }
};

/*
========================================
Generate Dynamic Interview Questions
========================================
*/

const generateInterviewQuestions = async ({
  user,
  interviewType,
  difficulty,
  numberOfQuestions,
}) => {
  const skills =
    user.skills && user.skills.length > 0
      ? user.skills.join(", ")
      : "General Computer Science";

  const targetRole = user.targetRole || "Software Developer";

  const prompt = `
You are an expert technical interviewer.

Create a personalized interview for the candidate.

Candidate Information:

Name:
${user.name}

Skills:
${skills}

Target Role:
${targetRole}

Interview Type:
${interviewType}

Difficulty:
${difficulty}

Number of Questions:
${numberOfQuestions}

Generate exactly ${numberOfQuestions} interview questions.

Requirements:

1. Questions must be relevant to the candidate's skills.
2. Questions must match the target role.
3. Questions must match the selected interview type.
4. Questions must match the selected difficulty.
5. Do not repeat questions.
6. Questions should test real interview knowledge.
7. For Technical interviews, include technical and coding-related questions when appropriate.
8. For HR interviews, focus on behavioral, communication, teamwork, leadership, and career questions.
9. For Mixed interviews, combine technical and HR questions.
10. Questions should be suitable for a real job interview.
11. Do not provide answers.
12. Return ONLY valid JSON.

Return exactly this format:

{
  "questions": [
    {
      "question": "Interview question 1"
    },
    {
      "question": "Interview question 2"
    }
  ]
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are an expert interviewer. Generate high-quality personalized interview questions and return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      response_format: {
        type: "json_object",
      },

      temperature: 0.7,

      max_completion_tokens: Math.max(1000, numberOfQuestions * 150),
    });

    const text = completion.choices?.[0]?.message?.content || "{}";

    console.log("Groq Interview Questions:", text);

    const result = JSON.parse(text);

    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Invalid question format returned by Groq");
    }

    if (result.questions.length !== Number(numberOfQuestions)) {
      throw new Error(
        `Groq returned ${result.questions.length} questions instead of ${numberOfQuestions}`,
      );
    }

    return result.questions;
  } catch (error) {
    console.log("Generate Questions Error:", error.message);

    throw error;
  }
};

/*
========================================
Transcribe Voice Answer
========================================
*/

const transcribeAudio = async (audioBuffer) => {
  try {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error("Audio file is empty.");
    }

    const audioFile = await toFile(
      audioBuffer,
      "answer.webm"
    );

    const transcription =
      await groq.audio.transcriptions.create({
        file: audioFile,

        model: "whisper-large-v3-turbo",

        language: "en",

        response_format: "json",

        temperature: 0,
      });

    console.log(
      "Groq Transcription:",
      transcription.text
    );

    return transcription.text;

  } catch (error) {
    console.log(
      "Groq Transcription Error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  evaluateAnswer,
  generateCareerInsights,
  generateInterviewQuestions,
  transcribeAudio,
};
