import React from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card.tsx';
import './index.css';

import { AuthProvider } from './features/auth/AuthContext.tsx';
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
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-3 rtl:mr-0 rtl:ml-3" />
            <span className="text-xl font-semibold text-slate-800">Immersive Lesson Planner</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-800">{user?.email}</p>
              <p className="text-xs text-slate-500">מנהל מערכת</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
              <span className="text-slate-600">מ</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-slate-50">
        {/* Primary Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6 rtl">
            {error && <ErrorAlert message={error} />}

            <Card>
        <CardHeader>
          <LessonPlannerHeader />
        </CardHeader>
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