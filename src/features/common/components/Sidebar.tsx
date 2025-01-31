import React from 'react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { SaveProgressAlert } from '../components/SaveProgressAlert.tsx';

interface SidebarProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
  lessonTitle?: string;
  totalSteps: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  saveInProgress,
  lastSaved,
  lessonTitle,
  totalSteps
}) => {
  return (
    <aside className="w-80 border-r border-slate-200 bg-white shrink-0">
      <div className="fixed w-80 p-6 space-y-6">
        <SaveProgressAlert
          saveInProgress={saveInProgress}
          lastSaved={lastSaved}
        />
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-medium text-slate-800">סטטוס שיעור</h3>
            <div className="text-sm text-slate-600">
              {lessonTitle || "ללא כותרת"}
            </div>
            <div className="text-sm text-slate-600">
              {totalSteps} שלבים
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};
