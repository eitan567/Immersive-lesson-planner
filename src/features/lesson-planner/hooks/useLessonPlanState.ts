/// <reference lib="dom" />
import { useState } from 'react';

interface ScreenConfig {
  screen1: string;
  screen2: string;
  screen3: string;
}

interface LessonSection {
  content: string;
  screens: {
    screen1: string;
    screen2: string;
    screen3: string;
  };
  spaceUsage: string;
}

interface LessonPlan {
  topic: string;
  duration: string;
  gradeLevel: string;
  priorKnowledge: string;
  position: string;
  contentGoals: string;
  skillGoals: string;
  sections: {
    opening: LessonSection[];
    main: LessonSection[];
    summary: LessonSection[];
  };
}

const useLessonPlanState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan>({
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

  const handleBasicInfoChange = (field: string, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSection = (phase: keyof typeof lessonPlan.sections) => {
    setLessonPlan(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [phase]: [...prev.sections[phase], {
          content: '',
          screens: {
            screen1: '',
            screen2: '',
            screen3: ''
          },
          spaceUsage: ''
        }]
      }
    }));
  };

  const handleExport = () => {
    const text = generateLessonPlanText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `תכנית_שיעור_${lessonPlan.topic || 'חדש'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generateLessonPlanText = () => {
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

  const updateSections = (newSections: typeof lessonPlan.sections) => {
    setLessonPlan(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  return {
    currentStep,
    lessonPlan,
    handleBasicInfoChange,
    addSection,
    setCurrentStep,
    handleExport,
    generateLessonPlanText,
    updateSections
  };
};

export default useLessonPlanState;