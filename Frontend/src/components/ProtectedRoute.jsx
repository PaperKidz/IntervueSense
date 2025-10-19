// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import authService from '../services/auth.service';

export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}