import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProgress } from "../../contexts/ProgressContext";
import { getTheoryBySection } from "../../data/modulesData";
import { ArrowLeft, PlayCircle, FileText, CheckCircle, Clock, BookOpen, Info } from "lucide-react";

const TheoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeTheory, progress } = useProgress();

  const moduleId = searchParams.get("module");
  const sectionId = searchParams.get("section");
  const theory = getTheoryBySection(moduleId, sectionId);

  const videoRef = useRef(null);
  const [watchedEnough, setWatchedEnough] = useState(theory?.type === "text");
  const [currentProgress, setCurrentProgress] = useState(0);
  const lastAllowedTimeRef = useRef(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isRestoringRef = useRef(false);

  // Get storage key for this video
  const getStorageKey = () => `video_progress_${moduleId}_${sectionId}`;

  // Load and restore video position ONCE on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video || theory?.type !== "video" || theory.videoUrl?.includes("youtube.com")) return;

    const restoreProgress = () => {
      const savedData = localStorage.getItem(getStorageKey());
      if (savedData) {
        try {
          const { currentTime, highestTime, progress: savedProgress } = JSON.parse(savedData);
          
          // Restore state
          lastAllowedTimeRef.current = highestTime || 0;
          setCurrentProgress(savedProgress || 0);
          
          // Restore video position
          if (currentTime > 0 && currentTime < video.duration * 0.95) {
            isRestoringRef.current = true;
            video.currentTime = currentTime;
            console.log('✅ Video restored to:', currentTime);
          }
        } catch (err) {
          console.error("Failed to restore progress:", err);
        }
      }
    };

    if (video.readyState >= 1) {
      restoreProgress();
    } else {
      video.addEventListener('loadedmetadata', restoreProgress, { once: true });
    }

    return () => {
      // Save on unmount
      if (video.currentTime > 0) {
        const progressData = {
          currentTime: video.currentTime,
          highestTime: lastAllowedTimeRef.current,
          progress: currentProgress,
          timestamp: Date.now()
        };
        localStorage.setItem(getStorageKey(), JSON.stringify(progressData));
      }
    };
  }, []); // Only run once on mount

  // Check if this theory is already completed
  useEffect(() => {
    if (progress && moduleId && sectionId) {
      const isCompleted = progress.some(
        p => p.moduleId === moduleId && p.sectionId === sectionId && p.itemType === 'theory'
      );
      if (isCompleted) {
        setWatchedEnough(true);
        setCurrentProgress(100);
        localStorage.removeItem(getStorageKey());
      }
    }
  }, [progress, moduleId, sectionId]);

  // Save progress periodically while playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || theory?.type !== "video" || theory.videoUrl?.includes("youtube.com")) return;

    const saveProgress = () => {
      if (!video.paused && video.currentTime > 0 && !isRestoringRef.current) {
        const progressData = {
          currentTime: video.currentTime,
          highestTime: lastAllowedTimeRef.current,
          progress: currentProgress,
          timestamp: Date.now()
        };
        localStorage.setItem(getStorageKey(), JSON.stringify(progressData));
      }
    };

    const handlePause = () => {
      saveProgress();
    };

    const interval = setInterval(saveProgress, 3000);
    video.addEventListener('pause', handlePause);

    return () => {
      clearInterval(interval);
      video.removeEventListener('pause', handlePause);
    };
  }, [theory?.type, theory?.videoUrl, currentProgress]);

  if (!theory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Theory Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">The requested content could not be located.</p>
          <button
            onClick={() => navigate("/maindash")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    try {
      await completeTheory(moduleId, sectionId);
      localStorage.removeItem(getStorageKey());
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save progress. Please try again.");
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    navigate(`/maindash?module=${moduleId}`);
  };

  const handleTimeUpdate = (e) => {
    const vid = e.target;
    
    // Skip if we're restoring position
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    const progress = (vid.currentTime / vid.duration) * 100;
    setCurrentProgress(Math.round(progress));
    
    if (progress >= 95 && !watchedEnough) {
      setWatchedEnough(true);
    }
    
    // Update highest time reached
    if (vid.currentTime > lastAllowedTimeRef.current) {
      lastAllowedTimeRef.current = vid.currentTime;
    }
  };

  const handleSeeking = (e) => {
    const vid = e.target;
    
    // Skip check if we're restoring position
    if (isRestoringRef.current) return;
    
    // Prevent skipping forward beyond highest reached
    if (vid.currentTime > lastAllowedTimeRef.current + 1) {
      vid.currentTime = lastAllowedTimeRef.current;
    }
  };

  const isYouTubeVideo = theory.videoUrl?.includes("youtube.com") || theory.videoUrl?.includes("youtu.be");

  // Check if there's saved progress
  const hasSavedProgress = () => {
    const savedData = localStorage.getItem(getStorageKey());
    if (savedData) {
      try {
        const { currentTime } = JSON.parse(savedData);
        return currentTime > 5;
      } catch {
        return false;
      }
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/maindash?module=${moduleId}`)}
          className="group flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back to Module</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theory.type === "video" ? "bg-indigo-100" : "bg-emerald-100"
                }`}>
                  {theory.type === "video" ? (
                    <PlayCircle className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {theory.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Module {moduleId}.{sectionId}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {theory.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            {watchedEnough ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Completed</span>
              </div>
            ) : theory.type === "video" && !isYouTubeVideo && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">{currentProgress}% watched</span>
              </div>
            )}
          </div>

          {/* Resume Progress Banner */}
          {!watchedEnough && hasSavedProgress() && theory.type === "video" && !isYouTubeVideo && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-3">
              <PlayCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-900 mb-1">Resuming Your Progress</p>
                <p className="text-sm text-indigo-700">
                  Welcome back! The video will continue from where you left off.
                </p>
              </div>
            </div>
          )}

          {/* Info Banner for Local Videos */}
          {theory.type === "video" && !isYouTubeVideo && !watchedEnough && !hasSavedProgress() && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Video Requirements</p>
                <p className="text-sm text-blue-700">
                  Watch at least 95% of this video. Your progress is automatically saved - you can return anytime and continue from where you left off.
                </p>
              </div>
            </div>
          )}

          {/* Already Completed Message */}
          {watchedEnough && theory.type === "video" && currentProgress === 100 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Already Completed!</p>
                <p className="text-sm text-green-700">
                  You've already completed this lesson. Your progress has been saved.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {theory.type === "video" ? (
            <div className="relative">
              {isYouTubeVideo ? (
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={theory.videoUrl}
                    title={theory.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <>
                  <div className="aspect-video bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      src={theory.videoUrl}
                      controls
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                      onTimeUpdate={handleTimeUpdate}
                      onSeeking={handleSeeking}
                    />
                  </div>
                  
                  {/* Progress Bar for Local Videos */}
                  {!watchedEnough && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Watching Progress</span>
                        <span className="text-sm font-semibold text-indigo-600">{currentProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 rounded-full"
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {currentProgress >= 95 ? "✓ Minimum watch requirement met!" : `${95 - currentProgress}% remaining to complete`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{theory.content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Completion Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {watchedEnough ? "Lesson Completed" : "Complete This Lesson"}
              </h3>
              <p className="text-sm text-gray-600">
                {watchedEnough 
                  ? currentProgress === 100 
                    ? "This lesson is already completed. You can review it anytime or continue to the next lesson."
                    : "You've met all requirements. Click the button to save your progress and continue."
                  : theory.type === "video" && !isYouTubeVideo
                  ? `Watch ${95 - currentProgress}% more to complete this lesson. Your progress is being saved automatically.`
                  : "Review the content above to complete this lesson."
                }
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={!watchedEnough}
              className={`font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                watchedEnough
                  ? "bg-green-600 hover:bg-green-700 hover:shadow-md text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="hidden sm:inline">
                {watchedEnough ? "Continue to Next" : "Complete Lesson"}
              </span>
              <span className="sm:hidden">
                {watchedEnough ? "Next" : "Complete"}
              </span>
            </button>
          </div>
        </div>

       
        
      </div>

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
                Lesson Completed!
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
    </div>
  );
};

export default TheoryPage;