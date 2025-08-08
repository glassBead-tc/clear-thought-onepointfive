import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
// Define schema once using Zod
const SequentialThinkingSchema = z.object({
    thought: z.string().describe('The thought content'),
    thoughtNumber: z.number().describe('Current thought number in sequence'),
    totalThoughts: z.number().describe('Total expected thoughts in sequence'),
    nextThoughtNeeded: z.boolean().describe('Whether the next thought is needed'),
    isRevision: z.boolean().optional().describe('Whether this is a revision of a previous thought'),
    revisesThought: z.number().optional().describe('Which thought number this revises'),
    branchFromThought: z.number().optional().describe('Which thought this branches from'),
    branchId: z.string().optional().describe('Unique identifier for this branch'),
    needsMoreThoughts: z.boolean().optional().describe('Whether more thoughts are needed'),
    // New optional fields for advanced reasoning patterns
    reasoningPattern: z.enum(['linear', 'tree', 'graph', 'beam', 'mcts']).optional()
        .describe('Advanced reasoning pattern to use'),
    explorationDepth: z.number().optional().describe('Depth for tree/graph exploration'),
    beamWidth: z.number().optional().describe('Width for beam search')
});
// Handler function
async function handleSequentialThinking(args, session) {
    const thoughtData = {
        thought: args.thought,
        thoughtNumber: args.thoughtNumber,
        totalThoughts: args.totalThoughts,
        nextThoughtNeeded: args.nextThoughtNeeded,
        isRevision: args.isRevision,
        revisesThought: args.revisesThought,
        branchFromThought: args.branchFromThought,
        branchId: args.branchId,
        needsMoreThoughts: args.needsMoreThoughts
    };
    const added = session.addThought(thoughtData);
    // Get session context for the response
    const stats = session.getStats();
    const allThoughts = session.getThoughts();
    const recentThoughts = allThoughts.slice(-3);
    // Check if advanced reasoning pattern requested
    if (args.reasoningPattern && args.reasoningPattern !== 'linear') {
        // Future: dispatch to advanced handlers
        // Will integrate with UnifiedStore when fully migrated
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...thoughtData,
                    status: added ? 'success' : 'limit_reached',
                    sessionContext: {
                        sessionId: session.sessionId,
                        totalThoughts: allThoughts.length,
                        remainingThoughts: session.getRemainingThoughts(),
                        recentThoughts,
                        stats
                    }
                })
            }]
    };
}
// Self-register with the ToolRegistry
ToolRegistry.getInstance().register({
    name: 'sequentialthinking',
    description: 'Process sequential thoughts with branching, revision, and advanced reasoning patterns',
    schema: SequentialThinkingSchema,
    handler: handleSequentialThinking,
    category: 'reasoning'
});
// Export for backward compatibility if needed
export { handleSequentialThinking };
//# sourceMappingURL=sequential-thinking.js.map