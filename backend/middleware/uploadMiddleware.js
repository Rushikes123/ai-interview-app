const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folders exist
const videoDir = "uploads/videos";
const resumeDir = "uploads/resumes";

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

// STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "video") {
      console.log("Uploading video...");
      cb(null, videoDir);
    } else if (file.fieldname === "resume") {
      console.log("Uploading resume...");
      cb(null, resumeDir);
    } else {
      cb(new Error("Invalid field name"), false);
    }
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".webm";
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  }
});

// FILE FILTER (FIXED)
const fileFilter = (req, file, cb) => {

  if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }
    return cb(new Error("Only video files allowed"), false);
  }

  if (file.fieldname === "resume") {
    // 🔥 RELAXED VALIDATION (fixes real-world issues)
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".pdf") {
      return cb(null, true);
    }

    return cb(new Error("Only PDF files allowed"), false);
  }

  return cb(new Error("Invalid file type"), false);
};

// FINAL UPLOAD
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = upload;