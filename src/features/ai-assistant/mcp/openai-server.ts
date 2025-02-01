import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from "@modelcontextprotocol/sdk/types.js";

import { CONFIG } from "./config.ts";
import { AIProvider } from "./providers/types.ts";
import { logDebug, logError } from "./utils/logging.ts";
import { createCorsHeaders } from "./utils/http.ts";

import {
  GenerateSuggestionArgs,
  UpdateLessonFieldArgs
} from "./types.ts";

// Providers
import { LMStudioProvider } from "./providers/lmstudio.ts";
import { OpenAIProvider } from "./providers/openai.ts";
import { AnthropicProvider } from "./providers/anthropic.ts";
import { GoogleAIProvider } from "./providers/google.ts";
import { DeepSeekProvider } from "./providers/deepseek.ts";
import { OllamaProvider } from "./providers/ollama.ts";

/**
 * Checks if the LM Studio server is reachable and healthy.
 */
async function checkLMStudioHealth(baseUrl: string): Promise<boolean> {
  try {
    console.log("Checking LM Studio health at:", baseUrl);
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "hebrew-mistral-7b",
        messages: [{ role: "user", content: "test" }],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      })
    });
    if (!response.ok) {
      console.error("LM Studio health check failed:", await response.text());
      return false;
    }
    const data = await response.json();
    console.log("LM Studio health check response:", data);
    return true;
  } catch (error) {
    console.error("LM Studio health check error:", error);
    return false;
  }
}

/**
 * A class that implements the AI server logic using an AIProvider.
 * It sets up MCP tool handlers and also provides a handleHttpRequest method
 * for direct HTTP usage.
 */
class AIServer {
  private mcp: Server;
  private provider: AIProvider;
  private transport: StdioServerTransport;

  constructor(provider: AIProvider) {
    this.provider = provider;
    this.transport = new StdioServerTransport();
    this.mcp = new Server(
      { name: "ai-server", version: "0.1.0", timeoutMs: 300000 },
      { capabilities: { tools: {} } }
    );
    this.setupToolHandlers();
  }

  /**
   * Connects the server to the MCP transport.
   */
  async initialize(): Promise<void> {
    try {
      await this.mcp.connect(this.transport);
      logDebug("AIServer", "MCP Server connected");
    } catch (error) {
      logError("AIServer", "Failed to initialize MCP server:", error);
      throw error;
    }
  }

  /**
   * Type guard to validate GenerateSuggestionArgs.
   */
  private isValidSuggestionArgs(args: unknown): args is GenerateSuggestionArgs {
    if (!args || typeof args !== "object") return false;
    const a = args as Partial<GenerateSuggestionArgs>;
    return (
      typeof a.context === "string" &&
      typeof a.currentValue === "string" &&
      typeof a.type === "string" &&
      ["topic", "content", "goals", "duration", "activity"].includes(a.type) &&
      (a.message === undefined || typeof a.message === "string")
    );
  }

  /**
   * Type guard to validate UpdateLessonFieldArgs.
   */
  private isValidUpdateFieldArgs(args: unknown): args is UpdateLessonFieldArgs {
    if (!args || typeof args !== "object") return false;
    const a = args as Partial<UpdateLessonFieldArgs>;
    return (
      typeof a.message === "string" &&
      typeof a.fieldLabels === "object" &&
      a.fieldLabels !== null
    );
  }

