import { useState } from 'react';
import {
  Sparkles, Play, Smile, Mic, Brain, TrendingUp, 
  Target, Zap, Award, Users, ChevronRight, Menu, X
} from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Replace these with your actual navigation function from React Router
  // Example: const navigate = useNavigate();
  const handleNavigate = (path) => {
    // For now, using window.location
    // Replace with: navigate(path);
    window.location.href = path;
  };

  const features = [
    {
      icon: <Smile className="w-12 h-12" />,
      title: "Emotion Detection",
      description: "Real-time analysis of your facial expressions and emotions during interviews",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Mic className="w-12 h-12" />,
      title: "Voice Analysis",
      description: "Evaluate confidence, fluency, and nervousness through comprehensive voice metrics",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Answer Evaluation",
      description: "AI-powered feedback on your responses with scores and improvement suggestions",
      color: "from-pink-400 to-purple-500"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Progress Tracking",
      description: "Track your improvement over time with detailed analytics and performance metrics",
      color: "from-green-400 to-emerald-500"
    }
  ];

  const howItWorks = [
    {
      icon: <Target className="w-16 h-16" />,
      title: "Set Your Goal",
      description: "Choose your interview type and select the questions you want to practice. Set your goals and get ready to improve your interview skills.",
      color: "text-purple-600"
    },
    {
      icon: <Play className="w-16 h-16" />,
      title: "Start Practicing",
      description: "Begin your practice session with AI monitoring. Our system captures your video, analyzes your voice, and tracks your emotions in real-time as you answer questions.",
      color: "text-blue-600"
    },
    {
      icon: <Zap className="w-16 h-16" />,
      title: "Real-time Feedback",
      description: "Get instant insights on your performance. Track your confidence, engagement, and composure levels while you practice, helping you adjust and improve on the fly.",
      color: "text-indigo-600"
    },
    {
      icon: <Award className="w-16 h-16" />,
      title: "Achieve Excellence",
      description: "Review comprehensive analytics and detailed feedback. Identify your strengths, work on improvements, and watch your interview skills reach the next level.",
      color: "text-green-600"
    }
  ];

  const instructors = [
    {
      name: "Sarah Johnson",
      role: "Senior HR Manager",
      company: "Tech Corp",
      image: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Michael Chen",
      role: "Interview Coach",
      company: "Career Plus",
      image: "https://i.pravatar.cc/150?img=13"
    },
    {
      name: "Emily Rodriguez",
      role: "Talent Acquisition Lead",
      company: "Innovation Labs",
      image: "https://i.pravatar.cc/150?img=5"
    },
    {
      name: "David Kumar",
      role: "Career Counselor",
      company: "Future Skills",
      image: "https://i.pravatar.cc/150?img=12"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('/')}>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">VirtueSense</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">How It Works</a>
              <a href="#instructors" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Instructors</a>

              <button
                onClick={() => handleNavigate('/login')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavigate('/signup')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Create Account
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium">How It Works</a>
                <a href="#instructors" className="text-gray-700 hover:text-indigo-600 font-medium">Instructors</a>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - REPLACED with an inline SVG character (no external image) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Let's <span className="text-gray-900">Explore</span>
                <br />
                A <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Magical</span>
                <br />
                <span className="text-gray-900">Way To</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">learn</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Provides you with the latest online interview coaching and material that help your knowledge growing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className="bg-white hover:bg-gray-50 text-indigo-600 px-8 py-4 rounded-lg font-semibold border-2 border-indigo-600 transition-colors"
                >
                  Try Demo
                </button>
              </div>
            </div>

            {/* Inline SVG Character */}
            <div className="relative flex justify-center">
              <div className="w-80 h-80 lg:w-[420px] lg:h-[420px]">
                {/* SVG: original, responsive, animated via SMIL (works in modern browsers) */}
                <svg
                  role="img"
                  aria-label="Illustration of a person learning with a laptop and AI sparkles"
                  viewBox="0 0 400 400"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="gradBody" x1="0" x2="1">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                    <linearGradient id="gradLaptop" x1="0" x2="1">
                      <stop offset="0%" stopColor="#C7B2FF" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#4338CA" floodOpacity="0.08" />
                    </filter>
                  </defs>

                  {/* floating group */}
                  <g id="floatGroup" transform="translate(0,0)">
                    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -12; 0 0" dur="4s" repeatCount="indefinite" />

                    {/* Ground / desk */}
                    <rect x="40" y="300" width="320" height="18" rx="6" fill="#EEF2FF" />

                    {/* Laptop */}
                    <g transform="translate(120,210)">
                      <rect x="-70" y="20" width="140" height="8" rx="2" fill="#E6E9FF" />
                      <rect x="-60" y="-6" width="120" height="70" rx="8" fill="url(#gradLaptop)" filter="url(#softShadow)" />
                      <rect x="-52" y="2" width="104" height="46" rx="6" fill="#FFFFFF" opacity="0.95" />
                      <rect x="-30" y="40" width="60" height="6" rx="2" fill="#EEF2FF" />
                    </g>

                    {/* Body */}
                    <g transform="translate(200,180)">
                      {/* legs */}
                      <rect x="-36" y="82" width="24" height="36" rx="6" fill="#4C51BF" />
                      <rect x="12" y="82" width="24" height="36" rx="6" fill="#4C51BF" />

                      {/* torso */}
                      <rect x="-50" y="20" width="100" height="70" rx="18" fill="url(#gradBody)" />

                      {/* arms (one resting near laptop) */}
                      <path d="M -48 44 q -10 8 -6 20 q 6 14 24 6" fill="#7C3AED" opacity="0.95" transform="translate(-6,0) rotate(-10)" />
                      <path d="M 48 44 q 10 8 6 20 q -6 14 -24 6" fill="#7C3AED" opacity="0.95" transform="translate(6,0) rotate(10)" />

                      {/* head */}
                      <circle cx="0" cy="-10" r="28" fill="#FFD7A8" />
                      {/* hair */}
                      <path d="M -22 -18 q 22 -26 44 0 q -26 -6 -44 6" fill="#2B2A4A" />

                      {/* smile */}
                      <path d="M -10 -2 q 10 12 20 0" stroke="#3F3D56" strokeWidth="3" fill="none" strokeLinecap="round" />

                      {/* cheek spark */}
                      <circle cx="14" cy="-2" r="3" fill="#FFB6C1">
                        <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    </g>

                    {/* AI sparkles floating around */}
                    <g>
                      <circle cx="260" cy="110" r="6" fill="#FDE68A" opacity="0.9">
                        <animate attributeName="cy" values="110;92;110" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="310" cy="150" r="4" fill="#60A5FA" opacity="0.85">
                        <animate attributeName="cy" values="150;136;150" dur="2.6s" repeatCount="indefinite" begin="0.2s" />
                        <animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" repeatCount="indefinite" begin="0.2s" />
                      </circle>
                      <circle cx="120" cy="70" r="5" fill="#A78BFA" opacity="0.9">
                        <animate attributeName="cy" values="70;56;70" dur="3.6s" repeatCount="indefinite" begin="0.6s" />
                        <animate attributeName="opacity" values="0.25;1;0.25" dur="3.6s" repeatCount="indefinite" begin="0.6s" />
                      </circle>

                      {/* little star sparkle */}
                      <g transform="translate(280,90)">
                        <path d="M0 -6 L1.8 -1 L6 -1 L2.6 1 L4 6 L0 3 L-4 6 L-2.6 1 L-6 -1 L-1.8 -1 Z" fill="#FFD166" opacity="0.95">
                          <animateTransform attributeName="transform" type="rotate" values="0 0 0; 20 0 0; 0 0 0" dur="5s" repeatCount="indefinite" />
                        </path>
                      </g>
                    </g>

                  </g>

                </svg>
              </div>

              {/* decorative floating blobs */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-400 rounded-full opacity-20"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Best Platform Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Best Platform</span>
              <br />
              To Master Interview Skills
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:-translate-y-2"
              >
                <div className={`inline-block p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <button className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 group">
                  Learn More
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master your interview skills in four simple steps with AI-powered coaching
            </p>
          </div>

          <div className="space-y-12">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
              >
                <div className="flex-1">
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="inline-block mb-4">
                      <div className={`p-4 bg-gradient-to-br ${
                        index === 0 ? 'from-purple-100 to-purple-200' :
                        index === 1 ? 'from-blue-100 to-blue-200' :
                        index === 2 ? 'from-indigo-100 to-indigo-200' :
                        'from-green-100 to-green-200'
                      } rounded-2xl`}>
                        <div className={step.color}>
                          {step.icon}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                  </div>
                </div>

                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <div className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${
                      index === 0 ? 'from-purple-400 to-purple-600' :
                      index === 1 ? 'from-blue-400 to-blue-600' :
                      index === 2 ? 'from-indigo-400 to-indigo-600' :
                      'from-green-400 to-green-600'
                    } shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform`}>
                      <div className="text-white text-8xl font-bold opacity-20">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Instructors */}
      <section id="instructors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold mb-2">Tutors</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the Experts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-Circle, instructors right all over the world students. We offer the knowledge and success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center border border-gray-100 hover:-translate-y-2"
              >
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-100"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{instructor.name}</h3>
                <p className="text-indigo-600 font-semibold mb-1">{instructor.role}</p>
                <p className="text-gray-500 text-sm">{instructor.company}</p>
                <div className="flex justify-center gap-3 mt-4">
                  <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    <Users size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Take Your Interview Experience to the next level
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful candidates who improved their interview skills with VirtueSense
          </p>
          <button
            onClick={() => handleNavigate('/signup')}
            className="bg-white hover:bg-gray-100 text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg transition-colors shadow-xl hover:shadow-2xl inline-flex items-center gap-2"
          >
            Start Your Journey
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-indigo-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8 leading-relaxed">
              "VirtueSense was fantastic! It is a master platform for those looking to start a new career, or need a refresher."
            </p>
            <div className="flex items-center justify-center gap-4">
              <img
                src="https://i.pravatar.cc/150?img=8"
                alt="Jenny Dyso"
                className="w-16 h-16 rounded-full border-4 border-indigo-100"
              />
              <div className="text-left">
                <p className="font-bold text-gray-900">Jenny Dyso</p>
                <p className="text-gray-600">Product Designer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VirtueSense</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered interview coaching platform for career success.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Overview</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Instructors</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">News</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 VirtueSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
