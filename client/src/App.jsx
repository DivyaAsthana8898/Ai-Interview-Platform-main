import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import Analytics from "./pages/Analytics";
import CareerInsights from "./pages/CareerInsights";
import ProtectedRoute from "./components/ProtectedRoute";
import VoiceInterview from "./pages/VoiceInterview";

function App() {
  return (
    <Routes>
      {/* Public Routes */}

      <Route path="/" element={<Register />} />

      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/edit-profile" element={<EditProfile />} />

        <Route path="/interview/:id" element={<Interview />} />
        
        <Route path="/voice-interview/:id" element={<VoiceInterview />} />

        <Route path="/result/:id" element={<Result />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/career-insights" element={<CareerInsights />} />
      </Route>
    </Routes>
  );
}

export default App;
