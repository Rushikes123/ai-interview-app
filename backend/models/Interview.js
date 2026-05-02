const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },

  textAnswer: String,
  textScore: Number,
  textFeedback: String,

  videoUrl: String,
  videoScore: Number,
  videoFeedback: String,
  confidence: Number
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resumeText: { type: String, required: true },
    questions: [questionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);