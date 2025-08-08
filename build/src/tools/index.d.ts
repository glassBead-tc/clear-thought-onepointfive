/**
 * Tool Index - All tools self-register on import
 * This file serves as the central import point for tool registration
 */
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
export { ToolRegistry } from '../registry/tool-registry.js';
export declare function loadAllTools(): Promise<void>;
export declare function getToolStats(): {
    total: any;
    byCategory: any;
    names: any;
};
//# sourceMappingURL=index.d.ts.map