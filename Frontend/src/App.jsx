import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/dashboard";
import ModuleDashboard from "./components/pages/Maindash";
import ProtectedRoute from "./components/ProtectedRoute";
import { ProgressProvider } from './contexts/ProgressContext';
import TheoryPage from "./components/pages/TheoryPage"; // 1. Import the new TheoryPage

function App() {
  return (
    <ProgressProvider>
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ✅ Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      
      {/* 2. CHANGED: This is your practice page (dashboard.jsx).
           I changed the path to "/practice" to match your 'openPractice' function.
      */}
      <Route
        path="/practice" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/maindash"
        element={
          <ProtectedRoute>
            <ModuleDashboard />
          </ProtectedRoute>
        }
      />

      {/* 3. ADDED: This is the new route for the reusable TheoryPage.
      */}
      <Route
        path="/theory"
        element={
          <ProtectedRoute>
            <TheoryPage />
          </ProtectedRoute>
        }
      />

      {/* 4. CHANGED: Updated catch-all.
           Instead of sending everyone to "/login", we send them to "/".
           If they are logged out, your <ProtectedRoute> will handle
           sending them to /login from there. This is cleaner.
      */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ProgressProvider>
  );
}

export default App;
