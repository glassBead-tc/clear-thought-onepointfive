import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionState } from '../state/SessionState.js';

export interface ToolDefinition<T = any> {
  name: string;
  description: string;
  schema: z.ZodSchema<T>;
  handler: (args: T, session: SessionState) => Promise<CallToolResult>;
  category?: 'reasoning' | 'metacognitive' | 'collaborative' | 'creative' | 'session';
  annotations?: {
    audience?: string[];
    priority?: number;
    available_operations?: string[];
    docs?: string;
    quickstart?: string;
  };
}

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools = new Map<string, ToolDefinition>();
  
  static getInstance(): ToolRegistry {
    if (!this.instance) {
      this.instance = new ToolRegistry();
    }
    return this.instance;
  }
  
  register<T>(tool: ToolDefinition<T>): void {
    this.tools.set(tool.name, tool);
  }
  
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }
  
  getByCategory(category: string): ToolDefinition[] {
    return this.getAll().filter(tool => tool.category === category);
  }
  
  // Generate MCP tool format
  toMCPTools() {
    return this.getAll().map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema)
    }));
  }
  
  // Validate arguments using tool's schema
  validate(name: string, args: any): any {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    return tool.schema.parse(args);
  }
  
  // Execute tool with validation and session
  async execute(name: string, args: any, session: SessionState): Promise<CallToolResult> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    // Validate with Zod (single validation point)
    const validated = tool.schema.parse(args);
    
    // Execute with session
    return tool.handler(validated, session);
  }
  
  // Get tool names for autocomplete
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
  
  // Check if tool exists
  has(name: string): boolean {
    return this.tools.has(name);
  }
  
  // Clear registry (useful for testing)
  clear(): void {
    this.tools.clear();
  }
}