  /**
   * Registers tool handlers for the MCP server.
   */
  private setupToolHandlers(): void {
    // ListTools handler: returns the available tools
    this.mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "generate_suggestion",
          description: "Generate an AI suggestion for lesson plan content",
          inputSchema: {
            type: "object",
            properties: {
              context: {
                type: "string",
                description: "Current content or context"
              },
              type: {
                type: "string",
                enum: ["topic", "content", "goals", "duration", "activity"]
              },
              currentValue: { type: "string" },
              message: {
                type: "string",
                description: "Optional chat message for refining suggestions"
              }
            },
            required: ["context", "type", "currentValue"]
          }
        },
        {
          name: "update_lesson_field",
          description: "Parse user message and update lesson field",
          inputSchema: {
            type: "object",
            properties: {
              message: { type: "string" },
              fieldLabels: {
                type: "object",
                additionalProperties: { type: "string" }
              }
            },
            required: ["message", "fieldLabels"]
          }
        }
      ]
    }));

    // CallTool handler: dispatches calls to the appropriate tool
    this.mcp.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "generate_suggestion": {
          // Instead of direct "as GenerateSuggestionArgs", let's do a check
          const rawArgs = request.params.arguments;
          if (!this.isValidSuggestionArgs(rawArgs)) {
            throw new McpError(ErrorCode.InvalidParams, "Invalid arguments for generate_suggestion");
          }
          const args = rawArgs as GenerateSuggestionArgs;
          const prompt = this.createGeneratePrompt(args);
          const suggestion = await this.provider.generateCompletion(prompt);
          return {
            content: [{ type: "text", text: suggestion }]
          };
        }

        case "update_lesson_field": {
          const rawArgs = request.params.arguments;
          if (!this.isValidUpdateFieldArgs(rawArgs)) {
            throw new McpError(ErrorCode.InvalidParams, "Invalid arguments for update_lesson_field");
          }
          const args = rawArgs as UpdateLessonFieldArgs;
          const prompt = this.createUpdatePrompt(args);
          const response = await this.provider.generateCompletion(prompt);
          return {
            content: [{ type: "text", text: response }]
          };
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  /**
   * Builds the prompt for generate_suggestion.
   */
  private createGeneratePrompt(args: GenerateSuggestionArgs): string {
    let prompt = `בהתבסס על ההקשר הבא: "${args.context}"
והתוכן הנוכחי: "${args.currentValue || "ריק"}"`;

    if (args.message) {
      prompt += `\nבהתייחס להודעה הבאה: "${args.message}"`;
    }
    prompt += "\n\n";

    switch (args.type) {
      case "topic":
        prompt += "הצע נושא יחידה מתאים שיתאים להוראה בחדר אימרסיבי.";
        break;
      case "content":
        prompt += "הצע תיאור מפורט לפעילות לימודית שתתאים לחדר אימרסיבי.";
        break;
      case "goals":
        prompt += "הצע מטרות למידה ספציפיות ומדידות.";
        break;
      case "duration":
        prompt += "הצע משך זמן מתאים לפעילות זו, תוך התחשבות באופי הפעילות וקהל היעד.";
        break;
      case "activity":
        prompt += "הצע פעילות לימודית שתנצל את היכולות הייחודיות של החדר האימרסיבי.";
        break;
      default:
        prompt += "הצע שיפור או חלופה לתוכן הנוכחי.";
        break;
    }

    return prompt;
  }

  /**
   * Builds the prompt for update_lesson_field.
   */
  private createUpdatePrompt(args: UpdateLessonFieldArgs): string {
    const fieldsInfo = Object.entries(args.fieldLabels)
      .map(([key, label]) => `${key}: ${label}`)
      .join("\n");

    return `אתה עוזר המתמחה בעדכון שדות תכנית לימודים. המשתמש רוצה לעדכן שדה כלשהו.
השדות הזמינים הם:
${fieldsInfo}

ההודעה מהמשתמש היא: "${args.message}"

זהה את השדה שהמשתמש רוצה לעדכן ואת הערך החדש המבוקש.
החזר תשובה בפורמט JSON בלבד עם שני שדות:
- fieldName: שם השדה לעדכון (אחד מהשדות ברשימה למעלה)
- value: הערך החדש לשדה

לדוגמה:
{
  "fieldName": "topic",
  "value": "גנטיקה בעולם המודרני"
}`;
  }

  /**
   * Handle incoming HTTP requests, bridging them to the same logic as the MCP calls.
   */
  async handleHttpRequest(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: createCorsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: createCorsHeaders()
      });
    }

    try {
      const body = await request.json();
      // We expect JSON-RPC style calls with "method" and "params"
      if (body.method !== "call_tool") {
        throw new Error("Unsupported method");
      }

      // We'll do the same approach as in the MCP handlers
      switch (body.params.name) {
        case "generate_suggestion": {
          const rawArgs = body.params.arguments;
          if (!this.isValidSuggestionArgs(rawArgs)) {
            throw new Error("Invalid arguments for generate_suggestion");
          }
          const args = rawArgs as GenerateSuggestionArgs;

          const prompt = this.createGeneratePrompt(args);
          const suggestion = await this.provider.generateCompletion(prompt);
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result: {
                content: [{ type: "text", text: suggestion }]
              }
            }),
            {
              status: 200,
              headers: createCorsHeaders()
            }
          );
        }

        case "update_lesson_field": {
          const rawArgs = body.params.arguments;
          if (!this.isValidUpdateFieldArgs(rawArgs)) {
            throw new Error("Invalid arguments for update_lesson_field");
          }
          const args = rawArgs as UpdateLessonFieldArgs;

          const prompt = this.createUpdatePrompt(args);
          const response = await this.provider.generateCompletion(prompt);
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: body.id,
              result: {
                content: [{ type: "text", text: response }]
              }
            }),
            {
              status: 200,
              headers: createCorsHeaders()
            }
          );
        }

        default:
          throw new Error("Unsupported tool");
      }
    } catch (error) {
      logError("AIServer", "Request failed:", error);
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : "Internal server error"
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

/**
 * Create the AIProvider instance based on the environment config.
 */
function createProvider(): AIProvider {
  const provider = CONFIG.AI_PROVIDER?.toLowerCase();
  logDebug("Provider Factory", "Selected provider:", provider);

  switch (provider) {
    case "anthropic": {
      if (!CONFIG.ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY environment variable is required for Anthropic provider"
        );
      }
      return new AnthropicProvider({
        apiKey: CONFIG.ANTHROPIC_API_KEY,
        model: CONFIG.ANTHROPIC_MODEL
      });
    }
    case "google": {
      if (!CONFIG.GOOGLE_API_KEY) {
        throw new Error(
          "GOOGLE_API_KEY environment variable is required for Google AI provider"
        );
      }
      return new GoogleAIProvider({
        apiKey: CONFIG.GOOGLE_API_KEY,
        model: CONFIG.GOOGLE_MODEL
      });
    }
    case "deepseek": {
      if (!CONFIG.DEEPSEEK_API_KEY || !CONFIG.DEEPSEEK_BASE_URL) {
        throw new Error(
          "DEEPSEEK_API_KEY and DEEPSEEK_BASE_URL are required for DeepSeek provider"
        );
      }
      return new DeepSeekProvider({
        baseUrl: CONFIG.DEEPSEEK_BASE_URL,
        apiKey: CONFIG.DEEPSEEK_API_KEY,
        model: CONFIG.DEEPSEEK_MODEL
      });
    }
    case "ollama": {
      return new OllamaProvider({
        baseUrl: CONFIG.OLLAMA_BASE_URL,
        model: CONFIG.OLLAMA_MODEL
      });
    }
    case "lmstudio": {
      return new LMStudioProvider({
        baseUrl: CONFIG.LM_STUDIO_BASE_URL,
        model: CONFIG.LM_STUDIO_MODEL
      });
    }
    default: {
      // default to openai
      if (!CONFIG.OPENAI_API_KEY) {
        throw new Error(
          "OPENAI_API_KEY environment variable is required for OpenAI provider"
        );
      }
      return new OpenAIProvider({
        apiKey: CONFIG.OPENAI_API_KEY,
        model: CONFIG.OPENAI_MODEL
      });
    }
  }
}

