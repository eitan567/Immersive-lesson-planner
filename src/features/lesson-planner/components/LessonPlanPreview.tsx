import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";

interface LessonPlanPreviewProps {
  content: string;
}

const LessonPlanPreview = ({ content }: LessonPlanPreviewProps) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-right">תצוגה מקדימה של תכנית השיעור</CardTitle>
      </CardHeader>
      <CardContent>
        <pre dir="rtl" className="text-right whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
};

export default LessonPlanPreview;