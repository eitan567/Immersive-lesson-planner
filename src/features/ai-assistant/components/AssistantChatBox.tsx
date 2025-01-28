import React from 'react';
import { useState } from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { Textarea } from "../../../components/ui/textarea.tsx";
import { useMcpTool } from '../hooks/useMcp.ts';

interface AssistantChatBoxProps {
  onApplySuggestion: (suggestion: string) => void;
  context: string;
  placeholder?: string;
  fieldType?: 'topic' | 'content' | 'goals' | 'duration' | 'activity';
}

export const AssistantChatBox = ({ 
  onApplySuggestion, 
  context,
  placeholder = "צור תיאור חדש",
  fieldType = 'content'
}: AssistantChatBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await useMcpTool({
        serverName: 'openai',
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

  const handleApply = () => {
    onApplySuggestion(suggestion);
    setIsOpen(false);
    setSuggestion('');
    setError(null);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800"
      >
        🤖 בקש הצעה לשיפור
      </Button>
    );
  }

  return (
    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">עוזר חכם</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          תוכן נוכחי: {context || 'ריק'}
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
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
          <div className="space-y-2">
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[100px]"
              dir="rtl"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuggestion('')}
              >
                נקה
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
              >
                החל שינויים
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={generateSuggestion}
              className="mx-auto"
            >
              צור הצעה
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};