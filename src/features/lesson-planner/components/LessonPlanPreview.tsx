import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface LessonPlanPreviewProps {
  content: string;
  onContentChange?: (newContent: string) => void;
}

const LessonPlanPreview = ({ content: initialContent, onContentChange }: LessonPlanPreviewProps) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <Card className="mt-4 border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-right flex items-center justify-end gap-2 text-gray-800">
          <span>תצוגה מקדימה של תכנית השיעור</span>
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        <textarea
          value={content}
          onChange={handleContentChange}
          dir="rtl"
          className="w-full min-h-[550px] text-right font-['Varela_Round'] text-[1.05rem] leading-7 
            bg-gray-50 p-6 rounded-lg border border-gray-100 
            text-gray-700 resize-y
            focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200
            transition-all duration-200"
          style={{ 
            fontFamily: "'Varela Round', 'Assistant', sans-serif",
            fontFeatureSettings: '"kern"',
            WebkitFontSmoothing: 'antialiased'
          }}
        />
      </CardContent>
    </Card>
  );
};

export default LessonPlanPreview;