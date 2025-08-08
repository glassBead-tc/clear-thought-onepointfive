#!/usr/bin/env node
/**
 * Clear Thought MCP Server - Main Entry Point
 *
 * Unified server supporting stdio, HTTP, and Smithery transports
 */
import { ClearThoughtUnifiedServer } from './unified-server.js';
export default function createClearThoughtServer(config?: any): ClearThoughtUnifiedServer | import("@modelcontextprotocol/sdk/server/index.js").Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;
export type { UnifiedServerOptions } from './unified-server.js';
export { ClearThoughtUnifiedServer } from './unified-server.js';
export { ToolRegistry } from './registry/tool-registry.js';
export { SessionState } from './state/SessionState.js';
export { SessionManager } from './state/SessionManager.js';
//# sourceMappingURL=index.d.ts.map