#!/usr/bin/env node
/**
 * Smithery Entry Point
 * 
 * Uses the unified server in HTTP mode for Smithery deployment
 */

import { ClearThoughtUnifiedServer } from './unified-server.js';

// Create and start HTTP server for Smithery
const server = new ClearThoughtUnifiedServer({
  transport: 'http',
  port: parseInt(process.env.PORT || '3000')
});

// Start the server
server.start().catch(error => {
  console.error('Failed to start Smithery server:', error);
  process.exit(1);
});

// Export for Smithery SDK if needed
export default function createSmitheryServer() {
  const server = new ClearThoughtUnifiedServer({
    transport: 'smithery'
  });
  return server.getMcpServer();
}