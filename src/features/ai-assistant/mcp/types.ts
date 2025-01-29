export interface GenerateSuggestionArgs {
    context: string;
    type: 'topic' | 'content' | 'goals' | 'duration' | 'activity';
    currentValue: string;
  }
  
  export interface AIResponse {
    content: Array<{
      type: string;
      text: string;
    }>;
  }
  
  export type SuggestionType = 'topic' | 'content' | 'goals' | 'duration' | 'activity';