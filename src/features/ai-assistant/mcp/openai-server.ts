import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  type CallToolRequest,
  RequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { CONFIG } from './config.ts';
import { AIProvider } from './providers/types.ts';
import { logDebug, logError } from './utils/logging.ts';
import { createCorsHeaders } from './utils/http.ts';
import { GenerateSuggestionArgs } from './types.ts';
import { LMStudioProvider } from './providers/lmstudio.ts';
import { OpenAIProvider } from './providers/openai.ts';
import { AnthropicProvider } from './providers/anthropic.ts';
import { GoogleAIProvider } from './providers/google.ts';
import { DeepSeekProvider } from './providers/deepseek.ts';
import { OllamaProvider } from './providers/ollama.ts';

// Health check function
async function checkLMStudioHealth(baseUrl: string): Promise<boolean> {
  try {
    console.log('Checking LM Studio health at:', baseUrl);
    
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'hebrew-mistral-7b',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      })
    });

    if (!response.ok) {
      console.error('LM Studio health check failed:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log('LM Studio health check response:', data);
    return true;
  } catch (error) {
    console.error('LM Studio health check error:', error);
    return false;
  }
}

class AIServer {
  private mcp: Server;
  private provider: AIProvider;
  private transport: StdioServerTransport;

  constructor(provider: AIProvider) {
    logDebug('AIServer', 'Initializing with provider:', provider.constructor.name);
    this.provider = provider;
    this.transport = new StdioServerTransport();

    this.mcp = new Server(
      {
        name: 'ai-server',
        version: '0.1.0',
        timeoutMs: 300000
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupToolHandlers();
  }

  async initialize() {
    try {
      await this.mcp.connect(this.transport);
      logDebug('AIServer', 'MCP Server connected');
    } catch (error) {
      logError('AIServer', 'Failed to initialize MCP server:', error);
      throw error;
    }
  }

  private isValidSuggestionArgs(args: unknown): args is GenerateSuggestionArgs {
    if (!args || typeof args !== 'object') return false;
    const a = args as Partial<GenerateSuggestionArgs>;
    
    const isValid = (
      typeof a.context === 'string' &&
      typeof a.currentValue === 'string' &&
      typeof a.type === 'string' &&
      ['topic', 'content', 'goals', 'duration', 'activity'].includes(a.type) &&
      (a.message === undefined || typeof a.message === 'string')
    );
    
    if (!isValid) {
      logDebug('AIServer', 'Args validation failed:', {
        hasContext: typeof a.context === 'string',
        hasCurrentValue: typeof a.currentValue === 'string',
        hasValidType: typeof a.type === 'string' && 
                     ['topic', 'content', 'goals', 'duration', 'activity'].includes(a.type),
        hasValidMessage: a.message === undefined || typeof a.message === 'string'
      });
    }
    
    return isValid;
  }

  private setupToolHandlers() {
    logDebug('AIServer', 'Setting up tool handlers');
    
    this.mcp.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      logDebug('AIServer', 'Processing generate_suggestion request:', request);

      if (request.params.name !== 'generate_suggestion') {
        logError('AIServer', 'Unknown tool requested:', request.params.name);
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const args = request.params.arguments as unknown as GenerateSuggestionArgs;
      logDebug('AIServer', 'Parsed arguments:', args);
      
      if (!this.isValidSuggestionArgs(args)) {
        logError('AIServer', 'Invalid arguments received:', args);
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid arguments for generate_suggestion'
        );
      }

      try {
        const prompt = this.createPrompt(args.type, args.context, args.currentValue, args.message);
        logDebug('AIServer', 'Generated prompt:', prompt);

        logDebug('AIServer', 'Calling provider...');
        const suggestion = await this.provider.generateCompletion(prompt);
        logDebug('AIServer', 'Received provider response:', suggestion);

        const result = {
          content: [{ type: 'text', text: suggestion }]
        };
        logDebug('AIServer', 'Returning result:', result);
        return result;
      } catch (error) {
        logError('AIServer', 'Failed to generate suggestion:', error);
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Failed to generate suggestion'
        );
      }
    });

