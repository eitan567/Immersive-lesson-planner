import React from 'react';
import { useState } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Textarea } from "../../../components/ui/textarea.tsx";
import { useMcpTool } from '../hooks/useMcp.ts';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async () => {
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
          type: fieldType
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
      setSuggestion('');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בשמירת השינויים');
      console.error('Failed to apply suggestion:', error);
    }
  };

  return (
    <div className="absolute left-6">
      <button
        onClick={generateSuggestion}
        className="absolute left-1 top-[-42px] p-1.5 text-gray-600 hover:text-blue-800 transition-colors"
        title="בקש הצעה לשיפור"
      >
        <SparklesIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="w-[32rem] absolute top-0 left-0 z-[9999] mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 before:content-[''] before:absolute before:top-[-8px] before:left-[20px] before:w-4 before:h-4 before:bg-white before:border-t before:border-l before:border-gray-200 before:rotate-45 before:transform">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">הצעה לשיפור</h3>
            <button
              onClick={() => setIsOpen(false)}
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
                  onClick={generateSuggestion}
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
                  className="min-h-[100px] border-gray-200"
                  dir="rtl"
                />
                <div className="flex justify-end gap-2">
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
};