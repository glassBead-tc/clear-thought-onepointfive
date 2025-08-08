#!/usr/bin/env node
/**
 * Clear Thought MCP Server - Main Entry Point
 * 
 * Unified server supporting stdio, HTTP, and Smithery transports
 */

import { ClearThoughtUnifiedServer } from './unified-server.js';

// Export factory function for programmatic use
export default function createClearThoughtServer(config?: any) {
  const server = new ClearThoughtUnifiedServer({
    transport: config?.transport,
    port: config?.port,
    config
  });
  
  // For MCP/Smithery compatibility, return the MCP server instance
  if (config?.transport === 'smithery' || config?.returnMcpServer) {
    return server.getMcpServer();
  }
  
  return server;
}

// Auto-start if executed directly
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  const server = new ClearThoughtUnifiedServer();
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

// Export types for external use
export type { UnifiedServerOptions } from './unified-server.js';
export { ClearThoughtUnifiedServer } from './unified-server.js';
export { ToolRegistry } from './registry/tool-registry.js';
export { SessionState } from './state/SessionState.js';
export { SessionManager } from './state/SessionManager.js';