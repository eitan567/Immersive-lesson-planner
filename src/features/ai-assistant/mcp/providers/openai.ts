import { AIProvider, ProviderConfig } from './types.ts';
import { makeRequest } from '../utils/http.ts';
import { logDebug, logError, logRequest, logResponse } from '../utils/logging.ts';

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeout: number;

  constructor(config: ProviderConfig) {
    const { apiKey, model = 'gpt-3.5-turbo', timeout = 180000 } = config;
    
    if (!apiKey) throw new Error('OpenAI API key is required');
    
    this.apiKey = apiKey;
    this.model = model;
    this.timeout = timeout;

    logDebug('OpenAI', 'Initialized with config:', { model, timeout });
  }

  async generateCompletion(prompt: string): Promise<string> {
    logDebug('OpenAI', 'Generating completion for prompt:', prompt);

    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant with expertise in education and lesson planning. Respond in Hebrew.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    try {
      logRequest('OpenAI', requestBody);

      const response = await makeRequest('https://api.openai.com/v1/chat/completions', {
        body: requestBody,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: this.timeout
      });

      if (!response.ok) {
        const error = await response.json();
        logError('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      logResponse('OpenAI', data);

      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      logError('OpenAI completion error:', error);
      throw error;
    }
  }
}