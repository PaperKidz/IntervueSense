import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  // If no token, redirect to login
  if (!token) {
    console.log('No token found, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  // If token exists, render the protected component
  return children
}

export default ProtectedRoute