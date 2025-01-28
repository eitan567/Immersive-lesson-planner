/// <reference lib="dom" />
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';
import type { LessonPlan, LessonPlanSections } from '../types.ts';
import { lessonPlanService } from '../services/lessonPlanService.ts';

const createEmptyLessonPlan = (userId: string): Omit<LessonPlan, 'id' | 'created_at' | 'updated_at'> => ({
  userId,
  topic: '',
  duration: '',
  gradeLevel: '',
  priorKnowledge: '',
  position: '',
  contentGoals: '',
  skillGoals: '',
  sections: {
    opening: [],
    main: [],
    summary: []
  }
});

const useLessonPlanState = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveInProgress, setSaveInProgress] = useState(false);

  // Initialize or load existing lesson plan
  useEffect(() => {
    const initializeLessonPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // In the future, we might want to load the last edited plan
        const emptyPlan = createEmptyLessonPlan(user.id);
        const created = await lessonPlanService.createLessonPlan(emptyPlan);
        setLessonPlan(created);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize lesson plan');
      } finally {
        setLoading(false);
      }
    };

    initializeLessonPlan();
  }, [user]);

  const handleBasicInfoChange = async (field: keyof LessonPlan, value: string) => {
    if (!lessonPlan || !user) return;

    const updatedPlan = {
      ...lessonPlan,
      [field]: value
    };

    setLessonPlan(updatedPlan);

    if (lessonPlan.id && !saveInProgress) {
      try {
        setSaveInProgress(true);
        await lessonPlanService.updateLessonPlan(lessonPlan.id, { [field]: value });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save changes');
      } finally {
        setSaveInProgress(false);
      }
    }
  };

  const updateSections = async (newSections: LessonPlanSections) => {
    if (!lessonPlan || !user) return;

    const updatedPlan = {
      ...lessonPlan,
      sections: newSections
    };

    setLessonPlan(updatedPlan);

    if (lessonPlan.id && !saveInProgress) {
      try {
        setSaveInProgress(true);
        await lessonPlanService.updateLessonPlan(lessonPlan.id, { sections: newSections });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save sections');
      } finally {
        setSaveInProgress(false);
      }
    }
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

  return {
    currentStep,
    lessonPlan,
    loading,
    error,
    saveInProgress,
    handleBasicInfoChange,
    addSection,
    setCurrentStep,
    handleExport,
    generateLessonPlanText,
    updateSections
  };
};

export default useLessonPlanState;