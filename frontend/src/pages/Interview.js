import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [textFeedback, setTextFeedback] = useState(null);
  const [videoFeedback, setVideoFeedback] = useState(null);

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchInterview();
  }, []);

  const fetchInterview = async () => {
    try {
      const res = await API.get(`/interview/result/${id}`);
      setInterview(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!interview || !interview.questions?.length) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  const currentQ = interview.questions[currentQuestion];
  const question =
    typeof currentQ === "object" ? currentQ.question : currentQ;

  const parseFeedback = (fb) => {
    if (!fb) return null;
    if (typeof fb === "string") {
      try {
        return JSON.parse(fb);
      } catch {
        return null;
      }
    }
    return fb;
  };

  // ================= TEXT =================
  const submitAnswer = async () => {
    if (!answer.trim() || loadingText) return;

    try {
      setLoadingText(true);

      const res = await API.post("/interview/submit-answer", {
        interviewId: id,
        questionIndex: currentQuestion,
        answer,
      });

      setTextFeedback(res.data);
      setAnswer("");
    } catch {
      alert("Text submission failed");
    } finally {
      setLoadingText(false);
    }
  };

  // ================= SKIP =================
  const skipQuestion = async () => {
    if (loadingText) return;

    try {
      setLoadingText(true);

      const res = await API.post("/interview/submit-answer", {
        interviewId: id,
        questionIndex: currentQuestion,
        answer: "Skipped",
      });

      setTextFeedback(res.data);

    } catch {
      alert("Skip failed");
    } finally {
      setLoadingText(false);
    }
  };

  // ================= VIDEO =================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 500000 // 🔥 Step 3 applied
      });

      mediaRecorderRef.current = recorder;

      let chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });

        if (blob.size > 0) {
          setVideoBlob(blob);
        } else {
          alert("Recording failed");
        }

        streamRef.current?.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);

      // 🔥 Step 2 applied (auto stop)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, 20000);

    } catch {
      alert("Camera or microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadVideo = async () => {
    if (!videoBlob || loadingVideo) return alert("Record video first");

    const formData = new FormData();
    formData.append("video", videoBlob);
    formData.append("interviewId", id);
    formData.append("questionIndex", currentQuestion);

    try {
      setLoadingVideo(true);

      const res = await API.post("/interview/video-answer", formData);
      setVideoFeedback(res.data);
    } catch {
      alert("Video upload failed");
    } finally {
      setLoadingVideo(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion >= interview.questions.length - 1) {
      navigate(`/result/${id}`);
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
    setAnswer("");
    setTextFeedback(null);
    setVideoFeedback(null);
    setVideoBlob(null);
  };

  const textFb = parseFeedback(textFeedback);
  const videoFb = parseFeedback(videoFeedback);

  const scoreColor = (score) =>
    score < 4
      ? "text-red-600"
      : score < 7
      ? "text-yellow-600"
      : "text-green-600";

  const isAnyLoading = loadingText || loadingVideo;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-900 to-indigo-900 p-6">
      <div className="bg-white p-8 rounded-2xl w-full max-w-3xl">

        <div className="mb-4">
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${((currentQuestion + 1) / interview.questions.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Question {currentQuestion + 1} of {interview.questions.length}
          </p>
        </div>

        <h2 className="text-xl font-bold mb-4">
          Q{currentQuestion + 1}. {question.replace(/^Q\d+\.\s*/, "")}
        </h2>

        <textarea
          className="w-full border p-4 mb-4 rounded"
          placeholder="Explain your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loadingText}
        />

        <div className="flex gap-3">
          <button
            onClick={submitAnswer}
            disabled={loadingText}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loadingText ? "Evaluating..." : "Submit"}
          </button>

          <button
            onClick={skipQuestion}
            disabled={loadingText}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Skip
          </button>
        </div>

        <hr className="my-6" />

        <video ref={videoRef} autoPlay className="w-full mb-3 rounded" />

        <div className="flex gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={loadingVideo}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop
            </button>
          )}

          {videoBlob && (
            <button
              onClick={uploadVideo}
              disabled={loadingVideo}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loadingVideo ? "Processing..." : "Upload Video"}
            </button>
          )}
        </div>

        {textFb && (
          <div className="mt-4 p-5 rounded-lg shadow border">
            <h3 className="font-semibold text-blue-700 mb-2">🧠 Text Evaluation</h3>
            <p className={`font-bold ${scoreColor(textFb.score)}`}>
              {textFb.score}/10
            </p>
            <p>"{textFb.feedback}"</p>
          </div>
        )}

        {videoFb && (
          <div className="mt-4 p-5 rounded-lg shadow border">
            <h3 className="font-semibold text-green-700 mb-2">🎥 Video Evaluation</h3>
            <p className={`font-bold ${scoreColor(videoFb.score)}`}>
              {videoFb.score}/10
            </p>
            <p>"{videoFb.feedback}"</p>
            <p className="text-sm mt-2">
              Confidence: {Number(videoFb.confidence || 0).toFixed(1)}
            </p>
          </div>
        )}

        {(textFb || videoFb) && (
          <button
            onClick={nextQuestion}
            disabled={isAnyLoading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next →
          </button>
        )}

      </div>
    </div>
  );
}

export default Interview;