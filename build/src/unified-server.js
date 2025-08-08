#!/usr/bin/env node
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from './registry/tool-registry.js';
import { SessionManager } from './state/SessionManager.js';
export class ClearThoughtUnifiedServer {
    mcpServer;
    sessionManager;
    toolRegistry;
    options;
    constructor(options = {}) {
        this.options = {
            transport: options.transport || this.detectTransport(),
            port: options.port || parseInt(process.env.PORT || '3000'),
            config: options.config
        };
        this.toolRegistry = ToolRegistry.getInstance();
        this.sessionManager = new SessionManager();
        // Load all tools (they self-register)
        this.loadTools();
        // Create MCP server
        this.mcpServer = new McpServer({
            name: 'clear-thought',
            version: '1.0.0'
        }, {
            capabilities: {
                tools: {},
                resources: {}
            }
        });
        // Setup handlers
        this.setupHandlers();
    }
    detectTransport() {
        // If running in TTY or explicitly set, use HTTP
        if (process.env.TRANSPORT === 'http' || process.stdin.isTTY) {
            return 'http';
        }
        return 'stdio';
    }
    async loadTools() {
        // Import all tools via index - they self-register on import
        await import('./tools/index.js');
    }
    setupHandlers() {
        // Tool execution handler - unified for all tools
        this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
            // Get or create session
            const sessionId = request.sessionId || randomUUID();
            const session = this.sessionManager.getOrCreateSession(sessionId);
            // Execute through registry
            return this.toolRegistry.execute(request.params.name, request.params.arguments, session.state);
        });
        // List tools from registry
        this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: this.toolRegistry.toMCPTools()
        }));
        // Resources (placeholder)
        this.mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources: []
        }));
        this.mcpServer.setRequestHandler(ReadResourceRequestSchema, async () => ({
            contents: []
        }));
    }
    async start() {
        switch (this.options.transport) {
            case 'stdio':
                await this.startStdio();
                break;
            case 'http':
                await this.startHttp();
                break;
            case 'smithery':
                return this.mcpServer;
        }
    }
    async startStdio() {
        const transport = new StdioServerTransport();
        await this.mcpServer.connect(transport);
        console.error('Clear Thought MCP Server (stdio) started');
    }
    async startHttp() {
        const app = express();
        app.use(cors({ origin: true, credentials: true }));
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID()
        });
        await this.mcpServer.connect(transport);
        // MCP endpoint
        app.all('/mcp', async (req, res) => {
            await transport.handleRequest(req, res);
        });
        // Health check
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                service: 'clear-thought-unified',
                transport: 'http',
                tools: this.toolRegistry.getToolNames()
            });
        });
        // Info endpoint
        app.get('/', (req, res) => {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            res.json({
                service: 'Clear Thought Unified Server',
                version: '1.0.0',
                transport: 'http',
                endpoints: {
                    mcp: `${baseUrl}/mcp`,
                    health: `${baseUrl}/health`
                },
                tools: {
                    count: this.toolRegistry.getAll().length,
                    names: this.toolRegistry.getToolNames()
                }
            });
        });
        app.listen(this.options.port, () => {
            console.log(`🚀 Clear Thought Unified Server running on port ${this.options.port}`);
            console.log(`📡 MCP endpoint: http://localhost:${this.options.port}/mcp`);
            console.log(`❤️ Health: http://localhost:${this.options.port}/health`);
            console.log(`🛠️ Tools loaded: ${this.toolRegistry.getAll().length}`);
        });
    }
    // For Smithery export
    getMcpServer() {
        return this.mcpServer;
    }
}
// Factory function for different environments
export default function createServer(options) {
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
//# sourceMappingURL=unified-server.js.map