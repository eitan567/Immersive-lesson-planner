import { AIProvider, ProviderConfig } from './types.ts';
import { makeRequest } from '../utils/http.ts';
import { logDebug, logError, logRequest, logResponse } from '../utils/logging.ts';

export class DeepSeekProvider implements AIProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeout: number;

  constructor(config: ProviderConfig) {
    const { baseUrl, apiKey, model = 'deepseek-ai/DeepSeek-R1', timeout = 180000 } = config;
    
    if (!baseUrl) throw new Error('DeepSeek base URL is required');
    if (!apiKey) throw new Error('DeepSeek API key is required');
    
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.timeout = timeout;

    logDebug('DeepSeek', 'Initialized with config:', { baseUrl, model, timeout });
  }

  async generateCompletion(prompt: string): Promise<string> {
    logDebug('DeepSeek', 'Generating completion for prompt:', prompt);

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
      max_tokens: 800
    };

    try {
      logRequest('DeepSeek', requestBody);

      const response = await makeRequest(`${this.baseUrl}/chat/completions`, {
        body: requestBody,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: this.timeout
      });

      if (!response.ok) {
        const error = await response.json();
        logError('DeepSeek API error:', error);
        throw new Error(`DeepSeek API error: ${error.error?.message || JSON.stringify(error)}`);
      }

      const data = await response.json();
      logResponse('DeepSeek', data);

      if (!data.choices?.[0]?.message?.content) {
        logError('DeepSeek invalid response format:', data);
        throw new Error('Invalid response format from DeepSeek API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      logError('DeepSeek completion error:', error);
      throw error;
    }
  }
}