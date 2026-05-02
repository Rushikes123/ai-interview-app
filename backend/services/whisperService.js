const fs = require("fs");
const groq = require("../config/groq");

exports.transcribeVideo = async (videoPath) => {
  try {
    console.log("🎤 Transcription started");

    // ===== FILE CHECK =====
    if (!fs.existsSync(videoPath)) {
      console.log("❌ File not found");
      return "";
    }

    const stats = fs.statSync(videoPath);

    // 🔥 Slightly higher threshold (avoid useless calls)
    if (!stats.size || stats.size < 3000) {
      console.log("⚠️ File too small (likely no audio)");
      return "";
    }

    // ===== TRANSCRIPTION =====
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(videoPath),

      // ⚡ FAST MODEL
      model: "whisper-large-v3-turbo",

      response_format: "json"
    });

    let text = response?.text || "";

    text = text.trim();

    console.log("📝 Transcript:", text);

    // ===== SMART FILTER =====
    const wordCount = text.split(" ").length;

    if (!text || wordCount < 3) {
      console.log("⚠️ No meaningful speech detected");
      return "";
    }

    // 🔥 CLEAN TEXT (removes noise words)
    text = text
      .replace(/\b(uh|um|hmm|like)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return text;

  } catch (error) {
    console.log("❌ Whisper ERROR:", error.message);
    return "";
  }
};