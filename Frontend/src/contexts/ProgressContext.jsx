import React, { createContext, useContext, useEffect, useState } from 'react';
import progressService from '../services/progress.service';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const res = await progressService.getUserProgress();
      console.log('✅ Progress fetched:', res);
      setProgress(res.progress || []);
    } catch (err) {
      console.error('Fetch progress failed:', err);
      setProgress([]);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTheory = async (moduleId, sectionId, data = {}) => {
    try {
      await progressService.completeTheory(moduleId, sectionId, data);
      await fetchProgress();
    } catch (err) {
      console.error('Complete theory failed:', err);
      throw err;
    }
  };

  const completePractice = async (moduleId, sectionId, practiceId, data = {}) => {
    try {
      await progressService.completePractice(moduleId, sectionId, practiceId, data);
      await fetchProgress();
    } catch (err) {
      console.error('Complete practice failed:', err);
      throw err;
    }
  };

  // ✅ NEW: Function to check item status
  const getItemStatus = (moduleId, sectionId, itemId, itemType) => {
    if (!progress || progress.length === 0) {
      return 'locked';
    }

    // Convert to strings for comparison
    const modId = String(moduleId);
    const secId = String(sectionId);
    
    // Check if this specific item is completed
    const isCompleted = progress.some(p => {
      const matchModule = String(p.moduleId) === modId;
      const matchSection = String(p.sectionId) === secId;
      
      if (itemType === 'theory') {
        // For theory, just check module and section
        return matchModule && matchSection && p.type === 'theory';
      } else {
        // For practice, check module, section, and practice ID
        return matchModule && matchSection && p.type === 'practice' && String(p.data?.practiceId || '') === String(itemId);
      }
    });

    if (isCompleted) {
      return 'completed';
    }

    // Check if previous items are completed to determine if this is unlocked
    if (itemType === 'theory') {
      // Theory is unlocked if previous section's theory is completed
      // Or if it's the first section of the first module
      if (modId === '1' && secId === '1.1') {
        return 'available';
      }

      // Check if previous section is completed
      const prevSectionCompleted = checkPreviousSectionCompleted(modId, secId);
      return prevSectionCompleted ? 'available' : 'locked';
    } else {
      // Practice questions unlock one by one
      // First practice unlocks after theory
      // Subsequent practices unlock after previous practice is completed
      
      const theoryCompleted = progress.some(p => 
        String(p.moduleId) === modId && 
        String(p.sectionId) === secId && 
        p.type === 'theory'
      );
      
      if (!theoryCompleted) {
        return 'locked'; // Theory must be completed first
      }

      // Get all completed practices in this section
      const completedPractices = progress.filter(p => 
        String(p.moduleId) === modId && 
        String(p.sectionId) === secId && 
        p.type === 'practice'
      ).map(p => String(p.data?.practiceId || ''));

      // Check if this is the first practice or if previous practice is completed
      // Assuming practice IDs are like 'p1', 'p2', 'p3'
      const practiceNumber = parseInt(itemId.replace(/\D/g, '')) || 1;
      
      if (practiceNumber === 1) {
        // First practice is available after theory
        return 'available';
      }
      
      // For subsequent practices, check if previous practice is completed
      const prevPracticeId = `p${practiceNumber - 1}`;
      const prevCompleted = completedPractices.includes(prevPracticeId);
      
      return prevCompleted ? 'available' : 'locked';
    }
  };

  // Helper function to check if previous section is completed
  const checkPreviousSectionCompleted = (moduleId, sectionId) => {
    // Parse section ID (e.g., "1.2" -> module 1, section 2)
    const [mod, sec] = sectionId.split('.').map(Number);
    
    if (sec === 1) {
      // First section of a module
      if (moduleId === '1') {
        return true; // First section of first module is always available
      }
      // Check if last section of previous module is completed
      const prevModuleId = String(Number(moduleId) - 1);
      // This would need knowledge of how many sections are in the previous module
      // For simplicity, we'll just return true for now
      return true;
    } else {
      // Check if previous section in same module is completed
      const prevSectionId = `${mod}.${sec - 1}`;
      return progress.some(p => 
        String(p.moduleId) === String(moduleId) && 
        String(p.sectionId) === prevSectionId && 
        p.type === 'theory'
      );
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <ProgressContext.Provider value={{ 
      progress, 
      completeTheory, 
      completePractice,
      getItemStatus,
      fetchProgress,
      isLoading
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};