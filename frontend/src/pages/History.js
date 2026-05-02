import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function History() {

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/interview/history");

      console.log("History data:", res.data); // 🔍 debug

      setInterviews(res.data || []);

    } catch (error) {
      console.error("History error:", error);
    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-gray-900 to-indigo-900 relative overflow-hidden">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Card */}
      <div className="relative bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 w-full max-w-4xl p-10">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Interview History
        </h1>

        {/* 🔄 Loading */}
        {loading ? (
          <p className="text-center text-gray-500">Loading history...</p>
        ) : interviews.length === 0 ? (

          <p className="text-center text-gray-500">
            No interviews yet
          </p>

        ) : (

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">

            <thead>
              <tr className="bg-gray-100 text-gray-700">

                <th className="p-3 border">Date</th>
                <th className="p-3 border">Average Score</th>
                <th className="p-3 border">Action</th>

              </tr>
            </thead>

            <tbody>

              {interviews.map((interview) => (

                <tr
                  key={interview._id}   // ✅ FIXED
                  className="text-center hover:bg-gray-50 transition"
                >

                  {/* Date */}
                  <td className="p-3 border">
                    {interview.createdAt
                      ? new Date(interview.createdAt).toLocaleDateString("en-IN")
                      : "No Date"}
                  </td>

                  {/* Score */}
                  <td className="p-3 border font-medium">
                    {interview.averageScore || 0} / 10
                  </td>

                  {/* Action */}
                  <td className="p-3 border">

                    <button
                      onClick={() => {
                        if (!interview._id) {
                          console.error("Invalid interview ID");
                          return;
                        }

                        navigate(`/result/${interview._id}`);
                      }}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition"
                    >
                      View Result
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );
}

export default History;