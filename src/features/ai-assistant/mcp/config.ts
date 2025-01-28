import { config } from 'dotenv';
import { z } from 'zod';

// Load .env file
config();

// Define configuration schema
const ConfigSchema = z.object({
  // AI Provider
  AI_PROVIDER: z.enum(['openai', 'google', 'anthropic']).default('openai'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  
  // Google
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_MODEL: z.string().default('gemini-2.0-flash-exp'),
  
  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-opus-20240229'),
  
  // Server
  SERVER_NAME: z.string().default('ai-server'),
  SERVER_VERSION: z.string().default('0.1.0'),
});

// Parse and validate configuration
const parsedConfig = ConfigSchema.safeParse(process.env);

if (!parsedConfig.success) {
  console.error('Invalid configuration:', parsedConfig.error.format());
  process.exit(1);
}

export const CONFIG = parsedConfig.data;

// Validate required API keys based on provider
function validateConfig() {
  const provider = CONFIG.AI_PROVIDER;
  
  switch (provider) {
    case 'openai':
      if (!CONFIG.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
      }
      break;
      
    case 'google':
      if (!CONFIG.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is required when using Google AI provider');
      }
      break;
      
    case 'anthropic':
      if (!CONFIG.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is required when using Anthropic provider');
      }
      break;
  }
}

validateConfig();