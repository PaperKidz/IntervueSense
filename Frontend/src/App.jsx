import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/dashboard";
import NavBar from './components/shared/NavBar';
import Footer from './components/shared/Footer';
import ModuleDashboard from "./components/pages/Maindash";
import ProtectedRoute from "./components/ProtectedRoute";
import { ProgressProvider } from './contexts/ProgressContext';
import TheoryPage from "./components/pages/TheoryPage"; 

function App() {
  const location = useLocation();
  
  // Pages where you DON'T want NavBar/Footer (auth pages)
  const hideNavAndFooter = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  return (
    <ProgressProvider>
      {/* Show NavBar on all pages EXCEPT auth pages */}
      {!hideNavAndFooter && <NavBar />}
      
      <Routes>
        {/* ✅ Public Routes (No NavBar/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ✅ Protected Routes (With NavBar/Footer) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
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

        <Route
          path="/theory"
          element={
            <ProtectedRoute>
              <TheoryPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Show Footer on all pages EXCEPT auth pages */}
      {!hideNavAndFooter && <Footer />}
    </ProgressProvider>
  );
}

export default App;