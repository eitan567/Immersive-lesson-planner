import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface LessonPlanPreviewProps {
  content: string;
}

const LessonPlanPreview = ({ content }: LessonPlanPreviewProps) => {
  return (
    <Card className="mt-4 border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-right flex items-center justify-end gap-2 text-gray-800">
          <span>תצוגה מקדימה של תכנית השיעור</span>
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        <pre dir="rtl" className="text-right whitespace-pre-wrap bg-gray-50 p-6 rounded-lg border border-gray-100 text-gray-700 leading-relaxed">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
};

export default LessonPlanPreview;