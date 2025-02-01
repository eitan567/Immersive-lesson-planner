import * as React from "react"
import { useState } from 'react';
import { Button } from "./button.tsx"
import { Input } from "./input.tsx"
import { cn } from "../../lib/utils.ts"
import { useMcpTool } from '../../features/ai-assistant/hooks/useMcp.ts';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Textarea } from "./textarea.tsx";

interface AIInputProps extends React.ComponentProps<"input"> {
  context: string;
  fieldType?: 'topic' | 'content' | 'goals' | 'duration' | 'activity';
  onSave?: () => Promise<void>;
}

const AIInput = React.forwardRef<HTMLInputElement, AIInputProps>(
  ({ className, type, context, fieldType = 'content', onSave, value, onChange, ...props }, ref) => {
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
            currentValue: value?.toString() || '',
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
        if (onChange) {
          const syntheticEvent = {
            currentTarget: { value: suggestion },
            target: { value: suggestion }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
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
      <div className="relative w-full">
        <div className="flex w-full">
          <Input
            type={type}
            className={cn("w-full", className)}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
          />
          <button
            onClick={() => generateSuggestion()}
            className="left-0 top-1.5 p-1.5 text-gray-600 hover:text-blue-800 transition-colors outline-none focus:outline-none"
            title="בקש הצעה לשיפור"
          >
            <SparklesIcon className="h-5 w-5 text-blue-800" />
          </button>
        </div>

        {isOpen && (
          <div className={cn(
            "z-[9999] p-4 bg-white rounded-lg shadow-lg border border-gray-200",
            isChatMode 
              ? "fixed inset-0 overflow-y-auto" 
              : "left-[-8px] top-[45px] absolute w-[-webkit-fill-available] before:content-[''] before:absolute before:top-[-9px] before:left-[13px] before:w-4 before:h-4 before:bg-white before:border-t before:border-l before:border-gray-200 before:rotate-45 before:transform"
          )}>
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
                <div className="space-y-2">
                  <Textarea
                    value={suggestion}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuggestion(e.currentTarget.value)}
                    className={cn(
                      "w-full",
                      isChatMode ? "h-[calc(100vh-120px)]" : "min-h-[200px]"
                    )}
                    dir="rtl"
                  />
                  <div className="flex justify-end gap-2">
                    {isChatMode && (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={handleChatKeyPress}
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
                          <PaperAirplaneIcon className="h-5 w-5 text-blue-800 rotate-180" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleChatMode}
                      className="bg-white hover:bg-gray-50"
                    >
                      {isChatMode ? 'סגור שיחה' : 'פתח שיחה'}                      
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApply}
                      className="bg-white hover:bg-gray-50"
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
  }
);

AIInput.displayName = "AIInput";

export { AIInput };