    this.mcp.setRequestHandler(ListToolsRequestSchema, async () => {
      logDebug('AIServer', 'Handling ListTools request');
      return {
        tools: [
          {
            name: 'generate_suggestion',
            description: 'Generate an AI suggestion for lesson plan content',
            inputSchema: {
              type: 'object',
              properties: {
                context: {
                  type: 'string',
                  description: 'Current content or context',
                },
                type: {
                  type: 'string',
                  enum: ['topic', 'content', 'goals', 'duration', 'activity'],
                },
                currentValue: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                  description: 'Optional chat message for refining suggestions',
                },
              },
              required: ['context', 'type', 'currentValue'],
            },
          },
        ],
      };
    });
  }

  private createPrompt(type: string, context: string, currentValue: string, message?: string): string {
    let basePrompt = `בהתבסס על ההקשר הבא: "${context}"
והתוכן הנוכחי: "${currentValue || 'ריק'}"`;

    if (message) {
      basePrompt += `\nבהתייחס להודעה הבאה: "${message}"`;
    }

    basePrompt += '\n\n';

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
        return basePrompt + (message ? 'התייחס להודעה והצע שיפור או חלופה לתוכן הנוכחי.' : 'הצע שיפור או חלופה לתוכן הנוכחי.');
    }
  }

  async handleHttpRequest(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(undefined, {
        status: 204,
        headers: createCorsHeaders()
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: createCorsHeaders()
      });
    }

    try {
      logDebug('AIServer', 'Processing HTTP request');
      const requestBody = await request.json();
      logDebug('AIServer', 'Request body:', requestBody);

      // Process the request directly instead of using MCP for now
      if (requestBody.method === 'call_tool' && 
          requestBody.params.name === 'generate_suggestion') {
        
        const args = requestBody.params.arguments as GenerateSuggestionArgs;
        logDebug('AIServer', 'Processing args:', args);

        if (!this.isValidSuggestionArgs(args)) {
          throw new Error('Invalid arguments');
        }

        const prompt = this.createPrompt(args.type, args.context, args.currentValue, args.message);
        logDebug('AIServer', 'Generated prompt:', prompt);

        const suggestion = await this.provider.generateCompletion(prompt);
        logDebug('AIServer', 'Got suggestion:', suggestion);

        const response = {
          jsonrpc: "2.0",
          id: requestBody.id,
          result: {
            content: [{ type: 'text', text: suggestion }]
          }
        };

        logDebug('AIServer', 'Sending response:', response);

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: createCorsHeaders()
        });
      }

      throw new Error('Unsupported method');
    } catch (error) {
      logError('AIServer', 'Request failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return new Response(
        JSON.stringify({ 
          jsonrpc: "2.0",
          id: null,
          error: { 
            code: -32603,
            message: errorMessage 
          } 
        }),
        {
          status: 500,
          headers: createCorsHeaders()
        }
      );
    }
  }
}

// Function to create the appropriate provider based on environment variables
function createProvider(): AIProvider {
  
  const provider = CONFIG.AI_PROVIDER?.toLowerCase();
  logDebug('Provider Factory', 'Selected provider:', provider);
  
  switch (provider) {
    case 'anthropic': {
      if (!CONFIG.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider');
      }
      return new AnthropicProvider({
        apiKey: CONFIG.ANTHROPIC_API_KEY,
        model: CONFIG.ANTHROPIC_MODEL
      });
    }
    case 'google': {
      if (!CONFIG.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY environment variable is required for Google AI provider');
      }
      return new GoogleAIProvider({
        apiKey: CONFIG.GOOGLE_API_KEY,
        model: CONFIG.GOOGLE_MODEL
      });
    }
    case 'deepseek': {
      if (!CONFIG.DEEPSEEK_API_KEY || !CONFIG.DEEPSEEK_BASE_URL) {
        throw new Error('DEEPSEEK_API_KEY and DEEPSEEK_BASE_URL are required for DeepSeek provider');
      }
      return new DeepSeekProvider({
        baseUrl: CONFIG.DEEPSEEK_BASE_URL,
        apiKey: CONFIG.DEEPSEEK_API_KEY,
        model: CONFIG.DEEPSEEK_MODEL
      });
    }
    case 'ollama': {
      return new OllamaProvider({
        baseUrl: CONFIG.OLLAMA_BASE_URL,
        model: CONFIG.OLLAMA_MODEL
      });
    }
    case 'lmstudio': {
      logDebug('Provider Factory', 'Creating LM Studio provider for model:', CONFIG.LM_STUDIO_MODEL);
      return new LMStudioProvider({
        baseUrl: CONFIG.LM_STUDIO_BASE_URL,
        model: CONFIG.LM_STUDIO_MODEL
      });
    }
    default: { // OpenAI is default
      if (!CONFIG.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
      }
      return new OpenAIProvider({
        apiKey: CONFIG.OPENAI_API_KEY,
        model: CONFIG.OPENAI_MODEL
      });
    }     
  }
}

// Start server
async function startServer() {
  console.log('Starting server...');

  // Health check for LM Studio
  if (CONFIG.AI_PROVIDER === 'lmstudio') {
    console.log('Checking LM Studio health before starting server...');
    const isHealthy = await checkLMStudioHealth(CONFIG.LM_STUDIO_BASE_URL);
    if (!isHealthy) {
      console.error('LM Studio is not accessible. Please ensure it is running.');
      Deno.exit(1);
    }
    console.log('LM Studio health check passed!');
  }

  const aiServer = new AIServer(createProvider());
  await aiServer.initialize();

  const PORT = 8000;
  console.log(`AI MCP server running on http://localhost:${PORT}`);

  await serve(async (req: Request) => {
    try {
      const url = new URL(req.url);
      if (url.pathname === '/mcp') {
        return await aiServer.handleHttpRequest(req);
      }
      return new Response(null, {
        status: 404,
        headers: createCorsHeaders()
      });
    } catch (error) {
      logError('Server error:', error);
      return new Response(null, {
        status: 500,
        headers: createCorsHeaders()
      });
    }
  }, { port: PORT });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  Deno.exit(1);
});