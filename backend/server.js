require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

// ✅ Connect DB
connectDB();

// ✅ CORS (Controlled + Safe)
app.use(
  cors({
    origin: "http://localhost:3000", // change in production
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Static folder (safe path)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

// ✅ Test route (VERY IMPORTANT)
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

// ✅ Root
app.get("/", (req, res) => {
  res.send("Backend running");
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});