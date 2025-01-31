/// <reference lib="dom" />
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import type { LessonPlan, LessonPlanSections } from '../types.ts';
import { lessonPlanService } from '../services/lessonPlanService.ts';

const STORAGE_KEY = 'currentLessonPlanId';
const STEP_STORAGE_KEY = 'currentLessonPlanStep';

const createEmptyLessonPlan = (userId: string): Omit<LessonPlan, 'id' | 'created_at' | 'updated_at'> => ({
  userId,
  topic: '',
  duration: '',
  gradeLevel: '',
  priorKnowledge: '',
  position: '',
  contentGoals: '',
  skillGoals: '',
  basicInfo: { title: '' },
  sections: {
    opening: [],
    main: [],
    summary: []
  }
});

const useLessonPlanState = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Save currentStep to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
  }, [currentStep]);

  // Load or initialize lesson plan
  useEffect(() => {
    const loadLessonPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to load existing plan ID from localStorage
        const existingPlanId = localStorage.getItem(STORAGE_KEY);
        
        if (existingPlanId) {
          try {
            // Try to load the existing plan
            const existingPlan = await lessonPlanService.getLessonPlan(existingPlanId);
            if (existingPlan && existingPlan.userId === user.id) {
              setLessonPlan(existingPlan);
              setError(null);
              return;
            }
          } catch (err) {
            console.error('Failed to load existing plan:', err);
          }
        }
        
        // Create new plan if no existing plan found
        const emptyPlan = createEmptyLessonPlan(user.id);
        const created = await lessonPlanService.createLessonPlan(emptyPlan);
        if (created.id) {
          localStorage.setItem(STORAGE_KEY, created.id);
        }
        setLessonPlan(created);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize lesson plan');
      } finally {
        setLoading(false);
      }
    };

    loadLessonPlan();
  }, [user]);

  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user && lessonPlan?.id) {
        try {
          const refreshedPlan = await lessonPlanService.getLessonPlan(lessonPlan.id);
          if (refreshedPlan) {
            setLessonPlan(refreshedPlan);
          }
        } catch (err) {
          console.error('Failed to refresh plan:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, lessonPlan?.id]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        const message = 'יש שינויים שעדיין לא נשמרו. האם אתה בטוח שברצונך לעזוב?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!lessonPlan?.id) return;

    const storageKey = `lessonPlan_${lessonPlan.id}_draft`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(lessonPlan));
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  }, [lessonPlan]);

  const handleStepChange = (updater: number | ((prev: number) => number)) => {
    const newStep = typeof updater === 'function' ? updater(currentStep) : updater;
    setCurrentStep(newStep);
    localStorage.setItem(STEP_STORAGE_KEY, newStep.toString());
  };

  const handleBasicInfoChange = (field: keyof LessonPlan, value: string) => {
    if (!lessonPlan || !user) return;

    const updatedPlan = {
      ...lessonPlan,
      [field]: value
    };

    setLessonPlan(updatedPlan);
    setUnsavedChanges(true);
  };

  const saveCurrentPlan = async () => {
    if (!lessonPlan?.id || !user || saveInProgress) return;
    
    try {
      setSaveInProgress(true);
      const { id, userId, created_at, updated_at, ...updates } = lessonPlan;
      await lessonPlanService.updateLessonPlan(lessonPlan.id, updates);
      setError(null);
      setLastSaved(new Date());
      setUnsavedChanges(false);
      localStorage.setItem(STORAGE_KEY, lessonPlan.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת התוכנית');
    } finally {
      setSaveInProgress(false);
    }
  };

  const updateSections = (newSections: LessonPlanSections) => {
    if (!lessonPlan || !user) return;

    const updatedPlan = {
      ...lessonPlan,
      sections: newSections
    };

    setLessonPlan(updatedPlan);
    setUnsavedChanges(true);
  };

  const addSection = async (phase: keyof LessonPlanSections) => {
    if (!lessonPlan || !user) return;

    const newSection = {
      content: '',
      screens: {
        screen1: '',
        screen2: '',
        screen3: ''
      },
      spaceUsage: ''
    };

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: [...lessonPlan.sections[phase], newSection]
    };

    updateSections(updatedSections);
  };

  const handleExport = () => {
    try {
      const text = generateLessonPlanText();
      const fileName = `תכנית_שיעור_${lessonPlan?.topic || 'חדש'}.txt`;
      const file = new File([text], fileName, { type: 'text/plain' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export lesson plan');
    }
  };

  const generateLessonPlanText = () => {
    if (!lessonPlan) return '';

    let text = `תכנית שיעור: ${lessonPlan.topic}\n\n`;
    text += `זמן כולל: ${lessonPlan.duration}\n`;
    text += `שכבת גיל: ${lessonPlan.gradeLevel}\n`;
    text += `ידע קודם: ${lessonPlan.priorKnowledge}\n`;
    text += `מיקום בתוכן: ${lessonPlan.position}\n\n`;
    text += `מטרות ברמת התוכן:\n${lessonPlan.contentGoals}\n\n`;
    text += `מטרות ברמת המיומנויות:\n${lessonPlan.skillGoals}\n\n`;

    text += '== פתיחה ==\n';
    lessonPlan.sections.opening.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      text += `מסך 2: ${section.screens.screen2}\n`;
      text += `מסך 3: ${section.screens.screen3}\n`;
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    text += '\n== גוף השיעור ==\n';
    lessonPlan.sections.main.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      text += `מסך 2: ${section.screens.screen2}\n`;
      text += `מסך 3: ${section.screens.screen3}\n`;
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    text += '\n== סיכום ==\n';
    lessonPlan.sections.summary.forEach((section, i) => {
      text += `\nפעילות ${i + 1}:\n`;
      text += `תוכן: ${section.content}\n`;
      text += `מסך 1: ${section.screens.screen1}\n`;
      text += `מסך 2: ${section.screens.screen2}\n`;
      text += `מסך 3: ${section.screens.screen3}\n`;
      text += `ארגון הלומדים: ${section.spaceUsage}\n`;
    });

    return text;
  };

  const removeSection = async (phase: keyof LessonPlanSections, index: number) => {
    if (!lessonPlan || !user) return;

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: lessonPlan.sections[phase].filter((_, i) => i !== index)
    };

    updateSections(updatedSections);
  };

  return {
    currentStep,
    lessonPlan,
    loading,
    error,
    saveInProgress,
    lastSaved,
    handleBasicInfoChange,
    addSection,
    removeSection,
    setCurrentStep: handleStepChange,
    handleExport,
    generateLessonPlanText,
    updateSections,
    saveCurrentPlan,
    unsavedChanges
  };
};

export default useLessonPlanState;