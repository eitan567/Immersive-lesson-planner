interface McpToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface McpToolOptions {
  serverName: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

export async function useMcpTool<T = McpToolResult>(
  options: McpToolOptions
): Promise<T | { error: string }> {
  try {
    // @ts-ignore - ignore global tool use function
    const result = await use_mcp_tool({
      server_name: options.serverName,
      tool_name: options.toolName,
      arguments: options.arguments
    });
    return result as T;
  } catch (error) {
    console.error('MCP tool error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}