import React, { useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { SaveProgressAlert } from '../components/SaveProgressAlert.tsx';
import { LessonFieldChatBox } from '../../lesson-planner/components/LessonFieldChatBox.tsx';

interface SidebarProps {
  saveInProgress: boolean;
  lastSaved: Date | null;
  lessonTitle?: string;
  totalSteps: number;
  onUpdateField: (fieldName: string, value: string) => Promise<void>;
  currentValues: Record<string, string>;  // הוסף את זה לProps
}

const Sidebar: React.FC<SidebarProps> = ({
  saveInProgress,
  lastSaved,
  lessonTitle,
  totalSteps,
  onUpdateField,
  currentValues  // יש להוסיף את זה לProps
}) => {
  // הוסף לוג לבדיקת הערכים
  useEffect(() => {
    console.log('Sidebar currentValues:', currentValues);
  }, [currentValues]);

  return (
    <aside className="w-80 border-r border-slate-200 bg-white shrink-0">
      <div className="fixed w-80 p-6 space-y-6">
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
        
        <LessonFieldChatBox 
          onUpdateField={onUpdateField}
          currentValues={currentValues}  // וודא שזה מועבר
        />
      </div>
    </aside>
  );
};

export { Sidebar };
