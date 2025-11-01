
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';
import {
    Sparkles, Play, Square, MessageSquare, VideoOff, Camera, CheckCircle, TrendingUp, RotateCcw, ArrowLeft
} from 'lucide-react';

import API_CONFIG from "../../config/api.config";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { getQuestionByIds } from '../../data/questionsData'; // ✅ Import questions data

export default function VirtueSenseDashboard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { completePractice } = useProgress();
    
    const moduleId = searchParams.get('module');
    const sectionId = searchParams.get('section');
    const practiceId = searchParams.get('practice');

    // ✅ Get the current question from the questions database
    const currentQuestion = getQuestionByIds(moduleId, sectionId, practiceId);
    const interviewQuestions = [currentQuestion];

    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [emotionData, setEmotionData] = useState(null);
    const [smoothedEmotions, setSmoothedEmotions] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [webcamActive, setWebcamActive] = useState(false);
    const [webcamError, setWebcamError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptions, setTranscriptions] = useState([]);
    const [emotionHistory, setEmotionHistory] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionTranscripts, setQuestionTranscripts] = useState([]);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [answerScore, setAnswerScore] = useState(null);
    const [voiceAnalysis, setVoiceAnalysis] = useState(null);
    const [emotionDistribution, setEmotionDistribution] = useState([
        { name: 'Happy', value: 0, color: '#10b981' },
        { name: 'Neutral', value: 0, color: '#6b7280' },
        { name: 'Sad', value: 0, color: '#3b82f6' },
        { name: 'Angry', value: 0, color: '#ef4444' },
        { name: 'Surprise', value: 0, color: '#f59e0b' },
        { name: 'Fear', value: 0, color: '#8b5cf6' },
        { name: 'Disgust', value: 0, color: '#06B6D4' }
    ]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const emotionHistoryRef = useRef([]);
    const continuousRecordingRef = useRef(null);
    const recentTranscriptsRef = useRef([]);
    const analysisIntervalRef = useRef(null);
    const sessionActiveRef = useRef(false);

    const emotionColors = {
        happy: '#10B981',
        sad: '#3B82F6',
        angry: '#EF4444',
        surprise: '#F59E0B',
        fear: '#8B5CF6',
        disgust: '#06B6D4',
        neutral: '#9CA3AF'
    };

    // ✅ DEFINE calculateMetrics EARLY - before it's used
    const calculateMetrics = useCallback(() => {
        if (!smoothedEmotions?.emotions) return { confidence: 0, engagement: 0, composure: 0 };

        const e = smoothedEmotions.emotions;
        const positive = (e.happy || 0) + (e.neutral || 0) * 0.7;
        const negative = (e.fear || 0) + (e.sad || 0) + (e.angry || 0);

        const confidence = Math.max(0, Math.min(100, positive * 1.2 - (negative * 0.3)));
        const engagement = Math.max(0, Math.min(100, ((e.neutral || 0) * 0.9 + (e.happy || 0)) * 1.1));
        const composure = Math.max(0, Math.min(100, 100 - (negative * 0.4)));

        return { confidence, engagement, composure };
    }, [smoothedEmotions]);

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
        const newLower = newText.toLowerCase().trim();
        const newWords = new Set(newLower.split(/\s+/));

        for (const oldText of recent) {
            const oldLower = oldText.toLowerCase().trim();
            const similarity = calculateSimilarity(newLower, oldLower);
            const isNewInOld = oldLower.includes(newLower);
            const isOldInNew = newLower.includes(oldLower);

            if (isNewInOld && newText.length < oldText.length * 0.9) {
                return true;
            }

            if (isOldInNew && newText.length > oldText.length * 1.2) {
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
                return true;
            }
        }

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

    const analyzeVoiceChunk = useCallback(async (base64Audio, transcript, audioBlobSize) => {
        if (!sessionActiveRef.current) {
            return;
        }
        
        try {
            const estimatedDuration = (audioBlobSize / 1024) * 0.1;

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.ANALYZE_VOICE}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    transcript: transcript,
                    duration: estimatedDuration
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && sessionActiveRef.current) {
                setVoiceAnalysis(data);
            }
        } catch (err) {
            console.error('❌ Voice analysis error:', err);
        }
    }, []);

    const transcribeAudio = useCallback(async (audioBlob, chunkId) => {
        if (!sessionActiveRef.current) {
            return;
        }

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                const base64Audio = reader.result;

                try {
                    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.TRANSCRIBE_AUDIO}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audio: base64Audio }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();

                    if (!sessionActiveRef.current) {
                        return;
                    }

                    if (data.success && data.transcription) {
                        const transcriptText = data.transcription.trim();
                        
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

                            setTranscriptions(prev => [newTranscription, ...prev]);
                            setQuestionTranscripts(prev => [...prev, transcriptText]);

                            if (sessionActiveRef.current) {
                                analyzeVoiceChunk(base64Audio, transcriptText, audioBlob.size);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                } finally {
                    setIsTranscribing(false);
                }
            };

            reader.onerror = (err) => {
                console.error('FileReader error:', err);
                setIsTranscribing(false);
            };
        } catch (err) {
            console.error('Transcribe audio error:', err);
            setIsTranscribing(false);
        }
    }, [isDuplicate, analyzeVoiceChunk]);

    const startContinuousRecording = useCallback(async () => {
        if (!streamRef.current || !sessionActiveRef.current) {
            console.error('Cannot start recording - missing stream or session inactive');
            return;
        }

        continuousRecordingRef.current = { active: true, intervalId: null };

        let chunkCounter = 0;
        const activeRecorders = new Set();

        const recordChunk = async (duration = 8000) => {
            if (!continuousRecordingRef.current?.active || !streamRef.current || !sessionActiveRef.current) {
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
                    console.warn('No audio tracks available');
                    return;
                }

                const audioStream = new MediaStream(audioTracks);
                const chunks = [];
                const chunkId = chunkCounter++;

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

                    if (audioBlob.size > 5000 && sessionActiveRef.current) {
                        setIsTranscribing(true);
                        await transcribeAudio(audioBlob, chunkId);
                    }
                };

                mediaRecorder.onerror = (error) => {
                    console.error(`MediaRecorder error for chunk #${chunkId}:`, error);
                };

                setIsRecording(true);
                mediaRecorder.start();

                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                }, duration);

            } catch (err) {
                console.error('Record chunk error:', err);
            }
        };

        setTimeout(() => recordChunk(8000), 500);
        setTimeout(() => recordChunk(8000), 6500);
        setTimeout(() => recordChunk(8000), 12500);

        setTimeout(() => {
            const intervalId = setInterval(() => {
                if (continuousRecordingRef.current?.active && sessionActiveRef.current) {
                    recordChunk(8000);
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

    const captureAndAnalyze = useCallback(async () => {
        if (!isSessionActive || !sessionActiveRef.current || !videoRef.current || !canvasRef.current) return;
        if (!streamRef.current) return;
        if (isAnalyzing) return;
        if (videoRef.current.readyState !== 4) return;

        setIsAnalyzing(true);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg', 0.95);

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.ANALYZE_EMOTION}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!sessionActiveRef.current) {
                return;
            }

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
            }
        } catch (err) {
            console.error('Capture error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing, isSessionActive]);

    const startWebcam = async () => {
        try {
            setWebcamError('');

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
            setWebcamError('Unable to access camera and microphone. Please check your permissions.');
            setWebcamActive(false);
        }
    };

    const evaluateAnswer = async () => {
        if (questionTranscripts.length === 0) return;

        setIsEvaluating(true);
        const fullAnswer = questionTranscripts.join(' ');

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERVIEW.EVALUATE_ANSWER}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQuestion.question,
                    answer: fullAnswer
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAnswerScore(data);
            }
        } catch (err) {
            console.error('❌ Error evaluating answer:', err);
        } finally {
            setIsEvaluating(false);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < interviewQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionTranscripts([]);
            setAnswerScore(null);
            setTranscriptions([]);
        }
    };

    const resetSession = () => {
        setCurrentQuestionIndex(0);
        setQuestionTranscripts([]);
        setAnswerScore(null);
        setTranscriptions([]);
        setEmotionHistory([]);
        setVoiceAnalysis(null);
    };

    const startSession = async () => {
        setIsSessionActive(true);
        sessionActiveRef.current = true;
        
        setSessionTime(0);
        setEmotionHistory([]);
        setEmotionData(null);
        setSmoothedEmotions(null);
        setTranscriptions([]);
        setWebcamError('');
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

        setTimeout(() => {
            if (sessionActiveRef.current && streamRef.current) {
                console.log('✅ Starting continuous recording');
                startContinuousRecording();
            }
        }, 2000);
    };

    const stopSession = () => {
        setIsSessionActive(false);
        sessionActiveRef.current = false;
        
        stopWebcam();
        stopContinuousRecording();
        
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
    };

    const handleCompleteSession = async () => {
    if (!moduleId || !sectionId || !practiceId) {
        console.error('Missing practice identifiers');
        return;
    }

    try {
        const sessionData = {
            overallScore,
            averageConfidence: emotionHistory.reduce((sum, item) => sum + item.confidence, 0) / emotionHistory.length,
            averageEngagement: emotionHistory.reduce((sum, item) => sum + item.engagement, 0) / emotionHistory.length,
            answerScore: answerScore?.score || 0,
            sessionDuration: sessionTime,
            transcriptCount: transcriptions.length
        };

        await completePractice(moduleId, sectionId, practiceId, sessionData);
        
        // Show modal instead of alert
        setShowSuccessModal(true);

    } catch (error) {
        console.error('Failed to save progress:', error);
        alert('Failed to save progress. Please try again.');
    }
};

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopWebcam();
            if (continuousRecordingRef.current?.intervalId) {
                clearInterval(continuousRecordingRef.current.intervalId);
            }
            if (analysisIntervalRef.current) {
                clearInterval(analysisIntervalRef.current);
            }
            continuousRecordingRef.current = null;
        };
    }, [stopWebcam]);

    // Session timer
    useEffect(() => {
        if (!isSessionActive) return;

        const interval = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isSessionActive]);

    // Emotion analysis
    useEffect(() => {
        if (!isSessionActive || !webcamActive) {
            if (analysisIntervalRef.current) {
                clearInterval(analysisIntervalRef.current);
                analysisIntervalRef.current = null;
            }
            return;
        }

        const timeout = setTimeout(() => {
            if (videoRef.current?.readyState === 4) {
                analysisIntervalRef.current = setInterval(() => {
                    if (isSessionActive && streamRef.current) {
                        captureAndAnalyze();
                    }
                }, 500);
            }
        }, 1500);

        return () => {
            clearTimeout(timeout);
            if (analysisIntervalRef.current) {
                clearInterval(analysisIntervalRef.current);
                analysisIntervalRef.current = null;
            }
        };
    }, [isSessionActive, webcamActive, captureAndAnalyze]);

    // Update emotion history
    useEffect(() => {
        if (!isSessionActive || !smoothedEmotions) return;

        const displayData = smoothedEmotions;
        const metrics = calculateMetrics();

        setEmotionHistory(prev => {
            const newHistory = [...prev, {
                time: sessionTime,
                confidence: metrics.confidence,
                engagement: metrics.engagement,
                composure: metrics.composure
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

    const displayData = smoothedEmotions || emotionData;
    const dominantColor = displayData?.dominant_emotion
        ? emotionColors[displayData.dominant_emotion.toLowerCase()] || '#9CA3AF'
        : '#9CA3AF';
    const metrics = calculateMetrics();

    const overallScore = emotionHistory.length > 0
        ? Math.round(
            (emotionHistory.reduce((sum, item) => sum + item.confidence, 0) / emotionHistory.length +
                emotionHistory.reduce((sum, item) => sum + item.engagement, 0) / emotionHistory.length +
                emotionHistory.reduce((sum, item) => sum + item.composure, 0) / emotionHistory.length) / 3
        )
        : 0;
    const handleContinue = () => {
    setShowSuccessModal(false);
    navigate(`/maindash?module=${moduleId}`);
};    
    const radarData = voiceAnalysis ? [
        {
            metric: 'Confidence',
            score: Math.round((metrics.confidence + voiceAnalysis.scores.confidence) / 2),
        },
        {
            metric: 'Fluency',
            score: Math.round(voiceAnalysis.scores.fluency),
        },
        {
            metric: 'Engagement',
            score: Math.round(metrics.engagement),
        },
        {
            metric: 'Composure',
            score: Math.round(metrics.composure),
        },
        {
            metric: 'Clarity',
            score: answerScore ? Math.round(answerScore.clarity * 10) : 0,
        },
    ] : [];
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">     
            {/* Top Navigation Bar */}
        <div className="max-w-7xl mx-auto mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Module</span>
                </button>
                
                <div className="flex items-center gap-4">
                    {isRecording && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-red-700 font-medium">Recording</span>
                        </div>
                    )}
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Session Time</div>
                        <div className="text-2xl font-mono font-bold text-gray-900">{formatTime(sessionTime)}</div>
                    </div>
                    {!isSessionActive ? (
                        <button
                            onClick={startSession}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Play size={20} />
                            Start Practice
                        </button>
                    ) : (
                        <button
                            onClick={stopSession}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Square size={20} />
                            End Session
                        </button>
                    )}
                </div>
            </div>
        </div>               
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Question Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <MessageSquare className="w-6 h-6" />
                                <h2 className="text-lg font-semibold">Question {currentQuestion.id} of {interviewQuestions.length}</h2>
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{currentQuestion.question}</h3>
                            <div className="flex items-center gap-2 text-indigo-100">
                                <span className="text-sm">Recommended time: {currentQuestion.expectedDuration}s</span>
                            </div>
                        </div>
                        {answerScore && (
                            <div className="ml-6 bg-white rounded-xl p-6 text-center min-w-[160px] shadow-xl">
                                <div className="text-sm text-gray-600 mb-2">Score</div>
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Feed */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0, position: 'relative' }}>
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

                                        {isTranscribing && (
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-sm text-blue-400 font-semibold">Processing speech...</span>
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
                                                    <p className="text-red-400 mb-2">Camera Access Required</p>
                                                    <p className="text-gray-500 text-sm">{webcamError}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="mx-auto mb-4 text-gray-500" size={48} />
                                                    <p className="text-gray-400">Click "Start Practice" to begin</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Real-time Metrics */}
                    <div className="space-y-4">
                        {/* Current Emotion */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Current State</h3>
                            <div className="text-center">
                                {displayData ? (
                                    <>
                                        <div
                                            className="text-4xl font-bold mb-2 capitalize"
                                            style={{ color: dominantColor }}
                                        >
                                            {displayData.dominant_emotion}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            {displayData.face_count} face detected
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-4xl font-bold mb-2 text-gray-300">Ready</div>
                                        <div className="text-gray-400 text-sm">Waiting to start...</div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Live Performance Metrics */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-600 mb-4">Performance</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">Confidence</span>
                                        <span className="font-bold text-green-600">{Math.round(metrics.confidence)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${metrics.confidence}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">Engagement</span>
                                        <span className="font-bold text-blue-600">{Math.round(metrics.engagement)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${metrics.engagement}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">Composure</span>
                                        <span className="font-bold text-purple-600">{Math.round(metrics.composure)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${metrics.composure}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Voice Analysis Summary */}
                            {voiceAnalysis && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm p-6 border border-indigo-100 mt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Speech Analysis</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Fluency</span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                {Math.round(voiceAnalysis.scores.fluency)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Pace</span>
                                            <span className="text-lg font-bold text-purple-600">
                                                {Math.round(voiceAnalysis.summary.words_per_minute)} wpm
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transcript Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" size={20} />
                            <h2 className="text-lg font-bold text-gray-900">Your Answer</h2>
                            {transcriptions.length > 0 && (
                                <span className="text-sm text-gray-500">({transcriptions.length} segments)</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {isSessionActive && transcriptions.length > 0 && (
                                <button
                                    onClick={evaluateAnswer}
                                    disabled={isEvaluating}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    {isEvaluating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Evaluating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Get Feedback
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800 leading-relaxed min-h-[60px]">
                            {transcriptions.length > 0
                                ? transcriptions.map(t => t.text).reverse().join(' ')
                                : 'Your answer will appear here as you speak...'}
                        </p>
                    </div>
                </div>

                {/* Answer Evaluation */}
                {answerScore && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={24} />
                            Answer Feedback
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                                <div className="text-sm text-green-700 font-semibold mb-2">Content Quality</div>
                                <div className="text-4xl font-bold text-green-600">{answerScore.score}/10</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-200">
                                <div className="text-sm text-blue-700 font-semibold mb-2">Clarity</div>
                                <div className="text-4xl font-bold text-blue-600">{answerScore.clarity}/10</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                                <div className="text-sm text-purple-700 font-semibold mb-2">Relevance</div>
                                <div className="text-4xl font-bold text-purple-600">{answerScore.relevance}/10</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    Strengths
                                </h3>
                                <p className="text-green-700 text-sm leading-relaxed">{answerScore.strengths}</p>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                    <TrendingUp size={18} />
                                    Areas for Improvement
                                </h3>
                                <p className="text-orange-700 text-sm leading-relaxed">{answerScore.improvements}</p>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                    <Sparkles size={18} />
                                    Overall Feedback
                                </h3>
                                <p className="text-blue-700 text-sm leading-relaxed">{answerScore.feedback}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                            {currentQuestionIndex < interviewQuestions.length - 1 ? (
                                <button
                                    onClick={nextQuestion}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                >
                                    Next Question
                                    <TrendingUp size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={resetSession}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                >
                                    <RotateCcw size={18} />
                                    Start Over
                                </button>
                            )}
                        </div>
                    </div>
                )}

{isSessionActive && answerScore && (
  <div className="flex flex-col items-end gap-2">
    <button
      onClick={handleCompleteSession}
      disabled={answerScore.score < 7}
      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm ${
        answerScore.score >= 7
          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <CheckCircle size={20} />
      Complete Practice
    </button>
    {answerScore.score < 7 && (
      <p className="text-sm text-gray-600">
        Score 7 or above required to complete
      </p>
    )}
  </div>
)}
{/* Success Modal */}
{showSuccessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
      <div className="text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Practice Completed!
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          Great job! Your progress has been saved successfully. Keep up the excellent work!
        </p>
        
        {/* Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  </div>
)}

                {/* Analytics Dashboard */}
                {emotionHistory.length > 5 && (
                    <>
                        {/* Performance Radar Chart */}
                        {radarData.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Overview</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="metric" />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                            <Radar name="Your Performance" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>

                                    <div className="flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-6xl font-bold text-indigo-600 mb-2">{overallScore}</div>
                                            <div className="text-lg text-gray-600 font-semibold">Overall Score</div>
                                            <div className="text-sm text-gray-500 mt-2">
                                                {overallScore >= 80 ? 'Excellent Performance!' :
                                                    overallScore >= 65 ? 'Good Performance' :
                                                        overallScore >= 50 ? 'Satisfactory' : 'Needs Improvement'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trends Over Time */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Trends</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={emotionHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="time" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence" />
                                        <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} name="Engagement" />
                                        <Line type="monotone" dataKey="composure" stroke="#8b5cf6" strokeWidth={2} name="Composure" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Emotion Distribution</h2>
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

                        {/* Session Summary */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm p-6 border border-indigo-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Session Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        {Math.round(emotionHistory.reduce((sum, item) => sum + item.confidence, 0) / emotionHistory.length)}%
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Avg Confidence</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {Math.round(emotionHistory.reduce((sum, item) => sum + item.engagement, 0) / emotionHistory.length)}%
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Avg Engagement</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {Math.round(emotionHistory.reduce((sum, item) => sum + item.composure, 0) / emotionHistory.length)}%
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Avg Composure</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {transcriptions.length}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Responses</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

