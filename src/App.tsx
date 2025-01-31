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

  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex bg-slate-50">
        {/* Primary Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6 rtl">
            {error && <ErrorAlert message={error} />}

      <Card>
        {/* <CardHeader>
          <LessonPlannerHeader />
        </CardHeader> */}
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
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-slate-200 bg-white p-6 space-y-6">
          <SaveProgressAlert
            saveInProgress={saveInProgress}
            lastSaved={lastSaved}
          />
          
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-slate-800">סטטוס שיעור</h3>
              <div className="text-sm text-slate-600">
                {lessonPlan?.basicInfo?.title || "ללא כותרת"}
              </div>
              <div className="text-sm text-slate-600">
                {(lessonPlan?.sections?.opening?.length || 0) +
                 (lessonPlan?.sections?.main?.length || 0) +
                 (lessonPlan?.sections?.summary?.length || 0)} שלבים
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
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