import React from 'react';
import LessonPhase from './LessonPhase.tsx';
import type { LessonSection, LessonPlanSections } from '../types.ts';

interface LessonBuilderProps {
  sections: LessonPlanSections;
  onAddSection: (phase: 'opening' | 'main' | 'summary') => void;
  onUpdateSection: (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => void;
}

export const LessonBuilder = ({
  sections,
  onAddSection,
  onUpdateSection
}: LessonBuilderProps) => {
  return (
    <div>
      <LessonPhase
        phase="opening"
        title="פתיחה"
        sections={sections.opening}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
      />
      <LessonPhase
        phase="main"
        title="גוף השיעור"
        sections={sections.main}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
      />
      <LessonPhase
        phase="summary"
        title="סיכום"
        sections={sections.summary}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
      />
    </div>
  );
};