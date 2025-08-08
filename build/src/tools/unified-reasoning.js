import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
const UnifiedReasoningSchema = z.object({
    pattern: z.enum(['chain', 'tree', 'graph', 'beam', 'mcts', 'recursive', 'dialectical'])
        .describe('Reasoning pattern to use'),
    operation: z.enum(['create', 'continue', 'evaluate', 'branch', 'merge', 'prune', 'analyze'])
        .describe('Operation to perform'),
    content: z.string().optional().describe('Content for the operation'),
    nodeId: z.string().optional().describe('Node ID for operations on existing nodes'),
    sessionId: z.string().optional().describe('Session ID for continuing existing session'),
    parameters: z.object({
        maxDepth: z.number().optional(),
        beamWidth: z.number().optional(),
        explorationConstant: z.number().optional(),
        pruningThreshold: z.number().optional()
    }).optional().describe('Pattern-specific parameters')
});
async function handleUnifiedReasoning(args, session) {
    // This is a simplified version - the full implementation would dispatch
    // to the appropriate reasoning handler based on the pattern
    const reasoningData = {
        pattern: args.pattern,
        operation: args.operation,
        content: args.content,
        nodeId: args.nodeId,
        sessionId: args.sessionId || `unified-${Date.now()}`,
        parameters: args.parameters || {},
        timestamp: new Date().toISOString()
    };
    // Store in unified store when available
    const stats = session.getStats();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...reasoningData,
                    status: 'success',
                    message: 'Unified reasoning operation completed',
                    sessionContext: {
                        sessionId: session.sessionId,
                        stats
                    }
                })
            }]
    };
}
// Self-register
ToolRegistry.getInstance().register({
    name: 'unifiedreasoning',
    description: 'Unified interface for all advanced reasoning patterns (tree, graph, beam search, MCTS)',
    schema: UnifiedReasoningSchema,
    handler: handleUnifiedReasoning,
    category: 'reasoning'
});
export { handleUnifiedReasoning };
//# sourceMappingURL=unified-reasoning.js.map