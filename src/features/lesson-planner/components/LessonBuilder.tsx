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
  onRemoveSection: (phase: 'opening' | 'main' | 'summary', index: number) => void;
  onSave?: () => Promise<void>;
}

export const LessonBuilder = ({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onSave
}: LessonBuilderProps) => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">בניית השיעור</h1>
      <LessonPhase
        phase="opening"
        title="פתיחה"
        sections={sections.opening}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
        onRemoveSection={onRemoveSection}
      />
      <LessonPhase
        phase="main"
        title="גוף השיעור"
        sections={sections.main}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
        onRemoveSection={onRemoveSection}
      />
      <LessonPhase
        phase="summary"
        title="סיכום"
        sections={sections.summary}
        onAddSection={onAddSection}
        onUpdateSection={onUpdateSection}
        onRemoveSection={onRemoveSection}
      />
    </div>
  );
};