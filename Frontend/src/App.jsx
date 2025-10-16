import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/dashboard'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Route - Your main emotion detection app */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App