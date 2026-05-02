
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Result() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {
  fetchResult();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchResult = async () => {
    try {

      const res = await API.get(`/interview/result/${id}`);
      setResult(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading Result...
      </div>
    );
  }

  const questions = result.questions;

  const totalScore = questions.reduce((sum, q) => {
    return sum + (q.textScore || 0) + (q.videoScore || 0);
  }, 0);

  const avgScore = (totalScore / questions.length).toFixed(1);

  return (

   <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-gray-900 to-indigo-900 relative overflow-hidden">

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Result Card */}
      <div className="relative bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 w-full max-w-5xl p-10">

        <h1 className="text-3xl font-bold mb-10 text-center">
          Interview Result
        </h1>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <div className="bg-indigo-50 rounded-xl p-6 text-center shadow">

            <p className="text-gray-500 text-sm mb-1">
              Total Score
            </p>

            <p className="text-3xl font-bold text-indigo-600">
              {totalScore}
            </p>

          </div>

          <div className="bg-purple-50 rounded-xl p-6 text-center shadow">

            <p className="text-gray-500 text-sm mb-1">
              Average Score
            </p>

            <p className="text-3xl font-bold text-purple-600">
              {avgScore}
            </p>

          </div>

        </div>

        {/* Questions */}
        <div className="space-y-8">

          {questions.map((q, index) => (

            <div
              key={index}
              className="border rounded-xl p-6 bg-gray-50"
            >

              <p className="font-semibold mb-4 text-lg">
                Q{index + 1}: {q.question}
              </p>

              {/* TEXT ANSWER */}
              <div className="mb-6">

                <p className="font-medium text-blue-600 mb-1">
                  Text Answer
                </p>

                <p className="text-sm">
                  {q.textAnswer || "No text answer"}
                </p>

                <p className="text-sm mt-1">
                  Score: {q.textScore || 0}/10
                </p>

                <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                  Feedback: {q.textFeedback || "No feedback"}
                </p>

              </div>

              {/* VIDEO ANSWER */}
              <div>

                <p className="font-medium text-green-600 mb-1">
                  Video Answer
                </p>

                {q.videoUrl && (
                  <video
                    controls
                    className="mt-2 rounded-lg w-full max-h-[400px]"
                    src={`http://localhost:5000/${q.videoUrl}`}
                  />
                )}

                <p className="text-sm mt-3">
                  Transcript: {q.transcript || "No transcript"}
                </p>

                <p className="text-sm mt-1">
                  Score: {q.videoScore || 0}/10
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Feedback: {q.videoFeedback || "No feedback"}
                </p>

                {q.confidence?.confidenceScore && (
                  <p className="text-sm text-purple-700 mt-1">
                    Confidence Score: {q.confidence.confidenceScore}
                  </p>
                )}

              </div>

            </div>

          ))}

        </div>

        {/* Dashboard Button */}
        <div className="mt-12 text-center">

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Back to Dashboard
          </button>

        </div>

      </div>

    </div>

  );
}

export default Result;

