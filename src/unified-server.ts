#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { randomUUID } from 'node:crypto';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from './registry/tool-registry.js';
import { SessionManager } from './state/SessionManager.js';
import type { ServerConfig } from './config.js';

// Lazy tool module map (single unified tool)
const TOOL_MODULES: Record<string, () => Promise<unknown>> = {
  'unifiedreasoning': () => import('./tools/unified-reasoning.js')
};

export interface UnifiedServerOptions {
  transport?: 'stdio' | 'http';
  port?: number;
  config?: ServerConfig;
}

export class ClearThoughtUnifiedServer {
  private mcpServer: Server;
  private sessionManager: SessionManager;
  private toolRegistry: ToolRegistry;
  private options: UnifiedServerOptions;
  
  constructor(options: UnifiedServerOptions = {}) {
    this.options = {
      transport: options.transport || this.detectTransport(),
      port: options.port || parseInt(process.env.PORT || '3000'),
      config: options.config
    };
    
    this.toolRegistry = ToolRegistry.getInstance();
    this.sessionManager = new SessionManager(this.options.config);
    
    // Create MCP server
    this.mcpServer = new Server(
      {
        name: 'clear-thought',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    // Setup handlers
    this.setupHandlers();
  }
  
  private detectTransport(): 'stdio' | 'http' {
    // If running in TTY or explicitly set, use HTTP
    if (process.env.TRANSPORT === 'http' || process.stdin.isTTY) {
      return 'http';
    }
    return 'stdio';
  }

  
  private setupHandlers(): void {
    // Tool execution handler - unified for all tools (lazy-load per call)
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      // 1. Check tool arguments for sessionId first (client-provided)
      const toolSessionId = request.params.arguments?.sessionId;

      // 2. Fall back to generating new session if not provided
      const sessionId = (typeof toolSessionId === 'string' && toolSessionId) || randomUUID();

      // 3. Get or create session (existing logic)
      const session = this.sessionManager.getOrCreateSession(sessionId);

      // Ensure the requested tool's module is loaded (self-registers on import)
      const toolName = request.params.name;
      const loader = TOOL_MODULES[toolName];
      if (loader && !this.toolRegistry.has(toolName)) {
        await loader();
      }

      // 4. Execute through registry
      const result = await this.toolRegistry.execute(
        request.params.name,
        request.params.arguments,
        session.state
      );

      // 5. Inject sessionId into response content for client continuation
      return {
        ...result,
        content: result.content.map(item => {
          if (item.type === 'text') {
            const data = JSON.parse(item.text);
            data.sessionContext = {
              ...data.sessionContext,
              sessionId: sessionId, // Ensure sessionId is always returned
              continuationInstructions: `To continue this reasoning session, include "sessionId": "${sessionId}" in your next tool call`
            };
            return { ...item, text: JSON.stringify(data) };
          }
          return item;
        })
      };
    });
    
    // List tools from registry (lazy-load modules at list time)
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      // Load all tool modules so schemas are available to list
      await Promise.all(Object.values(TOOL_MODULES).map(fn => fn()));
      return { tools: this.toolRegistry.toMCPTools() };
    });
  }
  
  async start(): Promise<void> {
    switch (this.options.transport) {
      case 'stdio':
        await this.startStdio();
        break;
    case 'http':
      // For HTTP, return the MCP server and let the host environment provide the HTTP transport
      return this.mcpServer as any;
    }
  }
  
  private async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.error('Clear Thought MCP Server (stdio) started');
  }
  
  // For Smithery export
  getMcpServer(): Server {
    return this.mcpServer;
  }
}

// Factory function for different environments
export default function createServer(options?: UnifiedServerOptions) {
  const server = new ClearThoughtUnifiedServer(options);
  return server;
}

// Auto-start if main module
if (process.argv[1]?.endsWith('unified-server.ts') || process.argv[1]?.endsWith('unified-server.js')) {
  const server = createServer();
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}