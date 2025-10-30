import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import progressService from '../services/progress.service';
import authService from '../services/auth.service';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const fetchProgress = async () => {
    if (!authService.isAuthenticated()) {
      console.log('⏸️ Not authenticated, skipping progress fetch');
      setProgress([]);
      setIsLoading(false);
      return;
    }

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

  const getItemStatus = (moduleId, sectionId, itemId, itemType) => {
    const modId = String(moduleId);
    const secId = String(sectionId);
    
    // ✅ SPECIAL CASE: Section 1.1 Theory is ALWAYS available (even with no progress)
    if (modId === '1' && secId === '1.1' && itemType === 'theory') {
      // Check if it's completed
      if (progress && progress.length > 0) {
        const isCompleted = progress.some(p => 
          String(p.moduleId) === modId && 
          String(p.sectionId) === secId && 
          p.type === 'theory'
        );
        return isCompleted ? 'completed' : 'available';
      }
      // If no progress at all, it's still available
      return 'available';
    }

    // ✅ For everything else, check if progress exists
    if (!progress || progress.length === 0) {
      return 'locked';
    }
    
    const isCompleted = progress.some(p => {
      const matchModule = String(p.moduleId) === modId;
      const matchSection = String(p.sectionId) === secId;
      
      if (itemType === 'theory') {
        return matchModule && matchSection && p.type === 'theory';
      } else {
        return matchModule && matchSection && p.type === 'practice' && String(p.data?.practiceId || '') === String(itemId);
      }
    });

    if (isCompleted) {
      return 'completed';
    }

    if (itemType === 'theory') {
      const prevSectionCompleted = checkPreviousSectionCompleted(modId, secId);
      return prevSectionCompleted ? 'available' : 'locked';
    } else {
      const theoryCompleted = progress.some(p => 
        String(p.moduleId) === modId && 
        String(p.sectionId) === secId && 
        p.type === 'theory'
      );
      
      if (!theoryCompleted) {
        return 'locked';
      }

      const completedPractices = progress.filter(p => 
        String(p.moduleId) === modId && 
        String(p.sectionId) === secId && 
        p.type === 'practice'
      ).map(p => String(p.data?.practiceId || ''));

      const practiceNumber = parseInt(itemId.replace(/\D/g, '')) || 1;
      
      if (practiceNumber === 1) {
        return 'available';
      }
      
      const prevPracticeId = `p${practiceNumber - 1}`;
      const prevCompleted = completedPractices.includes(prevPracticeId);
      
      return prevCompleted ? 'available' : 'locked';
    }
  };

  const checkPreviousSectionCompleted = (moduleId, sectionId) => {
    const [mod, sec] = sectionId.split('.').map(Number);
    
    if (sec === 1) {
      if (moduleId === '1') {
        return true;
      }
      return true;
    } else {
      const prevSectionId = `${mod}.${sec - 1}`;
      return progress.some(p => 
        String(p.moduleId) === String(moduleId) && 
        String(p.sectionId) === prevSectionId && 
        p.type === 'theory'
      );
    }
  };

  useEffect(() => {
    const protectedRoutes = ['/maindash', '/dashboard', '/theory'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
    const isAuthenticated = authService.isAuthenticated();
    
    console.log('📍 Route changed:', location.pathname);
    console.log('🔐 Authenticated:', isAuthenticated);
    console.log('🛡️ Is protected route:', isProtectedRoute);
    
    if (isProtectedRoute && isAuthenticated) {
      console.log('🔄 Fetching progress...');
      fetchProgress();
    } else {
      console.log('⏸️ Skipping progress fetch');
      setIsLoading(false);
    }
  }, [location.pathname]);

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