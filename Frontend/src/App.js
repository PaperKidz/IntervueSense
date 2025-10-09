import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Activity, Brain, TrendingUp, AlertCircle, CheckCircle, BarChart3, VideoOff, Sparkles } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VirtueSenseDashboard() {
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Real-time emotion data (from your implementation)
  const [emotionData, setEmotionData] = useState(null);
  const [smoothedEmotions, setSmoothedEmotions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  
  // Webcam state
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  
  // Analytics state (from friend's implementation)
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [emotionDistribution, setEmotionDistribution] = useState([
    { name: 'Happy', value: 0, color: '#10b981' },
    { name: 'Neutral', value: 0, color: '#6b7280' },
    { name: 'Sad', value: 0, color: '#3b82f6' },
    { name: 'Angry', value: 0, color: '#ef4444' },
    { name: 'Surprise', value: 0, color: '#f59e0b' },
    { name: 'Fear', value: 0, color: '#8b5cf6' },
    { name: 'Disgust', value: 0, color: '#06B6D4' }
  ]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const emotionHistoryRef = useRef([]);

  const emotionColors = {
    happy: '#10B981',
    sad: '#3B82F6',
    angry: '#EF4444',
    surprise: '#F59E0B',
    fear: '#8B5CF6',
    disgust: '#06B6D4',
    neutral: '#9CA3AF'
  };

  // Stop webcam function
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    emotionHistoryRef.current = [];
    setWebcamActive(false);
  }, []);

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          await response.json();
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        setApiStatus('error');
        setWebcamError('Cannot connect to backend API. Make sure Flask server is running on port 5000.');
      }
    };

    checkApiHealth();
    return () => stopWebcam();
  }, [stopWebcam]);

  // Start webcam
  const startWebcam = async () => {
    try {
      setWebcamError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false 
      });
      
      streamRef.current = stream;
      setWebcamActive(true);
      
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
          };
        }
      }, 100);
      
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setWebcamError('Failed to access webcam. Please allow camera permissions.');
      setWebcamActive(false);
    }
  };

  // Apply stream when video element becomes available
  useEffect(() => {
    if (webcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [webcamActive]);

  // Smooth emotions with 5-frame averaging
  const smoothEmotions = (newEmotions) => {
    const historyLength = 5;
    emotionHistoryRef.current.push(newEmotions);
    
    if (emotionHistoryRef.current.length > historyLength) {
      emotionHistoryRef.current.shift();
    }
    
    const averaged = {};
    const emotionKeys = Object.keys(newEmotions);
    
    emotionKeys.forEach(emotion => {
      const sum = emotionHistoryRef.current.reduce((acc, curr) => acc + (curr[emotion] || 0), 0);
      averaged[emotion] = sum / emotionHistoryRef.current.length;
    });
    
    return averaged;
  };

  // Real API emotion analysis
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!streamRef.current) return;
    if (isAnalyzing) return;
    if (videoRef.current.readyState !== 4) return;
    
    setIsAnalyzing(true);
    const startTime = Date.now();
    const currentCount = analysisCount + 1;
    setAnalysisCount(currentCount);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const analysisTime = Date.now() - startTime;
      
      if (data.success) {
        setEmotionData(data);
        
        const smoothed = smoothEmotions(data.emotions);
        const dominantEmotion = Object.entries(smoothed).reduce((a, b) => 
          smoothed[a[0]] > smoothed[b[0]] ? a : b
        )[0];
        
        setSmoothedEmotions({
          emotions: smoothed,
          dominant_emotion: dominantEmotion,
          face_count: data.face_count,
          faces: data.faces
        });
        
        setWebcamError('');
        setLastAnalysisTime(analysisTime);
      } else {
        if (!emotionData) {
          setWebcamError(data.error || 'No face detected');
        }
      }
    } catch (err) {
      if (!emotionData) {
        setWebcamError('API error: ' + err.message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, analysisCount, emotionData]);

  // Session timer
  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Continuous analysis during session
  useEffect(() => {
    if (!isSessionActive || !webcamActive) return;

    const runAnalysis = async () => {
      while (isSessionActive && streamRef.current) {
        await captureAndAnalyze();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    // Wait for video to be ready
    const timeout = setTimeout(() => {
      if (videoRef.current?.readyState === 4) {
        runAnalysis();
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isSessionActive, webcamActive, captureAndAnalyze]);

  // Calculate metrics function
  const calculateMetrics = useCallback(() => {
    if (!smoothedEmotions?.emotions) return { confidence: 0, attentiveness: 0, nervousness: 0 };
    
    const e = smoothedEmotions.emotions;
    const positive = (e.happy || 0) + (e.neutral || 0) * 0.5;
    const negative = (e.fear || 0) + (e.sad || 0) + (e.angry || 0) + (e.disgust || 0);
    
    const confidence = Math.max(0, Math.min(100, positive - (negative * 0.5)));
    const attentiveness = Math.max(0, Math.min(100, ((e.neutral || 0) + (e.happy || 0) * 0.8) * 0.9));
    const nervousness = Math.max(0, Math.min(100, negative * 0.6 + (e.fear || 0) * 0.4));
    
    return { confidence, attentiveness, nervousness };
  }, [smoothedEmotions]);

  // Update analytics when emotion changes
  useEffect(() => {
    if (!isSessionActive || !smoothedEmotions) return;

    const displayData = smoothedEmotions;
    const metrics = calculateMetrics();

    // Update emotion history for charts
    setEmotionHistory(prev => {
      const newHistory = [...prev, {
        time: sessionTime,
        confidence: metrics.confidence,
        attentiveness: metrics.attentiveness,
        nervousness: metrics.nervousness
      }];
      return newHistory.slice(-30);
    });

    // Update emotion distribution
    setEmotionDistribution(prev => {
      const updated = prev.map(item => {
        const emotionKey = item.name.toLowerCase();
        if (displayData.dominant_emotion.toLowerCase() === emotionKey) {
          return { ...item, value: item.value + 1 };
        }
        return item;
      });
      return updated;
    });
  }, [smoothedEmotions, sessionTime, isSessionActive, calculateMetrics]);

  const startSession = async () => {
    setIsSessionActive(true);
    setSessionTime(0);
    setAnalysisCount(0);
    setEmotionHistory([]);
    setEmotionData(null);
    setSmoothedEmotions(null);
    emotionHistoryRef.current = [];
    setEmotionDistribution([
      { name: 'Happy', value: 0, color: '#10b981' },
      { name: 'Neutral', value: 0, color: '#6b7280' },
      { name: 'Sad', value: 0, color: '#3b82f6' },
      { name: 'Angry', value: 0, color: '#ef4444' },
      { name: 'Surprise', value: 0, color: '#f59e0b' },
      { name: 'Fear', value: 0, color: '#8b5cf6' },
      { name: 'Disgust', value: 0, color: '#06B6D4' }
    ]);
    await startWebcam();
  };

  const stopSession = () => {
    setIsSessionActive(false);
    stopWebcam();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayData = smoothedEmotions || emotionData;
  const dominantColor = displayData?.dominant_emotion 
    ? emotionColors[displayData.dominant_emotion.toLowerCase()] || '#9CA3AF'
    : '#9CA3AF';
  const metrics = calculateMetrics();

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <Icon className="text-gray-400" size={20} />
      </div>
      <div className="text-3xl font-bold" style={{ color }}>{value.toFixed(0)}%</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">VirtueSense</h1>
              </div>
              <p className="text-gray-600">Real-Time Emotion Detection Dashboard</p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* API Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  apiStatus === 'connected' ? 'bg-green-500' : 
                  apiStatus === 'error' ? 'bg-red-500' : 
                  'bg-yellow-500'
                } animate-pulse`}></div>
                <span className="text-sm text-gray-600">
                  {apiStatus === 'connected' ? 'API Connected' : 
                   apiStatus === 'error' ? 'API Error' : 
                   'Checking...'}
                </span>
              </div>

              {/* Analysis Stats */}
              {isSessionActive && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span>{analysisCount} analyses</span>
                  {lastAnalysisTime && (
                    <span className="text-gray-400">({lastAnalysisTime}ms)</span>
                  )}
                </div>
              )}

              {/* Session Timer */}
              <div className="text-right">
                <div className="text-sm text-gray-500">Session Time</div>
                <div className="text-2xl font-mono font-bold text-gray-800">{formatTime(sessionTime)}</div>
              </div>

              {/* Start/Stop Button */}
              {!isSessionActive ? (
                <button
                  onClick={startSession}
                  disabled={apiStatus === 'error'}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Activity size={20} />
                  Start Session
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <AlertCircle size={20} />
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Live Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Feed */}
          <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <div className="absolute inset-0">
              {webcamActive ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Face Detection Boxes */}
                  {displayData?.faces?.map((face, idx) => {
                    const videoWidth = videoRef.current?.videoWidth || 640;
                    const videoHeight = videoRef.current?.videoHeight || 480;
                    return (
                      <div
                        key={idx}
                        className="absolute border-4 rounded transition-all duration-300"
                        style={{
                          left: `${100 - ((face.x + face.width) / videoWidth) * 100}%`,
                          top: `${(face.y / videoHeight) * 100}%`,
                          width: `${(face.width / videoWidth) * 100}%`,
                          height: `${(face.height / videoHeight) * 100}%`,
                          borderColor: dominantColor,
                          boxShadow: `0 0 20px ${dominantColor}`,
                        }}
                      />
                    );
                  })}
                  
                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 z-10">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">LIVE</span>
                  </div>

                  {/* Analyzing Indicator */}
                  {isAnalyzing && (
                    <div className="absolute top-16 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs z-10 animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      Analyzing...
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    {webcamError ? (
                      <>
                        <VideoOff className="mx-auto mb-4 text-red-400" size={48} />
                        <p className="text-red-400 mb-2">Camera Access Error</p>
                        <p className="text-gray-500 text-sm">{webcamError}</p>
                      </>
                    ) : (
                      <>
                        <Camera className="mx-auto mb-4 text-gray-500" size={48} />
                        <p className="text-gray-400">Start session to begin detection</p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span className="text-white text-sm">Offline</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Emotion & Sentiment */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Current Emotion</h2>
              </div>
              <div className="text-center py-6">
                {displayData ? (
                  <>
                    <div 
                      className="text-6xl font-bold mb-2 capitalize" 
                      style={{ color: dominantColor }}
                    >
                      {displayData.dominant_emotion}
                    </div>
                    <div className="text-gray-500 flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />
                      {displayData.face_count} face(s) detected
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl font-bold mb-2 text-gray-300">Neutral</div>
                    <div className="text-gray-400">Waiting for detection...</div>
                  </>
                )}
              </div>
            </div>

            {/* Emotion Scores */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Emotion Scores</h2>
              </div>
              
              {displayData?.emotions ? (
                <div className="space-y-3">
                  {Object.entries(displayData.emotions)
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotion, score]) => (
                      <div key={emotion}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium">{emotion}</span>
                          <span className="font-semibold">{score.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${score}%`,
                              backgroundColor: emotionColors[emotion] || '#9CA3AF'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <div className="w-12 h-12 mx-auto mb-2 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                  <p className="text-sm">Start session to see scores</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Confidence Level" 
            value={metrics.confidence} 
            icon={TrendingUp} 
            color="#10b981" 
          />
          <MetricCard 
            title="Attentiveness" 
            value={metrics.attentiveness} 
            icon={CheckCircle} 
            color="#3b82f6" 
          />
          <MetricCard 
            title="Nervousness" 
            value={metrics.nervousness} 
            icon={AlertCircle} 
            color="#ef4444" 
          />
        </div>

        {/* Charts Section */}
        {emotionHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emotion Trend Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={24} className="text-indigo-600" />
                Emotional Trends
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emotionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence" />
                  <Line type="monotone" dataKey="attentiveness" stroke="#3b82f6" strokeWidth={2} name="Attentiveness" />
                  <Line type="monotone" dataKey="nervousness" stroke="#ef4444" strokeWidth={2} name="Nervousness" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Emotion Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Emotion Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emotionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Session Summary */}
        {!isSessionActive && emotionHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Session Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Average Confidence</div>
                <div className="text-2xl font-bold text-green-600">
                  {emotionHistory.length > 0 
                    ? Math.round(emotionHistory.reduce((sum, item) => sum + item.confidence, 0) / emotionHistory.length)
                    : 0}%
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Average Attentiveness</div>
                <div className="text-2xl font-bold text-blue-600">
                  {emotionHistory.length > 0 
                    ? Math.round(emotionHistory.reduce((sum, item) => sum + item.attentiveness, 0) / emotionHistory.length)
                    : 0}%
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Average Nervousness</div>
                <div className="text-2xl font-bold text-red-600">
                  {emotionHistory.length > 0 
                    ? Math.round(emotionHistory.reduce((sum, item) => sum + item.nervousness, 0) / emotionHistory.length)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}