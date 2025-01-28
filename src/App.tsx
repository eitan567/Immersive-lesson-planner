import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card.tsx";
import "./index.css";

import BasicInfoForm from "./features/lesson-planner/components/BasicInfoForm.tsx";
import LessonPhase from "./features/lesson-planner/components/LessonPhase.tsx";
import LessonPlanPreview from "./features/lesson-planner/components/LessonPlanPreview.tsx";
import NavigationControls from "./features/lesson-planner/components/NavigationControls.tsx";
import useLessonPlanState from "./features/lesson-planner/hooks/useLessonPlanState.ts";

const App = () => {
  const {
    currentStep,
    lessonPlan,
    handleBasicInfoChange,
    addSection,
    setCurrentStep,
    handleExport,
    generateLessonPlanText,
    updateSections
  } = useLessonPlanState();

  const handleUpdateSection = (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: any
  ) => {
    const newSections = {...lessonPlan.sections};
    newSections[phase][index] = { 
      ...newSections[phase][index],
      ...updates
    };
    // Type assertion since we know the structure matches
    updateSections(newSections);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 rtl">
      <Card>
        <CardHeader>
          <CardTitle>מתכנן שיעורים לחדר אימרסיבי</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <BasicInfoForm 
              lessonPlan={lessonPlan} 
              handleBasicInfoChange={handleBasicInfoChange} 
            />
          )}
          
          {currentStep === 2 && (
            <div>
              <LessonPhase
                phase="opening"
                title="פתיחה"
                sections={lessonPlan.sections.opening}
                onAddSection={addSection}
                onUpdateSection={handleUpdateSection}
              />
              <LessonPhase
                phase="main"
                title="גוף השיעור"
                sections={lessonPlan.sections.main}
                onAddSection={addSection}
                onUpdateSection={handleUpdateSection}
              />
              <LessonPhase
                phase="summary"
                title="סיכום"
                sections={lessonPlan.sections.summary}
                onAddSection={addSection}
                onUpdateSection={handleUpdateSection}
              />
            </div>
          )}
          
          {currentStep === 3 && (
            <LessonPlanPreview content={generateLessonPlanText()} />
          )}
          
          <NavigationControls
            currentStep={currentStep}
            onPrevious={() => setCurrentStep(prev => prev - 1)}
            onNext={() => setCurrentStep(prev => prev + 1)}
            onExport={currentStep === 3 ? handleExport : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;