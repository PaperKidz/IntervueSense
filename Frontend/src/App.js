import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertCircle, Sparkles, Users, Smile, Activity } from 'lucide-react';

export default function EmotionDetectionApp() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [smoothedEmotions, setSmoothedEmotions] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
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

  useEffect(() => {
    checkApiHealth();
    return () => {
      stopWebcam();
    };
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await response.json();
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (err) {
      setApiStatus('error');
      setError('Cannot connect to backend API. Make sure Flask server is running on port 5000.');
    }
  };

  const startWebcam = async () => {
    try {
      setError(null);
      setAnalysisCount(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
        setTimeout(() => reject(new Error('Timeout waiting for video')), 5000);
      });
      
      await video.play();
      setIsStreaming(true);
      
      setTimeout(() => {
        if (!streamRef.current) return;
        
        const runContinuousAnalysis = async () => {
          while (streamRef.current) {
            await captureAndAnalyze();
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        };
        
        runContinuousAnalysis();
      }, 1500);
      
    } catch (err) {
      setError('Failed to start webcam: ' + err.message);
      stopWebcam();
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    
    emotionHistoryRef.current = [];
    setIsStreaming(false);
    setEmotionData(null);
    setSmoothedEmotions(null);
    setAnalysisCount(0);
    setIsAnalyzing(false);
  };

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

  const captureAndAnalyze = async () => {
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
      
      const response = await fetch('/api/analyze-emotion',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        
        setError(null);
        setLastAnalysisTime(analysisTime);
      } else {
        if (!emotionData) {
          setError(data.error || 'No face detected');
        }
      }
    } catch (err) {
      if (!emotionData) {
        setError('API error: ' + err.message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayData = smoothedEmotions || emotionData;
  
  const dominantColor = displayData?.dominant_emotion 
    ? emotionColors[displayData.dominant_emotion.toLowerCase()] || '#9CA3AF'
    : '#9CA3AF';

  const calculateMetrics = () => {
    if (!displayData?.emotions) return { confidence: 0, nervousness: 0 };
    
    const e = displayData.emotions;
    const positive = (e.happy || 0) + (e.neutral || 0);
    const negative = (e.fear || 0) + (e.sad || 0) + (e.angry || 0) + (e.disgust || 0);
    
    const confidence = Math.max(0, Math.min(100, positive - (negative * 0.5)));
    const nervousness = Math.max(0, Math.min(100, negative * 0.6));
    
    return { confidence, nervousness };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Intervuesense</h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-300">Real-time facial emotion recognition using AI</p>
        </div>

        <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'error' ? 'bg-red-500' : 
              'bg-yellow-500'
            } animate-pulse`}></div>
            <span className="text-sm">
              {apiStatus === 'connected' ? 'API Connected' : 
               apiStatus === 'error' ? 'API Disconnected' : 
               'Checking API...'}
            </span>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm text-blue-300">Live Detection Active</span>
            </div>
          )}
          {analysisCount > 0 && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">
                {analysisCount} analyses
              </span>
            </div>
          )}
          {lastAnalysisTime && (
            <span className="text-xs text-gray-400">
              {lastAnalysisTime}ms
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ paddingBottom: '75%' }}>
                <div className="absolute inset-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ 
                      transform: 'scaleX(-1)',
                      backgroundColor: '#000',
                      display: isStreaming ? 'block' : 'none'
                    }}
                  />
                  
                  {!isStreaming && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Camera className="w-20 h-20 text-gray-500 mb-4" />
                      <p className="text-gray-400">Click Start to begin</p>
                    </div>
                  )}
                  
                  {isStreaming && videoRef.current?.readyState !== 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-white">Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  
                  {isAnalyzing && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs z-20 animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      Analyzing...
                    </div>
                  )}
                  
                  {isStreaming && displayData && displayData.faces && displayData.faces.map((face, idx) => {
                    const videoWidth = videoRef.current?.videoWidth || 640;
                    const videoHeight = videoRef.current?.videoHeight || 480;
                    return (
                      <div
                        key={idx}
                        className="absolute border-4 rounded transition-all duration-300 z-10"
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
                </div>
              </div>
              
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="flex gap-3">
                {!isStreaming ? (
                  <button
                    onClick={startWebcam}
                    disabled={apiStatus === 'error'}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Start Detection
                  </button>
                ) : (
                  <button
                    onClick={stopWebcam}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Stop Detection
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Smile className="w-6 h-6" />
                Current Emotion
              </h3>
              
              {displayData ? (
                <div className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2 animate-pulse"
                    style={{ color: dominantColor }}
                  >
                    {displayData.dominant_emotion.toUpperCase()}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{displayData.face_count} face(s) detected</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Waiting for detection...</p>
                </div>
              )}
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Confidence & Nervousness</h3>
              
              {displayData ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">💪</span>
                        <span className="font-semibold">Confidence</span>
                      </span>
                      <span className="font-bold text-green-400">{metrics.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 to-emerald-500"
                        style={{ width: `${metrics.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">😰</span>
                        <span className="font-semibold">Nervousness</span>
                      </span>
                      <span className="font-bold text-orange-400">{metrics.nervousness.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-red-500"
                        style={{ width: `${metrics.nervousness}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start webcam to see metrics</p>
                </div>
              )}
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Emotion Scores</h3>
              
              {displayData && displayData.emotions ? (
                <div className="space-y-3">
                  {Object.entries(displayData.emotions)
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotion, score]) => (
                      <div key={emotion}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{emotion}</span>
                          <span className="font-semibold">{score.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
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
                  <div className="w-12 h-12 mx-auto mb-2 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                  <p className="text-sm">Start webcam to see scores</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="font-semibold mb-3">How It Works:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
            <li><strong>Start Detection:</strong> Click "Start Detection" button and allow camera permissions</li>
            <li><strong>Real-time Analysis:</strong> Emotions detected continuously with 5-frame averaging for stability</li>
            <li><strong>Live Updates:</strong> Smoothed emotion display reduces jitter and improves accuracy</li>
            <li><strong>Best Results:</strong> Face the camera directly with good lighting</li>
            <li><strong>Performance:</strong> Analysis runs 2 times per second for optimal accuracy</li>
            <li><strong>Confidence & Nervousness:</strong> Real-time metrics calculated from your emotional state</li>
            <li><strong>Multiple Emotions:</strong> The system detects 7 emotions: happy, sad, angry, surprise, fear, disgust, and neutral</li>
          </ul>
        </div>
      </div>
    </div>
  );
}