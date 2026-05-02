const fs = require("fs");

// helper: get file size
const getFileSizeInMB = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
};

exports.analyzeConfidence = async (videoPath, transcript = "") => {
  try {

    // ✅ 1. Check file exists
    if (!fs.existsSync(videoPath)) {
      throw new Error("Video file not found");
    }

    const fileSizeMB = getFileSizeInMB(videoPath);

    // ✅ 2. Clean transcript
    const cleanText = transcript ? transcript.trim() : "";
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

    let metrics = {
      eyeContact: 2,
      speechClarity: 2,
      posture: 3,
      pauses: 2
    };

    // ✅ 3. CASE 1: No speech detected
    if (!cleanText || wordCount < 3) {
      metrics = {
        eyeContact: 1,
        speechClarity: 1,
        posture: 2,
        pauses: 1
      };
    }

    // ✅ 4. CASE 2: Few words (weak answer)
    else if (wordCount < 20) {
      metrics = {
        eyeContact: 4,
        speechClarity: 4,
        posture: 4,
        pauses: 3
      };
    }

    // ✅ 5. CASE 3: Medium answer
    else if (wordCount < 50) {
      metrics = {
        eyeContact: 6,
        speechClarity: 6,
        posture: 5,
        pauses: 5
      };
    }

    // ✅ 6. CASE 4: Good answer
    else {
      metrics = {
        eyeContact: 8,
        speechClarity: 8,
        posture: 7,
        pauses: 7
      };
    }

    // ✅ 7. Adjust using file size (bonus logic)
    if (fileSizeMB > 5) {
      metrics.eyeContact += 1;
      metrics.speechClarity += 1;
    }

    // limit max to 10
    Object.keys(metrics).forEach(key => {
      if (metrics[key] > 10) metrics[key] = 10;
    });

    // ✅ 8. Final score
    const confidenceScore =
      (metrics.eyeContact +
        metrics.speechClarity +
        metrics.posture +
        metrics.pauses) / 4;

    return {
      confidenceScore: confidenceScore.toFixed(1),
      metrics
    };

  } catch (error) {
    return {
      confidenceScore: 0,
      metrics: {},
      error: "Error analyzing video"
    };
  }
};