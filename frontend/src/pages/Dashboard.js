import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {

  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {

    const storedName = localStorage.getItem("name");

    if (storedName) {
      const firstName = storedName.split(" ")[0];
      setUserName(firstName);
    }

    const fetchHistory = async () => {

      try {

        const res = await API.get("/interview/history");

        const interviews = res.data;

        const total = interviews.length;

        setTotalInterviews(total);

        // ✅ SAFE AVERAGE CALCULATION
        if (total > 0) {

          const sum = interviews.reduce(
            (acc, i) => acc + (i.averageScore || 0),
            0
          );

          const avg = (sum / total).toFixed(1);

          setAvgScore(avg);

        } else {
          setAvgScore(0);
        }

      } catch (error) {

        console.log("Failed to fetch interview history");
        setAvgScore(0);

      }

    };

    fetchHistory();

  }, []);

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <div className="bg-white shadow">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-2xl font-bold text-indigo-600">
            PrepBot — The AI Mock Interviewer
          </h1>

          <div className="flex items-center gap-6">

            <span className="text-gray-700 font-medium">
              Welcome {userName}
            </span>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white">

        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 items-center gap-10">

          <div>

            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Improve your interview skills with AI
            </h2>

            <p className="text-lg opacity-90 mb-8">
              Practice technical interviews, get instant AI feedback,
              and track your progress with smart analytics.
            </p>

            <button
              onClick={() => navigate("/upload")}
              className="bg-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              🚀 Start Interview
            </button>

          </div>

          <div>

            <img
              src="/images/logo.jpg"
              alt="PrepBot Logo"
              className="w-full rounded-xl shadow-2xl"
            />

          </div>

        </div>

      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

          <h3 className="text-gray-500 text-sm">
            Total Interviews
          </h3>

          <p className="text-3xl font-bold mt-2 text-indigo-600">
            {totalInterviews}
          </p>

        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

          <h3 className="text-gray-500 text-sm">
            Average Score
          </h3>

          <p className="text-3xl font-bold mt-2 text-purple-600">
            {(avgScore || 0)}/10
          </p>

        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

          <h3 className="text-gray-500 text-sm">
            Progress
          </h3>

          <p className="text-lg font-medium mt-2 text-green-600">
            Keep Practicing 🚀
          </p>

        </div>

      </div>

      {/* Dashboard Actions */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div
          onClick={() => navigate("/upload")}
          className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition cursor-pointer"
        >

          <h3 className="text-xl font-semibold mb-3">
            📄 Upload Resume
          </h3>

          <p className="text-gray-500">
            Upload resume and generate AI interview questions.
          </p>

        </div>

        <div
          onClick={() => navigate("/upload")}
          className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition cursor-pointer"
        >

          <h3 className="text-xl font-semibold mb-3">
            🎤 Start Interview
          </h3>

          <p className="text-gray-500">
            Begin a new mock interview session.
          </p>

        </div>

        <div
          onClick={() => navigate("/history")}
          className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition cursor-pointer"
        >

          <h3 className="text-xl font-semibold mb-3">
            📊 Interview History
          </h3>

          <p className="text-gray-500">
            View your past interviews and scores.
          </p>

        </div>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">

        <div className="max-w-7xl mx-auto px-6 py-8 text-center">

          <h3 className="text-xl font-semibold mb-2">
            PrepBot — The AI Mock Interviewer
          </h3>

          <p className="text-gray-400 mb-3">
            Practice interviews with AI and improve your technical confidence.
          </p>

          <p className="text-gray-400">
            Contact: prepbot@email.com
          </p>

          <p className="text-gray-500 text-sm mt-3">
            © 2026 PrepBot. All rights reserved.
          </p>

        </div>

      </footer>

    </div>

  );

}

export default Dashboard;