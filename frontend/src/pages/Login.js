import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState(""); // ✅ error state

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError(""); // clear error while typing
  };

  // ✅ Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {

    e.preventDefault();

    // ✅ 1. Empty check
    if (!form.email || !form.password) {
      return setError("All fields are required");
    }

    // ✅ 2. Email validation
    if (!emailRegex.test(form.email)) {
      return setError("Email should be like example@gmail.com");
    }

    try {


      const res = await API.post("/auth/login", form);
      console.log("LOGIN RESPONSE:", res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.data.name);

      navigate("/dashboard");

    } catch (error) {

      // ✅ Show backend message
      setError(error.response?.data?.message || "Login failed");

    }

  };


  return (

    <div
      className="min-h-screen flex items-center justify-start pl-20 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/login.jpg')" }}
    >

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-[380px]">

        <h1 className="text-2xl font-bold text-center mb-2">
          AI Interview Platform
        </h1>

        <h2 className="text-lg text-center text-gray-600 mb-6">
          Welcome Back
        </h2>

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <p className="text-red-600 text-sm mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Login
          </button>

        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>

    </div>

  );

}

export default Login;