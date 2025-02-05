import React, { useState, useEffect } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Card } from "../../../components/ui/card.tsx";
import { useMcpTool } from '../../ai-assistant/hooks/useMcp.ts';
import { Badge } from "../../../components/ui/badge.tsx";
import { SiProbot } from "react-icons/si";
import { MdFace } from "react-icons/md";
import { XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

import { LessonPlanSections } from '../types.ts';

interface LessonFieldChatBoxProps {
  onUpdateField: (fieldName: string | Array<[string, string]>, value?: string) => Promise<void>;
  currentValues: Record<string, string>;
  sections: LessonPlanSections;
  saveCurrentPlan: () => Promise<void>;
}

const FIELD_LABELS: Record<string, string> = {
  // Basic info fields
  topic: 'נושא היחידה',
  duration: 'זמן כולל',
  gradeLevel: 'שכבת גיל',
  priorKnowledge: 'ידע קודם נדרש',
  position: 'מיקום בתוכן',
  contentGoals: 'מטרות ברמת התוכן',
  skillGoals: 'מטרות ברמת המיומנויות',
  
  // Lesson section fields
  'opening.0.content': 'פתיחה - תוכן/פעילות',
  'opening.0.spaceUsage': 'פתיחה - שימוש במרחב הפיזי',
  'main.0.content': 'גוף השיעור - תוכן/פעילות',
  'main.0.spaceUsage': 'גוף השיעור - שימוש במרחב הפיזי',
  'summary.0.content': 'סיכום - תוכן/פעילות',
  'summary.0.spaceUsage': 'סיכום - שימוש במרחב הפיזי'
};

export const LessonFieldChatBox: React.FC<LessonFieldChatBoxProps> = ({
  onUpdateField,
  currentValues,
  sections,
  saveCurrentPlan
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // הוסף לוג לבדיקת הערכים בעת טעינת הקומפוננטה
  useEffect(() => {
    console.log('LessonFieldChatBox mounted with currentValues:', currentValues);
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    try {
      setLoading(true);

      // Build currentValues including section data
      const allValues = {
        ...currentValues,
        // Add section values with null checks
        'opening.0.content': sections?.opening?.[0]?.content || '',
        'opening.0.spaceUsage': sections?.opening?.[0]?.spaceUsage || '',
        'main.0.content': sections?.main?.[0]?.content || '',
        'main.0.spaceUsage': sections?.main?.[0]?.spaceUsage || '',
        'summary.0.content': sections?.summary?.[0]?.content || '',
        'summary.0.spaceUsage': sections?.summary?.[0]?.spaceUsage || ''
      };

      console.log('Sending request with currentValues:', allValues);
      
      setMessages(prev => [...prev, {
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      }]);

      const response = await useMcpTool({
        serverName: 'ai-server',
        toolName: 'update_lesson_field',
        arguments: {
          message: currentMessage,
          fieldLabels: FIELD_LABELS,
          currentValues: allValues,
          rephrase: currentMessage.includes('נסח') || currentMessage.includes('שפר')
        }
      });

      if ('error' in response) {
        let errorMessage = response.error;
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('Resource has been exhausted') ||
              errorMessage.includes('quota')) {
            errorMessage = 'מצטער, המערכת לא זמינה כרגע. אנא נסה שוב מאוחר יותר או פנה למנהל המערכת.';
          } else if (errorMessage.includes('Invalid response format')) {
            errorMessage = 'מצטער, התקבלה תשובה לא תקינה מהשרת. אנא נסה שוב.';
          }
        }
        throw new Error(errorMessage);
      }

      const responseText = response.content?.[0]?.text;
      if (!responseText) {
        throw new Error('לא התקבלה תשובה מהשרת. אנא נסה שוב.');
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('התקבל מידע לא תקין מהשרת. אנא נסה שוב.');
      }
      
      // Handle both single object and array responses
      const updates = Array.isArray(parsed) ? parsed : [parsed];
      
      // First validate all updates
      for (const update of updates) {
        if (!update.fieldToUpdate || !update.userResponse || !update.newValue) {
          throw new Error('תשובת המערכת חסרה שדות נדרשים');
        }
      }

      // Then add all AI responses to messages
      setMessages(prev => [
        ...prev,
        ...updates.map(update => ({
          text: update.userResponse,
          sender: 'ai' as const,
          timestamp: new Date()
        }))
      ]);

      // Create a batch update array, handling both basic and section updates
      const batchUpdates = updates.map(update => {
        const fieldName = update.fieldToUpdate;
        const newValue = update.newValue;
        
        // Check if this is a section update
        if (fieldName.includes('.')) {
          // Extract section and type from field name (e.g., 'opening.0.content')
          const [phase, index, field] = fieldName.split('.');
          
          // Make sure this is a valid section field we can handle
          if (phase && field && ['opening', 'main', 'summary'].includes(phase) &&
              ['content', 'spaceUsage'].includes(field)) {
            return [fieldName, newValue] as [string, string];
          }
        }
        
        // Handle basic fields
        return [fieldName, newValue] as [string, string];
      });

      // Filter out any invalid updates
      const validUpdates = batchUpdates.filter(update =>
        update && FIELD_LABELS[update[0]] !== undefined
      );

      // Apply all valid updates in one batch
      if (validUpdates.length > 0) {
        await onUpdateField(validUpdates);
        await saveCurrentPlan();
      }

    } catch (error) {
      console.error('Failed to process request:', error);
      setMessages(prev => [...prev, {
        text: error instanceof Error ? error.message : 'מצטער, נתקלתי בבעיה בעיבוד הבקשה. אנא נסה שנית.',
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageText = (text: string) => {
    // Match field tags like <שדה: שכבת גיל>
    const parts = text.split(/(<שדה:\s*[^>]+>)/);
    return parts.map((part, index) => {
      const fieldMatch = part.match(/<שדה:\s*([^>]+)>/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1].trim();
        return (
          <>
          <br/>
          <Badge key={index} className="mx-1 float-left mt-[10px]">
            {fieldName}
          </Badge>
          </>
        );
      }
      return part;
    });
  };

  return (
    <Card className="mt-4 border border-[#eadfff] rounded-[9px] shadow-none">
      <div className="p-4 bg-[#fff4fc] rounded-lg ">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-slate-800 mb-1">שיחה על פרטי השיעור</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-700"
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <div className="h-[calc(100vh-430px)] overflow-y-auto border rounded-lg p-3 mt-2 space-y-3 bg-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#681bc2] hover:scrollbar-thumb-[#681bc2] scrollbar-thumb-rounded-md">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  אפשר לבקש עזרה בניסוח, שיפור או שינוי של פרטי השיעור ומבנה השיעור.
                  <br />
                  לדוגמה:
                  <br />
                  דוגמאות לפרטי השיעור:
                  <br />
                  "שנה את נושא היחידה ל'אנרגיה מתחדשת'"
                  <br />
                  "תעזור לי לנסח טוב יותר את מטרות התוכן"
                  <br />
                  דוגמאות לבניית השיעור:
                  <br />
                  "תציע פעילות מעניינת לפתיחת השיעור"
                  <br />
                  "תשפר את השימוש במרחב בגוף השיעור"
                  <br />
                  "תציע פעילות סיכום אינטראקטיבית"
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="shrink-0">
                      {message.sender === 'user' ? (
                        <MdFace className="h-5 w-5 text-[darkslateblue]" />
                      ) : (
                        // <div className="h-6 w-6 rounded-full bg-[darkmagenta] flex items-center justify-center text-white text-xs">
                        //   AI
                        // </div>
                        <SiProbot className="h-5 w-5 text-[darkmagenta]" />
                      )}
                    </div>
                    <div
                      className={`p-2 text-sm rounded-lg max-w-[80%] ${
                        message.sender === 'user'
                          ? 'bg-[darkslateblue] text-white px-[8px] pt-[3px] pb-[4px]'
                          : 'bg-[honeydew] border rounded-md'
                      }`}
                    >
                      {renderMessageText(message.text)}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="בקש עזרה בניסוח, שיפור או שינוי פרטי השיעור..."
                className="flex-1 shadow-none"
                dir="rtl"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !currentMessage.trim()}
                size="icon"
                className="border-none outline-none shadow-none"
              >
                <PaperAirplaneIcon className="h-4 w-4 rotate-180 border-none outline-none shadow-none text-[#540ba9]" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};