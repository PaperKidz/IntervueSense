import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../shared/NavBar'; // Import the custom hook
import {
  Sparkles, Play, Smile, Mic, Brain, TrendingUp,
  Target, Zap, Award, Users, ChevronRight
} from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStatus(); // Use the custom hook

  const handleNavigate = (path) => {
    switch (path) {
      case '/home':
        navigate('/home');
        break;

      case '/practice':
      case '/dashboard':
        if (isLoggedIn) navigate('/dashboard');
        else navigate('/signup');
        break;

      case '/maindash':
      case '/get-started':
      case '/signup':
        if (isLoggedIn) navigate('/maindash');
        else navigate('/signup');
        break;

      default:
        navigate(path);
        break;
    }
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
      {/* Hero Section */}
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
                  onClick={() => handleNavigate(isLoggedIn ? '/maindash' : '/signup')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105"
                >
                  {isLoggedIn ? 'Continue Learning' : 'Get Started'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative flex justify-center">
              <div className="w-80 h-80 lg:w-[420px] lg:h-[420px]">
                <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circles */}
                  <circle cx="380" cy="120" r="60" fill="#FEF3C7" opacity="0.6"/>
                  <circle cx="150" cy="400" r="80" fill="#FBCFE8" opacity="0.5"/>
                  <circle cx="420" cy="380" r="50" fill="#DDD6FE" opacity="0.4"/>
                  
                  {/* Decorative dots */}
                  <circle cx="200" cy="100" r="4" fill="#A78BFA"/>
                  <circle cx="350" cy="200" r="3" fill="#F472B6"/>
                  <circle cx="100" cy="250" r="3" fill="#FBBF24"/>
                  <circle cx="420" cy="300" r="4" fill="#8B5CF6"/>
                  
                  {/* Star decoration */}
                  <g transform="translate(380, 160)">
                    <path d="M0,-8 L2,0 L10,2 L2,4 L0,12 L-2,4 L-10,2 L-2,0 Z" fill="#FBBF24"/>
                  </g>
                  
                  {/* Laptop */}
                  <g transform="translate(250, 280)">
                    {/* Screen */}
                    <rect x="-120" y="-90" width="240" height="150" rx="8" fill="#8B5CF6"/>
                    <rect x="-110" y="-80" width="220" height="130" rx="4" fill="#FFFFFF"/>
                    
                    {/* Screen content */}
                    <rect x="-90" y="-60" width="80" height="6" rx="3" fill="#DDD6FE"/>
                    <rect x="-90" y="-45" width="120" height="6" rx="3" fill="#DDD6FE"/>
                    <rect x="-90" y="-30" width="100" height="6" rx="3" fill="#DDD6FE"/>
                    
                    {/* Play button on screen */}
                    <circle cx="50" cy="-20" r="25" fill="#F3F4F6"/>
                    <circle cx="50" cy="-20" r="18" fill="#8B5CF6" opacity="0.3"/>
                    
                    {/* Keyboard base */}
                    <rect x="-130" y="65" width="260" height="15" rx="8" fill="#6D28D9"/>
                    
                    {/* Keyboard perspective */}
                    <path d="M-120,60 L-130,65 L130,65 L120,60 Z" fill="#7C3AED"/>
                  </g>
                  
                  {/* Person */}
                  <g transform="translate(250, 310)">
                    {/* Head */}
                    <circle cx="0" cy="-50" r="28" fill="#FCD34D"/>
                    
                    {/* Face details */}
                    <circle cx="-8" cy="-55" r="3" fill="#374151"/>
                    <circle cx="8" cy="-55" r="3" fill="#374151"/>
                    <path d="M-8,-45 Q0,-42 8,-45" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    
                    {/* Body */}
                    <rect x="-35" y="-25" width="70" height="60" rx="35" fill="#8B5CF6"/>
                    
                    {/* Arms */}
                    <ellipse cx="-40" cy="0" rx="12" ry="35" fill="#7C3AED"/>
                    <ellipse cx="40" cy="0" rx="12" ry="35" fill="#7C3AED"/>

                    {/* Hands */}
                    <circle cx="-50" cy="30" r="10" fill="#FCD34D"/>
                    <circle cx="50" cy="30" r="10" fill="#FCD34D"/>
                    
                    {/* Lower body */}
                    <rect x="-30" y="35" width="60" height="15" rx="8" fill="#6D28D9"/>
                  </g>
                  
                  {/* Code symbol */}
                  <g transform="translate(100, 180)">
                    <circle r="20" fill="#C7D2FE" opacity="0.8"/>
                    <text x="0" y="8" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#4F46E5">&lt;/&gt;</text>
                  </g>
            
                  {/* Window icon */}
                  <g transform="translate(400, 240)">
                    <rect x="-15" y="-12" width="30" height="24" rx="2" fill="#DBEAFE"/>
                    <rect x="-12" y="-10" width="24" height="20" fill="#3B82F6" opacity="0.3"/>
                    <line x1="0" y1="-10" x2="0" y2="10" stroke="#3B82F6" strokeWidth="2"/>
                  </g>
                  
                  {/* Checkmark */}
                  <g transform="translate(120, 320)">
                    <circle r="18" fill="#BBF7D0" opacity="0.9"/>
                    <path d="M-6,0 L-2,6 L8,-6" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>

                  {/* Lines icon */}
                  <g transform="translate(380, 140)">
                    <circle r="16" fill="#FED7AA" opacity="0.8"/>
                    <path d="M-6,-4 Q0,-8 6,-4 M-6,0 Q0,4 6,0 M-6,4 Q0,8 6,4" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </g>
                  
                  {/* Plus signs */}
                  <g transform="translate(180, 140)">
                    <line x1="-6" y1="0" x2="6" y2="0" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="-6" x2="0" y2="6" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                  
                  <g transform="translate(340, 340)">
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Platform Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Best Platform</span><br />
              To Master Interview Skills
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:-translate-y-2">
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
            onClick={() => handleNavigate(isLoggedIn ? '/maindash' : '/signup')}
            className="bg-white hover:bg-gray-100 text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-xl hover:shadow-2xl inline-flex items-center gap-2 cursor-pointer transform hover:scale-105"
          >
            {isLoggedIn ? 'Continue Learning' : 'Start Your Journey'}
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
    </div>
  );
}