/**
 * Start the server.
 * If the provider is LM Studio, do a health check first.
 */
async function startServer() {
  console.log("Starting server...");

  if (CONFIG.AI_PROVIDER === "lmstudio") {
    console.log("Checking LM Studio health before starting server...");
    const isHealthy = await checkLMStudioHealth(CONFIG.LM_STUDIO_BASE_URL);
    if (!isHealthy) {
      console.error("LM Studio is not accessible. Please ensure it is running.");
      Deno.exit(1);
    }
    console.log("LM Studio health check passed!");
  }

  const aiServer = new AIServer(createProvider());
  await aiServer.initialize();

  const PORT = 8000;
  console.log(`AI MCP server running on http://localhost:${PORT}`);

  await serve(async (req: Request) => {
    try {
      const url = new URL(req.url);
      // We'll only handle requests at /mcp
      if (url.pathname === "/mcp") {
        return await aiServer.handleHttpRequest(req);
      } else {
        return new Response(null, {
          status: 404,
          headers: createCorsHeaders()
        });
      }
    } catch (error) {
      logError("Server error:", error);
      return new Response(null, {
        status: 500,
        headers: createCorsHeaders()
      });
    }
  }, { port: PORT });
}

// Start the server.
startServer().catch(error => {
  console.error("Failed to start server:", error);
  Deno.exit(1);
});
