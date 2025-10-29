// src/components/pages/Maindash.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, PlayCircle, FileText, CheckCircle2, Clock, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/auth.service';
import { useProgress } from '../../contexts/ProgressContext';
import { modules, getModuleById } from '../../data/modulesData'; 

const ModuleDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, completePractice, getItemStatus, isLoading: progressLoading } = useProgress();
  const progressData = progress || {};

  const openPractice = (moduleId, sectionId, practiceId) => {
    // Practice questions -> dashboard
    navigate(`/dashboard?module=${moduleId}&section=${encodeURIComponent(sectionId)}&practice=${practiceId}`);
  };

  const openTheory = (moduleId, sectionId) => {
    // Theory lessons -> theory page
    navigate(`/theory?module=${moduleId}&section=${encodeURIComponent(sectionId)}`);
  };

  const selectedModuleIdFromUrl = searchParams.get('module');
  const [selectedModuleId, setSelectedModuleId] = useState(selectedModuleIdFromUrl || null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    setSelectedModuleId(selectedModuleIdFromUrl || null);
  }, [selectedModuleIdFromUrl]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedModule = selectedModuleId ? getModuleById(selectedModuleId) : null;

  // Helper function to check if progress is empty
  const hasNoProgress = () => {
    return !progress || progress.length === 0;
  };

  // Check if a section is fully completed (theory + all practices)
  const isSectionFullyCompleted = (moduleId, section) => {
    const theoryStatus = getItemStatus(moduleId, section.id, 'theory', 'theory');
    if (theoryStatus !== 'completed') return false;

    return section.practices.every(practice => {
      const practiceStatus = getItemStatus(moduleId, section.id, practice.id, 'practice');
      return practiceStatus === 'completed';
    });
  };

  // Check if a section should be unlocked
  const isSectionUnlocked = (moduleId, sectionId) => {
    // If no progress, only Module 1, Section 1.1 is unlocked
    if (hasNoProgress()) {
      return moduleId === '1' && sectionId === '1.1';
    }

    // Module 1, Section 1.1 is always unlocked
    if (moduleId === '1' && sectionId === '1.1') {
      return true;
    }

    const module = getModuleById(moduleId);
    if (!module) return false;

    const sections = module.sections;
    const currentSectionIndex = sections.findIndex(s => s.id === sectionId);

    if (currentSectionIndex === -1) return false;

    // Check if it's the first section of a module (not module 1)
    if (currentSectionIndex === 0) {
      // Need to check if previous module is fully completed
      const prevModuleId = String(Number(moduleId) - 1);
      const prevModule = getModuleById(prevModuleId);
      
      if (!prevModule) return false;

      // Check if all sections of previous module are completed
      return prevModule.sections.every(section => 
        isSectionFullyCompleted(prevModuleId, section)
      );
    }

    // For subsequent sections in the same module, check if previous section is fully completed
    const prevSection = sections[currentSectionIndex - 1];
    return isSectionFullyCompleted(moduleId, prevSection);
  };

  // Set expanded sections based on unlock status when module is selected
  useEffect(() => {
    if (selectedModule) {
      const newExpandedSections = {};
      selectedModule.sections.forEach(section => {
        const isUnlocked = isSectionUnlocked(selectedModule.id, section.id);
        // Expand if unlocked and not fully completed
        newExpandedSections[section.id] = isUnlocked && !isSectionFullyCompleted(selectedModule.id, section);
      });
      setExpandedSections(newExpandedSections);
    }
  }, [selectedModule?.id, progress]);

  const getModuleCompletion = (module) => {
    if (!module) return { completed: 0, total: 0, percentage: 0 };
    
    let completedItems = 0;
    let totalItems = 0;

    module.sections.forEach(section => {
      totalItems++;
      const theoryStatus = getItemStatus(module.id, section.id, 'theory', 'theory');
      if (theoryStatus === 'completed') completedItems++;

      section.practices.forEach(practice => {
        totalItems++;
        const practiceStatus = getItemStatus(module.id, section.id, practice.id, 'practice');
        if (practiceStatus === 'completed') completedItems++;
      });
    });

    return {
      completed: completedItems,
      total: totalItems,
      percentage: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
    };
  };

  const getOverallProgress = () => {
    let totalCompleted = 0;
    let totalItems = 0;
    modules.forEach(module => {
      const completion = getModuleCompletion(module);
      totalCompleted += completion.completed;
      totalItems += completion.total;
    });
    return {
      completed: totalCompleted,
      total: totalItems,
      percentage: totalItems === 0 ? 0 : Math.round((totalCompleted / totalItems) * 100)
    };
  };

  const openModule = (moduleId) => {
    setSearchParams({ module: moduleId });
  };

  const backToModules = () => {
    setSearchParams({});
  };

  // MODULE LIST VIEW
  if (!selectedModule) {
    const overallProgress = getOverallProgress();

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Overall Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Overall Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{overallProgress.percentage}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{overallProgress.completed} of {overallProgress.total} lessons completed</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${overallProgress.percentage}%` }} />
            </div>
          </div>

          {/* Module Cards */}
          {progressLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Loading your progress...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const moduleCompletion = getModuleCompletion(module);

                return (
                  <button
                    key={module.id}
                    onClick={() => openModule(module.id)}
                    className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-lg hover:border-indigo-300 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                      </div>
                      {moduleCompletion.percentage === 100 && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Module {module.id}</h3>
                    <p className="text-base font-medium text-gray-700 mb-2">{module.title}</p>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{module.sections.length} sections • {moduleCompletion.total} lessons</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-gray-900">{moduleCompletion.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${moduleCompletion.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SECTION DETAILS VIEW
  const completion = getModuleCompletion(selectedModule);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button onClick={backToModules} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Modules</span>
        </button>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Module Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{completion.percentage}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{completion.completed} of {completion.total} completed</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${completion.percentage}%` }} />
          </div>
        </div>

        {/* Module Content */}
        <div className="space-y-3">
          {selectedModule.sections.map((section) => {
            const sectionUnlocked = isSectionUnlocked(selectedModule.id, section.id);
            const theoryStatus = getItemStatus(selectedModule.id, section.id, 'theory', 'theory');

            return (
              <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => toggleSection(section.id)} 
                  className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
                    sectionUnlocked ? 'hover:bg-gray-50' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded text-sm font-semibold ${
                      sectionUnlocked ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {section.id}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-semibold text-gray-900">Section {section.id}: {section.title}</h3>
                      <p className="text-sm text-gray-500">{section.practices.length + 1} lessons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!sectionUnlocked && <span className="text-xs text-gray-400 mr-2">Locked</span>}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections[section.id] ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expandedSections[section.id] && (
                  <div className="border-t border-gray-200">
                    {/* Theory */}
                    <div 
                      className={`px-6 py-4 transition-colors border-b border-gray-100 
                        ${sectionUnlocked && theoryStatus !== 'locked' ? 'hover:bg-gray-50' : ''}
                        ${!sectionUnlocked || theoryStatus === 'locked' ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded flex items-center justify-center ${
                            theoryStatus === 'completed' ? 'bg-green-50' : 
                            sectionUnlocked && theoryStatus === 'available' ? 'bg-indigo-50' : 
                            'bg-gray-100'
                          }`}>
                            {section.theory.type === 'video' ? 
                              <PlayCircle className={`w-5 h-5 ${
                                theoryStatus === 'completed' ? 'text-green-600' : 
                                sectionUnlocked && theoryStatus === 'available' ? 'text-indigo-600' : 
                                'text-gray-400'
                              }`} /> : 
                              <FileText className={`w-5 h-5 ${
                                theoryStatus === 'completed' ? 'text-green-600' : 
                                sectionUnlocked && theoryStatus === 'available' ? 'text-indigo-600' : 
                                'text-gray-400'
                              }`} />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Theory Lesson ({section.theory.type === 'video' ? 'video' : 'text'})</p>
                            <p className="text-xs text-gray-500">{section.theory.title} • {section.theory.duration}</p>
                          </div>
                        </div>
                        {theoryStatus === 'completed' && (
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <button 
                              onClick={() => openTheory(selectedModule.id, section.id)}
                              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                            >
                              Review
                            </button>
                          </div>
                        )}
                        {sectionUnlocked && theoryStatus === 'available' && (
                          <button 
                            onClick={() => openTheory(selectedModule.id, section.id)}
                            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors flex-shrink-0"
                          >
                            Start
                          </button>
                        )}
                        {(!sectionUnlocked || theoryStatus === 'locked') && <span className="text-xs text-gray-400 flex-shrink-0">Locked</span>}
                      </div>
                    </div>

                    {/* Practice Questions */}
                    {section.practices.map((practice, practiceIndex) => {
                      const practiceStatus = getItemStatus(selectedModule.id, section.id, practice.id, 'practice');
                      const isClickable = sectionUnlocked && practiceStatus !== 'locked';

                      return (
                        <div 
                          key={practice.id} 
                          className={`px-6 py-4 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isClickable ? 'hover:bg-gray-50' : 'opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-10 h-10 rounded flex items-center justify-center ${
                                practiceStatus === 'completed' ? 'bg-green-50' : 
                                practiceStatus === 'in-progress' ? 'bg-indigo-50' : 
                                practiceStatus === 'available' ? 'bg-indigo-50' :
                                'bg-gray-100'
                              }`}>
                                <span className={`text-sm font-semibold ${
                                  practiceStatus === 'completed' ? 'text-green-600' : 
                                  practiceStatus === 'in-progress' ? 'text-indigo-600' : 
                                  practiceStatus === 'available' ? 'text-indigo-600' :
                                  'text-gray-400'
                                }`}>{practiceIndex + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Practice Question {practiceIndex + 1}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <p className="text-xs text-gray-500">{practice.title} • Recommended time: {practice.duration}</p>
                                </div>
                              </div>
                            </div>
                            {practiceStatus === 'completed' && (
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <button 
                                  onClick={() => openPractice(selectedModule.id, section.id, practice.id)}
                                  className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                                >
                                  Review
                                </button>
                              </div>
                            )}
                            {practiceStatus === 'in-progress' && (
                              <button 
                                onClick={() => openPractice(selectedModule.id, section.id, practice.id)}
                                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors flex-shrink-0"
                              >
                                Continue
                              </button>
                            )}
                            {practiceStatus === 'available' && (
                              <button 
                                onClick={() => openPractice(selectedModule.id, section.id, practice.id)}
                                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors flex-shrink-0"
                              >
                                Start
                              </button>
                            )}
                            {practiceStatus === 'locked' && <span className="text-xs text-gray-400 flex-shrink-0">Locked</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleDashboard;