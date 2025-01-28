import React from 'react';
import BasicInfoForm from './BasicInfoForm.tsx';
import { LessonBuilder } from './LessonBuilder.tsx';
import LessonPlanPreview from './LessonPlanPreview.tsx';
import NavigationControls from './NavigationControls.tsx';
import type { LessonPlan, LessonSection } from '../types.ts';

interface LessonContentProps {
  currentStep: number;
  lessonPlan: LessonPlan;
  handleBasicInfoChange: (field: keyof LessonPlan, value: string) => void;
  addSection: (phase: 'opening' | 'main' | 'summary') => void;
  handleSectionUpdate: (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => void;
  setCurrentStep: (updater: (prev: number) => number) => void;
  handleExport: () => void;
  generateLessonPlanText: () => string;
}

export const LessonContent = ({
  currentStep,
  lessonPlan,
  handleBasicInfoChange,
  addSection,
  handleSectionUpdate,
  setCurrentStep,
  handleExport,
  generateLessonPlanText
}: LessonContentProps) => {
  return (
    <>
      {currentStep === 1 && (
        <BasicInfoForm 
          lessonPlan={lessonPlan} 
          handleBasicInfoChange={handleBasicInfoChange} 
        />
      )}
      
      {currentStep === 2 && (
        <LessonBuilder
          sections={lessonPlan.sections}
          onAddSection={addSection}
          onUpdateSection={handleSectionUpdate}
        />
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
    </>
  );
};