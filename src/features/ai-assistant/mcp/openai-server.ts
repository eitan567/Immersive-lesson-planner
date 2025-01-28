import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { CONFIG } from './config.js';

// Define interfaces and types
interface GenerateSuggestionArgs {
  context: string;
  type: 'topic' | 'content' | 'goals' | 'duration' | 'activity';
  currentValue: string;
}

interface AIProvider {
  generateCompletion(prompt: string): Promise<string>;
}

// OpenAI implementation
class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  
  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

// Anthropic implementation
class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  
  constructor(apiKey: string, model: string = 'claude-3-opus-20240229') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: 'You are a helpful assistant with expertise in education and lesson planning. Respond in Hebrew.'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }
}

// Google AI (Gemini) implementation
class GoogleAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash-exp') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// Main server class with provider support
class AIServer {
  private server: Server;
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
    this.server = new Server(
      {
        name: 'ai-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    Deno.addSignalListener("SIGINT", async () => {
      await this.server.close();
      Deno.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_suggestion',
          description: 'Generate an AI suggestion for lesson plan content',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'string',
                description: 'Current content or context for the suggestion',
              },
              type: {
                type: 'string',
                enum: ['topic', 'content', 'goals', 'duration', 'activity'],
                description: 'Type of content to generate',
              },
              currentValue: {
                type: 'string',
                description: 'Current value of the field',
              },
            },
            required: ['context', 'type', 'currentValue'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      if (request.params.name !== 'generate_suggestion') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const args = request.params.arguments as unknown as GenerateSuggestionArgs;
      if (!this.isValidSuggestionArgs(args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid arguments for generate_suggestion'
        );
      }

      return this.generateSuggestion(args);
    });
  }

  private isValidSuggestionArgs(args: unknown): args is GenerateSuggestionArgs {
    if (!args || typeof args !== 'object') return false;
    const a = args as Partial<GenerateSuggestionArgs>;
    return (
      typeof a.context === 'string' &&
      typeof a.currentValue === 'string' &&
      typeof a.type === 'string' &&
      ['topic', 'content', 'goals', 'duration', 'activity'].includes(a.type)
    );
  }

  private async generateSuggestion({ context, type, currentValue }: GenerateSuggestionArgs) {
    try {
      const prompt = this.createPrompt(type, context, currentValue);
      const suggestion = await this.provider.generateCompletion(prompt);

      return {
        content: [
          {
            type: 'text',
            text: suggestion,
          },
        ],
      };
    } catch (error) {
      console.error('AI Provider error:', error);
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : 'Failed to generate suggestion'
      );
    }
  }

  private createPrompt(type: string, context: string, currentValue: string): string {
    const basePrompt = `בהתבסס על ההקשר הבא: "${context}"
והתוכן הנוכחי: "${currentValue || 'ריק'}"

`;

    switch (type) {
      case 'topic':
        return basePrompt + 'הצע נושא יחידה מתאים שיתאים להוראה בחדר אימרסיבי.';
      case 'content':
        return basePrompt + 'הצע תיאור מפורט לפעילות לימודית שתתאים לחדר אימרסיבי.';
      case 'goals':
        return basePrompt + 'הצע מטרות למידה ספציפיות ומדידות.';
      case 'duration':
        return basePrompt + 'הצע משך זמן מתאים לפעילות זו, תוך התחשבות באופי הפעילות וקהל היעד.';
      case 'activity':
        return basePrompt + 'הצע פעילות לימודית שתנצל את היכולות הייחודיות של החדר האימרסיבי.';
      default:
        return basePrompt + 'הצע שיפור או חלופה לתוכן הנוכחי.';
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI MCP server running on stdio');
  }
}

// Function to create the appropriate provider based on environment variables
function createProvider(): AIProvider {
  switch (process.env.AI_PROVIDER?.toLowerCase()) {
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider');
      }
      return new AnthropicProvider(
        process.env.ANTHROPIC_API_KEY,
        process.env.ANTHROPIC_MODEL
      );
    
    case 'google':
      if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY environment variable is required for Google AI provider');
      }
      return new GoogleAIProvider(
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_MODEL
      );
    
    default: // OpenAI is default
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
      }
      return new OpenAIProvider(
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL
      );
  }
}

// Create and run the server
const provider = createProvider();
const server = new AIServer(provider);
server.run().catch((error: unknown) => console.error('Server error:', error));