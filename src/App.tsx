import React from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card.tsx';
import './index.css';

import { AuthProvider } from './features/auth/AuthContext.tsx';
import { Navbar } from './features/common/components/Navbar.tsx';
import { useAuth } from './features/auth/AuthContext.tsx';
import useLessonPlanState from './features/lesson-planner/hooks/useLessonPlanState.ts';
import LoginForm from './features/auth/LoginForm.tsx';
import { LoadingSpinner } from './components/ui/loading-spinner.tsx';
import { ErrorAlert } from './features/common/components/ErrorAlert.tsx';
import { SaveProgressAlert } from './features/common/components/SaveProgressAlert.tsx';
import { LessonPlannerHeader } from './features/lesson-planner/components/LessonPlannerHeader.tsx';
import { LessonContent } from './features/lesson-planner/components/LessonContent.tsx';
import type { LessonSection } from './features/lesson-planner/types.ts';
import { Layout } from './features/common/components/Layout.tsx';

const MainAppContent = () => {
  const { user } = useAuth();
  const {
    currentStep,
    lessonPlan,
    loading,
    error,
    saveInProgress,
    lastSaved,
    handleBasicInfoChange,
    addSection,
    setCurrentStep,
    handleExport,
    generateLessonPlanText,
    updateSections,
    saveCurrentPlan,
    removeSection
  } = useLessonPlanState();

  if (!user) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSectionUpdate = (
    phase: 'opening' | 'main' | 'summary',
    index: number,
    updates: Partial<LessonSection>
  ) => {
    if (!lessonPlan) return;

    const updatedSections = {
      ...lessonPlan.sections,
      [phase]: lessonPlan.sections[phase].map((section, i) =>
        i === index ? { ...section, ...updates } : section
      )
    };

    updateSections(updatedSections);
  };

  const sidebarProps = {
    saveInProgress,
    lastSaved,
    lessonTitle: lessonPlan?.basicInfo?.title,
    totalSteps: (lessonPlan?.sections?.opening?.length || 0) +
                (lessonPlan?.sections?.main?.length || 0) +
                (lessonPlan?.sections?.summary?.length || 0)
  };

  return (
    <Layout user={user} sidebarProps={sidebarProps}>
      <div className="p-6">
        <div dir="rtl" className="max-w-4xl mx-auto space-y-6">
          {error && <ErrorAlert message={error} />}
          <Card>
            <CardContent>
              {lessonPlan && (
                <LessonContent
                  currentStep={currentStep}
                  lessonPlan={lessonPlan}
                  saveInProgress={saveInProgress}
                  lastSaved={lastSaved}
                  handleBasicInfoChange={handleBasicInfoChange}
                  addSection={addSection}
                  handleSectionUpdate={handleSectionUpdate}
                  setCurrentStep={setCurrentStep}
                  handleExport={handleExport}
                  generateLessonPlanText={generateLessonPlanText}
                  saveCurrentPlan={saveCurrentPlan}
                  removeSection={removeSection}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Root component that provides authentication context
const App = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;