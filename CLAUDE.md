# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides systematic thinking, mental models, and debugging approaches for enhanced problem-solving capabilities. It enables Claude to use various cognitive tools including sequential thinking, mental models, structured debugging approaches, and advanced reasoning patterns.

## Commands

### Building and Running

```bash
# Install dependencies
npm install

# Build the project (TypeScript + tsc-alias)
npm run build

# Start the server (MCP stdio mode)
npm start

# Development mode with hot reload
npm run dev

# Development mode for HTTP server
npm run dev:http

# Type checking
npm run typecheck

# Run tests (when available)
npm test
npm run test:coverage

# Clean build artifacts
npm run clean

# Deploy to Smithery
npm run deploy

# Run MCP inspector for debugging
npm run inspector
```

### Docker Operations

```bash
# Build Docker image
npm run docker:build
# or directly
docker build -t waldzellai/clear-thought .

# Run Docker container
npm run docker:run
# or directly
docker run -p 3000:3000 waldzellai/clear-thought
```

## Code Architecture

### Core Module Structure

The codebase follows a modular architecture with clear separation of concerns:

1. **Entry Points**
   - `src/index.ts` - Main MCP server factory function (stdio communication)
   - `src/smithery-entry.ts` - HTTP server entry for Smithery deployment
   - `src/server.ts` - Smithery SDK server implementation

2. **Tool Registration System** (`src/tools/`)
   - Each tool is a separate module exporting a registration function
  - Tools are lazily registered on-demand by `src/unified-server.ts` using dynamic imports; `src/tools/index.ts` no longer performs eager registration
   - All tools share a common `SessionState` instance for state management
   - Tool modules: sequential-thinking, mental-model, debugging-approach, collaborative-reasoning, decision-framework, metacognitive, socratic-method, creative-thinking, systems-thinking, scientific-method, structured-argumentation, visual-reasoning, session-management

3. **State Management** (`src/state/`)
   - `SessionState.ts` - Central session state manager coordinating all stores
   - `stores/` - Individual stores for each thinking pattern (ThoughtStore, MentalModelStore, etc.)
   - `stores/UnifiedStore.ts` - Unified store consolidating all data types through a single interface
   - Session-scoped state ensures isolation between concurrent users

4. **Type System** (`src/types/`)
   - `index.ts` - Core data interfaces for all thinking tools
   - `reasoning-patterns/` - Advanced reasoning pattern types (Tree of Thought, Graph of Thought, Beam Search, MCTS)
   - `reasoning-patterns/base.ts` - Base interfaces that all reasoning patterns extend (BaseReasoningNode, BaseReasoningSession)

5. **Configuration**
   - `src/config.ts` - Server configuration schema using Zod
   - Configuration is passed through the server factory function
   - Supports both environment variables and direct configuration

### Key Architectural Patterns

1. **Tool Handler Pattern**
   Each tool follows a consistent pattern:
   - Receives parsed input validated against Zod schema
   - Accesses shared SessionState for data persistence
   - Returns structured JSON responses with session context
   - Handles errors gracefully with appropriate error codes

2. **Session State Architecture**
   - Each session has isolated state via SessionState instance
   - Stores are lazy-loaded when first accessed
   - Data can be exported/imported for session persistence
   - Statistics tracking for all operations

3. **Type Safety**
   - All tool inputs validated with Zod schemas
   - TypeScript strict mode enabled
   - Interfaces extend base types for consistency (e.g., all session types extend BaseReasoningSession)

4. **Build System**
   - TypeScript compilation to ES2022
   - Module resolution: NodeNext
   - Path aliases resolved with tsc-alias
   - Separate build outputs: `build/` for development, `dist/` for distribution

### Deployment Modes

1. **MCP Server (stdio)** - Default mode for Claude Desktop integration
2. **HTTP Server** - For Smithery deployment with Express endpoints
3. **Docker Container** - Containerized deployment option
4. **NPM Package** - Installable via npm as `@waldzellai/clear-thought-onepointfive`

## Important Implementation Details

- The server creates a new McpServer instance per session for isolation
- All tools must be registered through the central `registerTools()` function
- Session state is passed to all tool handlers for shared context
- Tool responses include both the specific result and session statistics
- The UnifiedStore provides a consolidated view of all thinking data types
- Reasoning pattern interfaces must extend BaseReasoningSession for consistency