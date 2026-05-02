import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/upload" element={<UploadResume />} />

  {/* ✅ ADD THIS */}
  <Route path="/interview" element={<Interview />} />

  {/* existing */}
  <Route path="/interview/:id" element={<Interview />} />

  <Route path="/result/:id" element={<Result />} />
  <Route path="/history" element={<History />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;