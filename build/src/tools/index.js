/**
 * Tool Index - All tools self-register on import
 * This file serves as the central import point for tool registration
 */
// Import all tools - they self-register with ToolRegistry on import
export * from './sequential-thinking.js';
export * from './mental-model.js';
export * from './debugging-approach.js';
export * from './collaborative-reasoning.js';
export * from './decision-framework.js';
export * from './metacognitive.js';
export * from './scientific-method.js';
export * from './structured-argumentation.js';
export * from './visual-reasoning.js';
export * from './creative-thinking.js';
export * from './systems-thinking.js';
export * from './socratic-method.js';
export * from './session-management.js';
export * from './unified-reasoning.js';
// Export registry for programmatic access
export { ToolRegistry } from '../registry/tool-registry.js';
// Dynamic tool loading function
export async function loadAllTools() {
    // Tools are loaded via imports above
    // In future, could use dynamic imports for lazy loading
}
// Get tool statistics
export function getToolStats() {
    const { ToolRegistry } = require('../registry/tool-registry.js');
    const registry = ToolRegistry.getInstance();
    const tools = registry.getAll();
    return {
        total: tools.length,
        byCategory: tools.reduce((acc, tool) => {
            const category = tool.category || 'uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {}),
        names: registry.getToolNames()
    };
}
//# sourceMappingURL=index.js.map