const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const Interview = require("../models/Interview");

const { generateQuestions, evaluateAnswer } = require("../services/aiService");
const { transcribeVideo } = require("../services/whisperService");


// ================= UPLOAD RESUME =================
exports.uploadResume = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.resolve(file.path);
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);

    const resumeText = data.text;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({
        message: "Resume content too short or invalid",
      });
    }

    res.json({
      success: true,
      resumeText,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error.message);
    res.status(500).json({ message: "Resume processing failed" });
  }
};


// ================= GENERATE INTERVIEW =================
exports.generateInterview = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rawQuestions = await generateQuestions(resumeText);

    const cleanQuestions = rawQuestions
      .map(q => q.trim())
      .filter(q => q.length > 10)
      .slice(0, 10);

    const newInterview = await Interview.create({
      user: req.user.id,
      resumeText,
      questions: cleanQuestions.map(q => ({ question: q })),
    });

    res.json({ interview: newInterview });

  } catch (error) {
    console.error("GENERATE ERROR:", error.message);
    res.status(500).json({ message: "Interview generation failed" });
  }
};


// ================= TEXT ANSWER =================
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    const interview = await Interview.findById(interviewId);
    const q = interview.questions[questionIndex];

    // 🔥 SKIP HANDLING (VERY IMPORTANT)
    if (answer === "Skipped") {
      q.textAnswer = "Skipped";
      q.textScore = 0;
      q.textFeedback = "Question skipped.";

      await interview.save();

      return res.json({
        type: "text",
        score: 0,
        feedback: "Question skipped.",
      });
    }

    // 🚀 ONLY block if empty
    if (!answer || answer.trim().length < 2) {
      return res.json({
        type: "text",
        score: 0,
        feedback: "No meaningful answer provided. Please try again.",
      });
    }

    // ✅ ALWAYS evaluate
    const evaluation = await evaluateAnswer(q.question, answer);

    q.textAnswer = answer;
    q.textScore = evaluation.score;
    q.textFeedback = evaluation.feedback;

    await interview.save();

    res.json({
      type: "text",
      score: q.textScore,
      feedback: q.textFeedback,
    });

  } catch (error) {
    console.error("TEXT ERROR:", error.message);
    res.status(500).json({ message: "Text evaluation failed" });
  }
};


// ================= VIDEO ANSWER =================
exports.submitVideoAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.body;

    const interview = await Interview.findById(interviewId);
    const q = interview.questions[questionIndex];
    const videoFile = req.file;

    if (!videoFile || videoFile.size === 0) {
      return res.status(400).json({ message: "Invalid video" });
    }

    const videoPath = path.resolve(videoFile.path);

    const transcript = await transcribeVideo(videoPath);
    q.transcript = transcript;

    // 🚀 ONLY block if no speech
    if (!transcript || transcript.trim().length < 2) {
      try { fs.unlinkSync(videoPath); } catch {}

      return res.json({
        type: "video",
        score: 0,
        feedback: "No clear speech detected. Please speak properly.",
        confidence: 0,
      });
    }

    // ✅ ALWAYS evaluate
    const ai = await evaluateAnswer(q.question, transcript);

    q.videoScore = ai.score;
    q.videoFeedback = ai.feedback;
    q.confidence = 5;

    await interview.save();
    try { fs.unlinkSync(videoPath); } catch {}

    res.json({
      type: "video",
      score: q.videoScore,
      feedback: q.videoFeedback,
      confidence: 5,
    });

  } catch (error) {
    console.error("VIDEO ERROR:", error);
    res.status(500).json({ message: "Video processing failed" });
  }
};


// ================= RESULT =================
exports.getInterviewResult = async (req, res) => {
  const interview = await Interview.findById(req.params.interviewId);
  res.json({ questions: interview.questions });
};


// ================= HISTORY =================
exports.getInterviewHistory = async (req, res) => {
  const interviews = await Interview.find({ user: req.user.id });

  const updated = interviews.map(interview => {

    const scores = interview.questions.map(q => {
      return (q.textScore || 0) + (q.videoScore || 0);
    });

    const total = scores.reduce((a, b) => a + b, 0);
    const avg = scores.length ? (total / (scores.length * 2)) : 0;

    return {
      ...interview.toObject(),
      averageScore: Number(avg.toFixed(1))
    };
  });

  res.json(updated);
};