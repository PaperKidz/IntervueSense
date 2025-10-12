import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Activity, Brain, TrendingUp, AlertCircle, CheckCircle, BarChart3, VideoOff, Sparkles, Mic, MessageSquare } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Remove the hardcoded API_BASE_URL
// Nginx will route /api/ calls to localhost:5000

const interviewQuestions = [
  {
    id: 1,
    question: "Please introduce yourself.",
    description: "Purpose: Tests overall communication clarity, confidence, and ability to present information in a structured and engaging way.",
    instructions: "Start with your full name and current academic or professional status. Briefly mention your educational background, key skills, and one or two personal or career highlights. Keep your tone natural and confident.",
    expectedDuration: 120,
    tips: "Avoid memorized or robotic responses. Maintain eye contact, smile, and show enthusiasm while speaking."
  }
];


export default function VirtueSenseDashboard() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [emotionData, setEmotionData] = useState(null);
  const [smoothedEmotions, setSmoothedEmotions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const [recordingCountdown, setRecordingCountdown] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [audioError, setAudioError] = useState('');
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [currentQuestionIndex] = useState(0);
  const [questionTranscripts, setQuestionTranscripts] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [answerScore, setAnswerScore] = useState(null);
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
  const continuousRecordingRef = useRef(null);
  const recentTranscriptsRef = useRef([]);

  const emotionColors = {
    happy: '#10B981',
    sad: '#3B82F6',
    angry: '#EF4444',
    surprise: '#F59E0B',
    fear: '#8B5CF6',
    disgust: '#06B6D4',
    neutral: '#9CA3AF'
  };

  const calculateSimilarity = useCallback((str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    
    const editDistance = (s1, s2) => {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
      const costs = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    };
    
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  }, []);

  const isDuplicate = useCallback((newText) => {
    const SIMILARITY_THRESHOLD = 0.75;
    const recent = recentTranscriptsRef.current.slice(-3);
    
    console.log(`🔍 Comparing "${newText}" with ${recent.length} recent transcripts:`, recent);
    
    const newLower = newText.toLowerCase().trim();
    const newWords = new Set(newLower.split(/\s+/));
    
    for (const oldText of recent) {
      const oldLower = oldText.toLowerCase().trim();
      const similarity = calculateSimilarity(newLower, oldLower);
      
      console.log(`   📊 Similarity with "${oldText}": ${(similarity * 100).toFixed(1)}%`);
      
      const isNewInOld = oldLower.includes(newLower);
      const isOldInNew = newLower.includes(oldLower);
      
      if (isNewInOld && newText.length < oldText.length * 0.9) {
        console.log(`   🔄 Subset detected (new is within old), skipping`);
        return true;
      }
      
      if (isOldInNew && newText.length > oldText.length * 1.2) {
        console.log(`   ✨ Extended transcript detected, keeping new version`);
        const index = recentTranscriptsRef.current.indexOf(oldText);
        if (index > -1) {
          recentTranscriptsRef.current.splice(index, 1);
        }
        return false;
      }
      
      const oldWords = new Set(oldLower.split(/\s+/));
      const intersection = new Set([...newWords].filter(word => oldWords.has(word)));
      const wordOverlap = intersection.size / Math.min(newWords.size, oldWords.size);
      
      if (wordOverlap > 0.8 && similarity > SIMILARITY_THRESHOLD) {
        console.log(`   ❌ High similarity (${(similarity * 100).toFixed(1)}%) and word overlap (${(wordOverlap * 100).toFixed(1)}%), marking as duplicate`);
        return true;
      }
    }
    
    console.log(`   ✅ Not a duplicate, keeping it`);
    return false;
  }, [calculateSimilarity]);

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

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // UPDATED: Use /api/health instead of hardcoded URL
        const response = await fetch('/api/health');
        if (response.ok) {
          await response.json();
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        setApiStatus('error');
        setWebcamError('Cannot connect to backend. Make sure Flask server is running on port 5000.');
      }
    };

    checkApiHealth();
    return () => {
      stopWebcam();
      if (continuousRecordingRef.current?.intervalId) {
        clearInterval(continuousRecordingRef.current.intervalId);
      }
      continuousRecordingRef.current = null;
    };
  }, [stopWebcam]);

  const startWebcam = async () => {
    try {
      setWebcamError('');
      setAudioError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
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
      setWebcamError('Failed to access webcam/microphone. Please allow camera and microphone permissions.');
      setWebcamActive(false);
    }
  };

  const transcribeAudio = useCallback(async (audioBlob, chunkId) => {
    try {
      console.log(`📝 Transcribing Chunk #${chunkId} - Size: ${audioBlob.size} bytes`);
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        
        try {
          // UPDATED: Use /api/transcribe-audio instead of hardcoded URL
          const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio }),
          });

          const data = await response.json();
          
          console.log(`📥 API Response for Chunk #${chunkId}:`, data);

          if (data.success && data.transcription) {
            const transcriptText = data.transcription.trim();
            
            console.log(`✏️ Checking duplicate for: "${transcriptText}"`);
            
            if (!isDuplicate(transcriptText)) {
              recentTranscriptsRef.current.push(transcriptText);
              
              if (recentTranscriptsRef.current.length > 5) {
                recentTranscriptsRef.current.shift();
              }
              
              const timestamp = new Date().toLocaleTimeString();
              const newTranscription = {
                text: transcriptText,
                timestamp: timestamp,
                id: Date.now() + chunkId,
                chunkId: chunkId
              };
              
              console.log(`✅ Added transcription #${chunkId}: "${transcriptText}"`);
              setTranscriptions(prev => [newTranscription, ...prev]);
              setQuestionTranscripts(prev => [...prev, transcriptText]);
              setAudioError('');
            } else {
              console.log(`⏭️ Skipped duplicate for Chunk #${chunkId}`);
            }
          } else {
            console.log(`⚠️ No transcription for Chunk #${chunkId}:`, data.error);
          }
        } catch (err) {
          console.error(`❌ Transcription error for chunk ${chunkId}:`, err);
        } finally {
          setIsTranscribing(false);
        }
      };
      
      reader.onerror = (err) => {
        console.error(`❌ FileReader error for chunk ${chunkId}:`, err);
        setIsTranscribing(false);
      };
    } catch (err) {
      console.error('❌ Error processing audio:', err);
      setIsTranscribing(false);
    }
  }, [isDuplicate]);

  const startContinuousRecording = useCallback(async () => {
    if (!streamRef.current) {
      setAudioError('Please start the session first');
      return;
    }

    continuousRecordingRef.current = { active: true, intervalId: null };

    let chunkCounter = 0;
    const activeRecorders = new Set();
    
    const recordChunk = async (duration = 8000, chunkLabel = '') => {
      if (!continuousRecordingRef.current?.active || !streamRef.current) {
        activeRecorders.forEach(recorder => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        });
        activeRecorders.clear();
        return;
      }

      try {
        const audioTracks = streamRef.current.getAudioTracks();
        if (audioTracks.length === 0) {
          setAudioError('No audio track available');
          return;
        }

        const audioStream = new MediaStream(audioTracks);
        const chunks = [];
        const chunkId = chunkCounter++;
        
        console.log(`🎙️ Starting ${chunkLabel} (${duration/1000}s) - Chunk #${chunkId}`);
        
        const mediaRecorder = new MediaRecorder(audioStream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        activeRecorders.add(mediaRecorder);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          activeRecorders.delete(mediaRecorder);
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          console.log(`🎬 Stopped ${chunkLabel} - Size: ${audioBlob.size} bytes`);
          
          if (audioBlob.size > 5000) {
            setIsTranscribing(true);
            await transcribeAudio(audioBlob, chunkId);
          } else {
            console.log(`⏭️ Skipping chunk ${chunkId} - too small (${audioBlob.size} bytes)`);
          }
        };

        setIsRecording(true);
        mediaRecorder.start();
        
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, duration);

      } catch (err) {
        console.error('Error in recording:', err);
        setAudioError('Recording error: ' + err.message);
      }
    };

    console.log('🚀 Starting continuous recording system...');
    
    console.log('⏰ Starting First Chunk in 500ms...');
    setTimeout(() => {
      if (continuousRecordingRef.current?.active) {
        recordChunk(8000, 'First Chunk');
      }
    }, 500);
    
    setTimeout(() => {
      if (continuousRecordingRef.current?.active) {
        recordChunk(8000, 'Second Chunk');
      }
    }, 6500);
    
    setTimeout(() => {
      if (continuousRecordingRef.current?.active) {
        recordChunk(8000, 'Third Chunk');
      }
    }, 12500);
    
    setTimeout(() => {
      const intervalId = setInterval(() => {
        if (continuousRecordingRef.current?.active) {
          recordChunk(8000, 'Regular Chunk');
        } else {
          clearInterval(intervalId);
        }
      }, 6000);
      
      if (continuousRecordingRef.current) {
        continuousRecordingRef.current.intervalId = intervalId;
      }
    }, 18500);

  }, [transcribeAudio]);

  const stopContinuousRecording = useCallback(() => {
    if (continuousRecordingRef.current?.intervalId) {
      clearInterval(continuousRecordingRef.current.intervalId);
    }
    
    continuousRecordingRef.current = null;
    setIsRecording(false);
    recentTranscriptsRef.current = [];
  }, []);

  useEffect(() => {
    if (webcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [webcamActive]);

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
      
      // UPDATED: Use /api/analyze-emotion instead of hardcoded URL
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

  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (!isSessionActive || !webcamActive) return;

    const runAnalysis = async () => {
      while (isSessionActive && streamRef.current) {
        await captureAndAnalyze();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    const timeout = setTimeout(() => {
      if (videoRef.current?.readyState === 4) {
        runAnalysis();
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isSessionActive, webcamActive, captureAndAnalyze]);

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

  useEffect(() => {
    if (!isSessionActive || !smoothedEmotions) return;

    const displayData = smoothedEmotions;
    const metrics = calculateMetrics();

    setEmotionHistory(prev => {
      const newHistory = [...prev, {
        time: sessionTime,
        confidence: metrics.confidence,
        attentiveness: metrics.attentiveness,
        nervousness: metrics.nervousness
      }];
      return newHistory.slice(-30);
    });

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

  const evaluateAnswer = async () => {
    if (questionTranscripts.length === 0) {
      setAudioError('No transcript available to evaluate');
      return;
    }

    setIsEvaluating(true);
    const fullAnswer = questionTranscripts.join(' ');
    const currentQuestion = interviewQuestions[currentQuestionIndex];

    try {
      // UPDATED: Use /api/evaluate-answer instead of hardcoded URL
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: fullAnswer,
          description: currentQuestion.description
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnswerScore(data);
      } else {
        setAudioError('Failed to evaluate answer: ' + data.error);
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setAudioError('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetQuestion = () => {
    setQuestionTranscripts([]);
    setAnswerScore(null);
    setTranscriptions([]);
  };

  const startSession = async () => {
    setIsSessionActive(true);
    setSessionTime(0);
    setAnalysisCount(0);
    setEmotionHistory([]);
    setEmotionData(null);
    setSmoothedEmotions(null);
    setTranscriptions([]);
    setAudioError('');
    setRecordingCountdown(0);
    setQuestionTranscripts([]);
    setAnswerScore(null);
    emotionHistoryRef.current = [];
    recentTranscriptsRef.current = [];
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
    
    setRecordingCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setRecordingCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimeout(() => {
      startContinuousRecording();
    }, 3000);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    stopWebcam();
    stopContinuousRecording();
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
  const currentQuestion = interviewQuestions[currentQuestionIndex];

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
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">VirtueSense</h1>
              </div>
              <p className="text-gray-600">AI-Powered Interview Practice Platform</p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
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

              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <Mic className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">Recording</span>
                </div>
              )}

              {isSessionActive && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span>{analysisCount} analyses</span>
                  {lastAnalysisTime && (
                    <span className="text-gray-400">({lastAnalysisTime}ms)</span>
                  )}
                </div>
              )}

              <div className="text-right">
                <div className="text-sm text-gray-500">Session Time</div>
                <div className="text-2xl font-mono font-bold text-gray-800">{formatTime(sessionTime)}</div>
              </div>

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
        {audioError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">Audio Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">{audioError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Question {currentQuestion.id}</h2>
              </div>
              <h3 className="text-3xl font-bold mb-4">{currentQuestion.question}</h3>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-lg leading-relaxed">{currentQuestion.description}</p>
              </div>
            </div>
            {answerScore && (
              <div className="ml-6 bg-white rounded-lg p-6 text-center min-w-[200px]">
                <div className="text-sm text-gray-600 mb-2">Your Score</div>
                <div className="text-6xl font-bold" style={{ 
                  color: answerScore.score >= 7 ? '#10b981' : answerScore.score >= 5 ? '#f59e0b' : '#ef4444' 
                }}>
                  {answerScore.score}
                </div>
                <div className="text-lg text-gray-600 mt-1">/ 10</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <div className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 z-10">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">LIVE</span>
                  </div>

                  {isAnalyzing && (
                    <div className="absolute top-16 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs z-10 animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      Analyzing...
                    </div>
                  )}

                  {isTranscribing && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-blue-500">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-blue-400 font-semibold">Transcribing audio...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {recordingCountdown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
                      <div className="text-center">
                        <div className="text-8xl font-bold text-white mb-4 animate-pulse">
                          {recordingCountdown}
                        </div>
                        <div className="text-2xl text-white">
                          Get ready to speak...
                        </div>
                      </div>
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Your Answer Transcript</h2>
            </div>
            <div className="flex items-center gap-4">
              {transcriptions.length > 0 && (
                <span className="text-sm text-gray-500">{transcriptions.length} segment(s)</span>
              )}
              {isSessionActive && transcriptions.length > 0 && (
                <button
                  onClick={evaluateAnswer}
                  disabled={isEvaluating}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Evaluate Answer
                    </>
                  )}
                </button>
              )}
              {!isSessionActive && transcriptions.length > 0 && (
                <button
                  onClick={resetQuestion}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <AlertCircle size={18} />
                  Reset Question
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Complete Answer:</div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-gray-800 leading-relaxed">
                {transcriptions.length > 0 
                  ? transcriptions.map(t => t.text).reverse().join(' ')
                  : 'No answer recorded yet...'}
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="text-sm font-semibold text-gray-600 mb-2">Individual Segments:</div>
            {transcriptions.length > 0 ? (
              transcriptions.map((transcript) => (
                <div 
                  key={transcript.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">{transcript.timestamp}</span>
                  </div>
                  <p className="text-gray-700">{transcript.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Start speaking to see segments here</p>
              </div>
            )}
          </div>
        </div>

        {answerScore && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">AI Evaluation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                <div className="text-sm text-green-700 font-semibold mb-2">Overall Score</div>
                <div className="text-4xl font-bold text-green-600">{answerScore.score}/10</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="text-sm text-blue-700 font-semibold mb-2">Clarity</div>
                <div className="text-4xl font-bold text-blue-600">{answerScore.clarity}/10</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-500">
                <div className="text-sm text-purple-700 font-semibold mb-2">Relevance</div>
                <div className="text-4xl font-bold text-purple-600">{answerScore.relevance}/10</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Strengths
                </h3>
                <p className="text-green-700">{answerScore.strengths}</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Areas for Improvement
                </h3>
                <p className="text-orange-700">{answerScore.improvements}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Sparkles size={20} />
                  Overall Feedback
                </h3>
                <p className="text-blue-700">{answerScore.feedback}</p>
              </div>
            </div>
          </div>
        )}

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

        {emotionHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {!isSessionActive && emotionHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Session Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Transcriptions</div>
                <div className="text-2xl font-bold text-purple-600">
                  {transcriptions.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}