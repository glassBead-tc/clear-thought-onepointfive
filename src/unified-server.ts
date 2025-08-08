#!/usr/bin/env node
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { randomUUID } from 'node:crypto';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from './registry/tool-registry.js';
import { SessionManager } from './state/SessionManager.js';
import type { ServerConfig } from './config.js';

// Lazy tool module map (modules self-register on import)
const TOOL_MODULES: Record<string, () => Promise<unknown>> = {
  sequentialthinking: () => import('./tools/sequential-thinking.js'),
  unifiedreasoning: () => import('./tools/unified-reasoning.js'),
  treeofthought: () => import('./tools/tree-of-thought.js'),
  graphofthought: () => import('./tools/graph-of-thought.js'),
  beamsearch: () => import('./tools/beam-search.js'),
  mcts: () => import('./tools/mcts.js'),
  'mental-model': () => import('./tools/mental-model.js'),
  'debugging-approach': () => import('./tools/debugging-approach.js'),
  'collaborative-reasoning': () => import('./tools/collaborative-reasoning.js'),
  'decision-framework': () => import('./tools/decision-framework.js'),
  metacognitive: () => import('./tools/metacognitive.js'),
  'scientific-method': () => import('./tools/scientific-method.js'),
  'structured-argumentation': () => import('./tools/structured-argumentation.js'),
  'visual-reasoning': () => import('./tools/visual-reasoning.js'),
  'creative-thinking': () => import('./tools/creative-thinking.js'),
  'systems-thinking': () => import('./tools/systems-thinking.js'),
  'socratic-method': () => import('./tools/socratic-method.js'),
  'session-management': () => import('./tools/session-management.js')
};

export interface UnifiedServerOptions {
  transport?: 'stdio' | 'http' | 'smithery';
  port?: number;
  config?: ServerConfig;
}

export class ClearThoughtUnifiedServer {
  private mcpServer: McpServer;
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
    this.sessionManager = new SessionManager();
    
    // Create MCP server
    this.mcpServer = new McpServer(
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
  
  private async loadTools(): Promise<void> {
    // Lazy loading: defer tool imports until list/execute time
  }
  
  private setupHandlers(): void {
    // Tool execution handler - unified for all tools (lazy-load per call)
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Get or create session
      const sessionId = (request as any).sessionId || randomUUID();
      const session = this.sessionManager.getOrCreateSession(sessionId);
      
      // Ensure the requested tool's module is loaded (self-registers on import)
      const toolName = request.params.name;
      const loader = TOOL_MODULES[toolName];
      if (loader && !this.toolRegistry.has(toolName)) {
        await loader();
      }
      
      // Execute through registry
      return this.toolRegistry.execute(
        request.params.name,
        request.params.arguments,
        session.state
      );
    });
    
    // List tools from registry (lazy-load modules at list time)
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      // Load all tool modules so schemas are available to list
      await Promise.all(Object.values(TOOL_MODULES).map(fn => fn()));
      return { tools: this.toolRegistry.toMCPTools() };
    });
    
    // No resources served
  }
  
  async start(): Promise<void> {
    switch (this.options.transport) {
      case 'stdio':
        await this.startStdio();
        break;
      case 'http':
        // For HTTP, return the MCP server and let the host environment provide the HTTP transport
        return this.mcpServer as any;
      case 'smithery':
        return this.mcpServer as any;
    }
  }
  
  private async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.error('Clear Thought MCP Server (stdio) started');
  }
  
  // HTTP startup is intentionally omitted. When using HTTP, an external host or
  // platform (e.g., Smithery) should own the HTTP listener and use the MCP transport.
  
  // For Smithery export
  getMcpServer(): McpServer {
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