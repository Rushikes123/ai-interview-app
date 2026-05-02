const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const {
  uploadResume,
  generateInterview,
  submitAnswer,
  getInterviewResult,
  getInterviewHistory,
  submitVideoAnswer
} = require("../controllers/interviewController");

const Interview = require("../models/Interview");


// ================= UPLOAD RESUME =================
router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);


// ================= GENERATE INTERVIEW =================
router.post(
  "/generate-interview",
  authMiddleware,
  generateInterview
);


// ================= TEXT ANSWER =================
router.post(
  "/submit-answer",
  authMiddleware,
  submitAnswer
);


// ================= VIDEO ANSWER =================
router.post(
  "/video-answer",
  authMiddleware,
  upload.single("video"),
  submitVideoAnswer
);


// ================= RESULT =================
router.get(
  "/result/:interviewId",
  authMiddleware,
  getInterviewResult
);


// ================= HISTORY =================
router.get(
  "/history",
  authMiddleware,
  getInterviewHistory
);


// ================= GET SINGLE INTERVIEW =================
router.get(
  "/session/:interviewId",   // 🔥 FIXED ROUTE NAME (important)
  authMiddleware,
  async (req, res) => {
    try {
      const interview = await Interview.findById(req.params.interviewId);

      if (!interview) {
        return res.status(404).json({
          message: "Interview not found"
        });
      }

      // 🔐 SECURITY FIX: check ownership
      if (interview.user.toString() !== req.user.id) {
        return res.status(403).json({
          message: "Unauthorized access"
        });
      }

      res.json(interview);

    } catch (error) {
      console.error("GET SESSION ERROR:", error.message);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);

module.exports = router;