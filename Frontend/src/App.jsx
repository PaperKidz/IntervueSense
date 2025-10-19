import { Routes, Route, Navigate } from 'react-router-dom'
import {Login} from './components/Auth/Login.jsx'
import {Signup} from './components/Auth/Signup'
import {Home} from './components/pages/home.jsx'
import Dashboard from './components/pages/dashboard'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Home Page - After Login */}
      <Route path="/home" element={<Home />} />
      
      {/* Protected Route - Interview Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App