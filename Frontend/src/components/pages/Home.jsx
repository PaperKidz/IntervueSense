import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_CONFIG from "../../config/api.config"; // Adjust path as needed

export function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) setUser(response.data.user)
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const startInterview = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-indigo-500 text-xl font-semibold">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-md flex justify-between items-center px-10 py-4">
        <h1 className="text-2xl font-bold text-indigo-500">VirtueSense</h1>
        <div className="flex items-center gap-5 text-gray-700">
          <span>Welcome, {user?.name}!</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md font-semibold transition duration-300 hover:bg-indigo-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-20 px-6">
        <h2 className="text-5xl font-bold mb-4">Master Your Interview Skills</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Get real-time feedback on your emotions, voice, and answers with AI-powered analysis
        </p>
        <button
          onClick={startInterview}
          className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
        >
          Start Interview Practice
        </button>
      </section>

      {/* Features Section */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 px-10 py-16 max-w-6xl mx-auto">
        {[
          { icon: '😊', title: 'Emotion Detection', desc: 'Real-time analysis of your facial expressions and emotions during interviews' },
          { icon: '🎤', title: 'Voice Analysis', desc: 'Evaluate confidence, fluency, and nervousness through comprehensive voice metrics' },
          { icon: '🧠', title: 'Answer Evaluation', desc: 'AI-powered feedback on your responses with scores and improvement suggestions' },
          { icon: '📊', title: 'Progress Tracking', desc: 'Track your improvement over time with detailed analytics and performance metrics' }
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-xl text-center shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-white grid gap-8 sm:grid-cols-2 px-10 py-16 max-w-6xl mx-auto text-center shadow-inner rounded-xl">
        <div>
          <h3 className="text-4xl font-bold text-indigo-500 mb-2">{user?.interview_count || 0}</h3>
          <p className="text-gray-600">Interviews Completed</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-indigo-500 mb-2">Next Level</h3>
          <p className="text-gray-600">Keep practicing to unlock achievements</p>
        </div>
      </section>
    </div>
  )
}
export default Home