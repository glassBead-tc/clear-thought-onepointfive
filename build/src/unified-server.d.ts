#!/usr/bin/env node
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import type { ServerConfig } from './config.js';
export interface UnifiedServerOptions {
    transport?: 'stdio' | 'http' | 'smithery';
    port?: number;
    config?: ServerConfig;
}
export declare class ClearThoughtUnifiedServer {
    private mcpServer;
    private sessionManager;
    private toolRegistry;
    private options;
    constructor(options?: UnifiedServerOptions);
    private detectTransport;
    private loadTools;
    private setupHandlers;
    start(): Promise<void>;
    private startStdio;
    private startHttp;
    getMcpServer(): McpServer;
}
export default function createServer(options?: UnifiedServerOptions): ClearThoughtUnifiedServer;
//# sourceMappingURL=unified-server.d.ts.map