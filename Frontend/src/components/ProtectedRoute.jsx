// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import authService from "../services/auth.service";

const ProtectedRoute = ({ children }) => {
  const token = authService.getToken();
  
  if (!token) {
    console.warn("ProtectedRoute → No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
