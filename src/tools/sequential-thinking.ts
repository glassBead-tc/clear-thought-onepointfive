import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';
import type { ThoughtData } from '../types/index.js';
import TreeOfThoughtHandler from '../handlers/reasoning-patterns/tree-of-thought.js';
import BeamSearchHandler from '../handlers/reasoning-patterns/beam-search.js';
import MCTSHandler from '../handlers/reasoning-patterns/mcts.js';
import GraphOfThoughtHandler from '../handlers/reasoning-patterns/graph-of-thought.js';

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

export type SequentialThinkingArgs = z.infer<typeof SequentialThinkingSchema>;

// Handler function
async function handleSequentialThinking(
  args: SequentialThinkingArgs,
  session: SessionState
) {
  const thoughtData: ThoughtData = {
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
    // Stateless bridge into advanced reasoning structures using current sequential thoughts
    // Build a transient session from all sequential thoughts and run a single iteration/analysis
    const thoughtsForImport = allThoughts;
    let reasoningExport: ThoughtData[] | undefined;
    let reasoningSummary: Record<string, any> | undefined;

    try {
      switch (args.reasoningPattern) {
        case 'tree': {
          const handler = new TreeOfThoughtHandler();
          const patternSession = handler.importFromSequentialFormat(thoughtsForImport);
          // Run one exploration iteration
          handler.runIteration(patternSession);
          reasoningExport = handler.exportToSequentialFormat(patternSession);
          reasoningSummary = {
            pattern: 'tree',
            iteration: patternSession.iteration,
            stats: patternSession.stats
          };
          break;
        }
        case 'beam': {
          const handler = new BeamSearchHandler();
          const patternSession = handler.importFromSequentialFormat(thoughtsForImport);
          handler.runIteration(patternSession);
          reasoningExport = handler.exportToSequentialFormat(patternSession);
          reasoningSummary = {
            pattern: 'beam',
            iteration: patternSession.iteration,
            stats: patternSession.stats
          };
          break;
        }
        case 'mcts': {
          const handler = new MCTSHandler();
          const patternSession = handler.importFromSequentialFormat(thoughtsForImport);
          handler.runIteration(patternSession);
          reasoningExport = handler.exportToSequentialFormat(patternSession);
          reasoningSummary = {
            pattern: 'mcts',
            iteration: patternSession.iteration,
            stats: patternSession.stats
          };
          break;
        }
        case 'graph': {
          const handler = new GraphOfThoughtHandler();
          const patternSession = handler.importFromSequentialFormat(thoughtsForImport);
          // Perform lightweight analysis to surface value
          handler.calculateCentrality(patternSession);
          handler.detectCommunities(patternSession);
          reasoningExport = handler.exportToSequentialFormat(patternSession);
          reasoningSummary = {
            pattern: 'graph',
            iteration: patternSession.iteration,
            stats: patternSession.stats,
            analysis: patternSession.analysisMetrics ? {
              centralityNodes: patternSession.analysisMetrics.centrality ? patternSession.analysisMetrics.centrality.size : 0,
              clusters: patternSession.analysisMetrics.clusters ? patternSession.analysisMetrics.clusters.length : 0
            } : undefined
          };
          break;
        }
      }
    } catch (err) {
      // Swallow pattern errors to avoid breaking base CoT flow; include diagnostic info
      reasoningSummary = {
        pattern: args.reasoningPattern,
        error: (err as Error)?.message || 'pattern_evaluation_failed'
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          ...thoughtData,
          status: added ? 'success' : 'limit_reached',
          sessionContext: {
            sessionId: session.sessionId,
            totalThoughts: allThoughts.length,
            remainingThoughts: session.getRemainingThoughts(),
            recentThoughts,
            stats
          },
          reasoning: reasoningSummary,
          reasoningExport
        })
      }]
    };
  }
  
  return {
    content: [{
      type: 'text' as const,
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