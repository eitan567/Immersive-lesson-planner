import React, { useState } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Card } from "../../../components/ui/card.tsx";
import { useMcpTool } from '../../ai-assistant/hooks/useMcp.ts';
import { XMarkIcon, PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface LessonFieldChatBoxProps {
  onUpdateField: (fieldName: string, value: string) => Promise<void>;
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
  onUpdateField
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const newUserMessage: Message = {
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    setLoading(true);
    setError(null);

    try {
      const result = await useMcpTool({
        serverName: 'ai-server',
        toolName: 'update_lesson_field',
        arguments: {
          message: currentMessage,
          fieldLabels: FIELD_LABELS
        }
      });

      if ('error' in result) {
        throw new Error(result.error);
      }

      const aiResponse = result.content[0]?.text;
      if (!aiResponse) {
        throw new Error('לא התקבלה תשובה מהמערכת');
      }

      // Parse the AI response to get field name and value
      try {
        // Extract JSON content using regex to find object between curly braces
        const jsonMatch = aiResponse.match(/({[\s\S]*?})/);
        if (!jsonMatch) {
          throw new Error('לא נמצא תוכן JSON בתשובה');
        }
        const responseData = JSON.parse(jsonMatch[1]);
        if (responseData.fieldName && responseData.value) {
          await onUpdateField(responseData.fieldName, responseData.value);
          
          // Add success message
          const successMessage: Message = {
            text: `עודכן השדה "${FIELD_LABELS[responseData.fieldName] || responseData.fieldName}" לערך החדש`,
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        throw new Error('תשובת המערכת לא תקינה');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בשליחת ההודעה';
      setError(errorMsg);
      
      // Add error message to chat
      const errorMessage: Message = {
        text: errorMsg,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setLoading(false);
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
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-slate-800">שיחה על פרטי השיעור</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-700"
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <div className="h-[300px] overflow-y-auto border rounded-lg p-3 space-y-3 bg-gray-50 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-500 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-md">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  אפשר לשאול שאלות או לבקש שינויים בפרטי השיעור.
                  <br />
                  לדוגמה: "שנה את נושא היחידה ל'אנרגיה מתחדשת'"
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
                placeholder="שאל שאלה לגבי פרטי השיעור..."
                className="flex-1"
                dir="rtl"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !currentMessage.trim()}
                variant="outline"
                size="icon"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};