import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState(""); // ✅ for showing errors

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError(""); // clear error while typing
  };

  // ✅ Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. Empty check
    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }

    // ✅ 2. Email validation
    if (!emailRegex.test(form.email)) {
      return setError("Email should be like example@gmail.com");
    }

    // ✅ 3. Password validation
    if (!passwordRegex.test(form.password)) {
      return setError(
        "Password must be strong:\n• 8+ characters\n• 1 uppercase\n• 1 lowercase\n• 1 number\n• 1 special character\nExample: Strong@123"
      );
    }

    try {

      await API.post("/auth/register", form);

      alert("Registration successful");
      navigate("/");

    } catch (error) {

      // ✅ show backend message if exists
      setError(error.response?.data?.message || "Registration failed");

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
          Create Account
        </h2>

        {/* ✅ ERROR MESSAGE UI */}
        {error && (
          <p className="text-red-600 text-sm mb-3 whitespace-pre-line">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

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
            Create Account
          </button>

        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>

  );

}

export default Register;