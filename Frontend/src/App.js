import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertCircle, Sparkles, Users, Smile } from 'lucide-react';

export default function EmotionDetectionApp() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [videoReady, setVideoReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

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
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        setApiStatus('connected');
        setDebugInfo('API connected successfully');
      } else {
        setApiStatus('error');
        setDebugInfo('API returned error status');
      }
    } catch (err) {
      setApiStatus('error');
      setError('Cannot connect to backend API. Make sure Flask server is running on port 5000.');
      setDebugInfo('API connection failed: ' + err.message);
    }
  };

  const startWebcam = async () => {
    try {
      setError(null);
      setVideoReady(false);
      setDebugInfo('Requesting camera access...');
      
      // Wait a bit to ensure refs are ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        setDebugInfo('Video element still not ready, retrying...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (!videoRef.current) {
        throw new Error('Video element not found after waiting');
      }
      
      setDebugInfo('Video element found, requesting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setDebugInfo('Camera access granted');
      streamRef.current = stream;
      
      const video = videoRef.current;
      video.srcObject = stream;
      
      setDebugInfo('Stream attached to video element');
      
      // Wait for metadata
      const loadPromise = new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          setDebugInfo(`Metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
          resolve();
        };
        video.onerror = (e) => {
          setDebugInfo('Video element error: ' + e);
          reject(new Error('Video element error'));
        };
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout waiting for video')), 5000);
      });
      
      await loadPromise;
      
      // Try to play
      setDebugInfo('Attempting to play video...');
      await video.play();
      
      setDebugInfo('Video playing successfully!');
      setVideoReady(true);
      setIsStreaming(true);
      
      // Start analyzing
      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(captureAndAnalyze, 1500);
        setDebugInfo('Analysis started - System ready!');
      }, 1000);
      
    } catch (err) {
      setDebugInfo('Error: ' + err.message);
      setError('Failed to start webcam: ' + err.message);
      stopWebcam();
    }
  };

  const stopWebcam = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setVideoReady(false);
    setEmotionData(null);
    setDebugInfo('Webcam stopped');
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing || !videoReady) {
      return;
    }
    
    if (videoRef.current.readyState !== 4) {
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('http://localhost:5000/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmotionData(data);
        setError(null);
        setDebugInfo(`Detected: ${data.dominant_emotion} (${data.face_count} faces)`);
      } else {
        setError(data.error || 'Failed to analyze emotion');
      }
    } catch (err) {
      if (!emotionData) {
        setError('API error: ' + err.message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dominantColor = emotionData?.dominant_emotion 
    ? emotionColors[emotionData.dominant_emotion.toLowerCase()] || '#9CA3AF'
    : '#9CA3AF';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Emotion Detection System</h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-300">Real-time facial emotion recognition using AI</p>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            apiStatus === 'connected' ? 'bg-green-500' : 
            apiStatus === 'error' ? 'bg-red-500' : 
            'bg-yellow-500'
          } animate-pulse`}></div>
          <span className="text-sm">
            {apiStatus === 'connected' ? 'Connected to API' : 
             apiStatus === 'error' ? 'API Disconnected' : 
             'Checking API...'}
          </span>
        </div>

        {debugInfo && (
          <div className="mb-4 bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-200">Debug: {debugInfo}</p>
          </div>
        )}

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
                  
                  {isStreaming && !videoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-white">Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  
                  {isAnalyzing && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs z-20">
                      Analyzing...
                    </div>
                  )}
                  
                  {videoReady && emotionData && emotionData.faces && emotionData.faces.map((face, idx) => {
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
                    Start Webcam
                  </button>
                ) : (
                  <button
                    onClick={stopWebcam}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Stop Webcam
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
              
              {emotionData ? (
                <div className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2 animate-pulse"
                    style={{ color: dominantColor }}
                  >
                    {emotionData.dominant_emotion.toUpperCase()}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{emotionData.face_count} face(s) detected</span>
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
              <h3 className="text-xl font-semibold mb-4">Emotion Scores</h3>
              
              {emotionData && emotionData.emotions ? (
                <div className="space-y-3">
                  {Object.entries(emotionData.emotions)
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
          <h3 className="font-semibold mb-3">Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
            <li>Make sure Flask backend is running: <code className="bg-black/40 px-2 py-1 rounded">python app.py</code></li>
            <li>Click "Start Webcam" and allow camera permissions</li>
            <li>Face the camera directly for best results</li>
            <li>Emotions are analyzed every 1.5 seconds</li>
            <li>Watch the debug messages for status updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}