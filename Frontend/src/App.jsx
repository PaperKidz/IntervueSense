import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Home from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import MainDash from './components/pages/Maindash';
import TheoryPage from './components/pages/TheoryPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ProgressProvider } from './contexts/ProgressContext';
import NavBar from './components/shared/NavBar';
import Footer from './components/shared/Footer';
import authService from './services/auth.service';

function App() {
  const isLoggedIn = authService?.isAuthenticated?.() || !!localStorage.getItem('token');
  const location = useLocation(); // ✅ Use React Router's useLocation hook

  // ✅ Define auth pages where Nav/Footer should be hidden
  const authPages = ['/login', '/signup', '/forgot-password'];
  const hideNavAndFooter = authPages.includes(location.pathname);

  return (
    <ProgressProvider>
      {/* ✅ Conditionally render NavBar */}
      {!hideNavAndFooter && <NavBar />}

      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? '/maindash' : '/home'} replace />}
          />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/maindash"
            element={
              <ProtectedRoute>
                <MainDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* ✅ Conditionally render Footer */}
      {!hideNavAndFooter && <Footer />}
    </ProgressProvider>
  );
}

export default App;