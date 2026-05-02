import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
  try {
    if (!file) {
      alert("Please select a file");
      return;
    }

    // 🔥 STRICT FILE CHECK
    if (file.type !== "application/pdf") {
      alert("Only PDF files allowed");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    console.log("Uploading file:", file); // debug

    const uploadRes = await API.post(
      "/interview/upload-resume",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    console.log("Upload response:", uploadRes.data);

    const resumeText = uploadRes.data.resumeText;

    const interviewRes = await API.post(
      "/interview/generate-interview",
      { resumeText }
    );

    const interviewId = interviewRes.data.interview._id;

    navigate(`/interview/${interviewId}`);

  } catch (error) {
    console.error("UPLOAD ERROR:", error.response?.data || error.message);

    alert(
      error.response?.data?.message || "Upload failed. Check console."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/images/upload.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 text-white text-sm font-medium hover:underline"
      >
        ← Back to Dashboard
      </button>

      {/* CARD */}
      <div className="relative bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md text-center border border-white/20">

        {/* HEADING */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Upload Your Resume
        </h2>

        <p className="text-gray-500 mb-6 text-sm">
          Let AI analyze your resume and generate personalized interview questions
        </p>

        {/* FILE INPUT */}
        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition duration-300 shadow-lg
          ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          }`}
        >
          {loading ? "Processing..." : "Upload & Start Interview"}
        </button>

      </div>
    </div>
  );
};

export default UploadResume;