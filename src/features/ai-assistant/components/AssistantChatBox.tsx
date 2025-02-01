import React from 'react';
import { useState } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Textarea } from "../../../components/ui/textarea.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { useMcpTool } from '../hooks/useMcp.ts';
import { SparklesIcon, XMarkIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface AssistantChatBoxProps {
  onApplySuggestion: (suggestion: string) => void;
  context: string;
  placeholder?: string;
  fieldType?: 'topic' | 'content' | 'goals' | 'duration' | 'activity';
  onSave?: () => Promise<void>;
}

export const AssistantChatBox = ({
  onApplySuggestion,
  context,
  fieldType = 'content',
  onSave
}: AssistantChatBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async (message?: string) => {
    setLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const result = await useMcpTool({
        serverName: 'ai-server',
        toolName: 'generate_suggestion',
        arguments: {
          context,
          currentValue: suggestion || '',
          type: fieldType,
          ...(message && { message })
        }
      });
      
      if ('error' in result) {
        throw new Error(result.error);
      }

      const newSuggestion = result.content[0]?.text;
      if (newSuggestion) {
        setSuggestion(newSuggestion);
      } else {
        throw new Error('לא התקבלה הצעה מהמערכת');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בקבלת הצעה');
      console.error('Failed to generate suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      await onApplySuggestion(suggestion);
      if (onSave) {
        await onSave();
      }
      setIsOpen(false);
      setIsChatMode(false);
      setSuggestion('');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בשמירת השינויים');
      console.error('Failed to apply suggestion:', error);
    }
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      await generateSuggestion(chatMessage);
      setChatMessage('');
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatMode = () => {
    setIsChatMode(!isChatMode);
    setIsOpen(true);
  };

  return (
    <div className="absolute left-6 w-full">
      <div className="flex gap-2">
        <button
          onClick={() => generateSuggestion()}
          className="absolute left-8 top-0.5 p-1.5 text-gray-600 hover:text-blue-800 transition-colors outline-none focus:outline-none"
          title="בקש הצעה לשיפור"
        >
          <SparklesIcon className="h-5 w-5 text-blue-800" />
        </button>
        <button
          onClick={toggleChatMode}
          className="absolute left-0 top-0.5 p-1.5 text-gray-600 hover:text-blue-800 transition-colors outline-none focus:outline-none"
          title="פתח שיחה"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-800" />
        </button>
      </div>

      {isOpen && (
        <div className={`${isChatMode ? 'fixed inset-0 z-50 bg-white p-4' : 'w-full absolute top-8 left-0 z-[9999] mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 before:content-[\'\'] before:absolute before:top-[-8px] before:left-[13px] before:w-4 before:h-4 before:bg-white before:border-t before:border-l before:border-gray-200 before:rotate-45 before:transform'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              {isChatMode ? 'שיחה' : 'הצעה לשיפור'}
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsChatMode(false);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">מייצר הצעה...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  onClick={() => generateSuggestion()}
                  className="mt-2"
                >
                  נסה שוב
                </Button>
              </div>
            ) : suggestion ? (
              <div className="space-y-2 relative">
                <Textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className={`border-gray-200 w-full ${isChatMode ? 'h-[calc(100vh-200px)]' : 'min-h-[300px]'}`}
                  dir="rtl"
                />
                <div className="flex justify-between gap-2">
                  {isChatMode && (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleChatKeyPress}
                        placeholder="כתוב הודעה..."
                        className="flex-1"
                        dir="rtl"
                      />
                      <Button
                        onClick={handleSendMessage}
                        variant="ghost"
                        size="sm"
                        className="px-2"
                      >
                        <PaperAirplaneIcon className="h-5 w-5 text-blue-800" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApply}
                    className="text-[#681bc2] border border-[#681bc2]"
                  >
                    אישור
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">מייצר הצעה...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};