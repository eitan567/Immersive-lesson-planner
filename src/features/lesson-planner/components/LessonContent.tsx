import React, { useState, useEffect } from 'react';
import BasicInfoForm from './BasicInfoForm.tsx';
import { LessonBuilder } from './LessonBuilder.tsx';
import LessonPlanPreview from './LessonPlanPreview.tsx';
import NavigationControls from './NavigationControls.tsx';
import { SaveStatus } from './SaveStatus.tsx';
import type { LessonPlan, LessonSection } from '../types.ts';

interface LessonContentProps {
  currentStep: number;
  lessonPlan: LessonPlan;
  saveInProgress: boolean;
  lastSaved: Date | null;
  handleBasicInfoChange: (field: keyof LessonPlan, value: string) => void;
  addSection: (phase: 'opening' | 'main' | 'summary') => void;
  handleSectionUpdate: (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => void;
  removeSection: (phase: 'opening' | 'main' | 'summary', index: number) => void;
  setCurrentStep: (updater: (prev: number) => number) => void;
  handleExport: () => void;
  generateLessonPlanText: () => string;
  saveCurrentPlan: () => Promise<void>;
}

export const LessonContent = ({
  currentStep,
  lessonPlan,
  saveInProgress,
  lastSaved,
  handleBasicInfoChange,
  addSection,
  handleSectionUpdate,
  removeSection,
  setCurrentStep,
  handleExport,
  generateLessonPlanText,
  saveCurrentPlan
}: LessonContentProps) => {
  const handleNext = async () => {
    await saveCurrentPlan();
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = async () => {
    await saveCurrentPlan();
    setCurrentStep(prev => prev - 1);
  };

  const [editedContent, setEditedContent] = useState<string>('');

  useEffect(() => {
    setEditedContent(generateLessonPlanText());
  }, [generateLessonPlanText]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  const handleExportWrapper = () => {
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lesson-plan.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {currentStep === 1 && (
        <>
          <BasicInfoForm
            lessonPlan={lessonPlan}
            handleBasicInfoChange={handleBasicInfoChange}
            onSave={saveCurrentPlan}
          />
          <SaveStatus
            onSave={saveCurrentPlan}
            saving={saveInProgress}
            lastSaved={lastSaved}
            className="mt-4 flex justify-end"
          />
        </>
      )}
      
      {currentStep === 2 && (
        <>
          <LessonBuilder
            sections={lessonPlan.sections}
            onAddSection={addSection}
            onUpdateSection={handleSectionUpdate}
            onRemoveSection={removeSection}
          />
          <SaveStatus
            onSave={saveCurrentPlan}
            saving={saveInProgress}
            lastSaved={lastSaved}
            className="mt-4 flex justify-end"
          />
        </>
      )}
      
      {currentStep === 3 && (
        <LessonPlanPreview 
          content={editedContent} 
          onContentChange={handleContentChange}
        />
      )}
      
      <NavigationControls
        currentStep={currentStep}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onExport={currentStep === 3 ? handleExportWrapper : undefined}
        saving={saveInProgress}
      />
    </div>
  );
};