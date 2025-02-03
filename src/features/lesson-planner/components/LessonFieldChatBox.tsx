import React, { useState, useEffect } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Card } from "../../../components/ui/card.tsx";
import { useMcpTool } from '../../ai-assistant/hooks/useMcp.ts';
import { XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface LessonFieldChatBoxProps {
  onUpdateField: (fieldName: string, value: string) => Promise<void>;
  currentValues: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  topic: 'נושא היחידה',
  duration: 'זמן כולל',
  gradeLevel: 'שכבת גיל',
  priorKnowledge: 'ידע קודם נדרש',
  position: 'מיקום בתוכן',
  contentGoals: 'מטרות ברמת התוכן',
  skillGoals: 'מטרות ברמת המיומנויות'
};

export const LessonFieldChatBox: React.FC<LessonFieldChatBoxProps> = ({
  onUpdateField,
  currentValues
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

      // הוסף לוג לפני שליחת הבקשה
      console.log('Sending request with currentValues:', currentValues);
      
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
          currentValues: currentValues,
          rephrase: currentMessage.includes('נסח') || currentMessage.includes('שפר')
        }
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      const parsed = JSON.parse(response.content[0].text);
      
      // Handle both single object and array responses
      const updates = Array.isArray(parsed) ? parsed : [parsed];
      
      for (const update of updates) {
        if (!update.fieldToUpdate || !update.userResponse || !update.newValue) {
          throw new Error('תשובת המערכת חסרה שדות נדרשים');
        }

        setMessages(prev => [...prev, {
          text: update.userResponse,
          sender: 'ai',
          timestamp: new Date()
        }]);

        await onUpdateField(update.fieldToUpdate, update.newValue);
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

  return (
    <Card className="mt-4">
      <div className="p-4 bg-[#fff4fc] rounded-lg">
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
            <div className="h-[calc(100vh-380px)] overflow-y-auto border rounded-lg p-3 mt-2 space-y-3 bg-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#681bc2] hover:scrollbar-thumb-[#681bc2] scrollbar-thumb-rounded-md">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  אפשר לבקש עזרה בניסוח, שיפור או שינוי של פרטי השיעור.
                  <br />
                  לדוגמה:
                  <br />
                  "שנה את נושא היחידה ל'אנרגיה מתחדשת'"
                  <br />
                  "תעזור לי לנסח טוב יותר את מטרות התוכן"
                  <br />
                  "תציע לי רעיונות לשיפור הידע הקודם הנדרש"
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
                        <UserCircleIcon className="h-6 w-6 text-blue-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
                          AI
                        </div>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg max-w-[80%] ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      {message.text}
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
                className="flex-1"
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