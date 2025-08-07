import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';
import TreeOfThoughtHandler from '../handlers/reasoning-patterns/tree-of-thought.js';
import GraphOfThoughtHandler from '../handlers/reasoning-patterns/graph-of-thought.js';
import BeamSearchHandler from '../handlers/reasoning-patterns/beam-search.js';
import MCTSHandler from '../handlers/reasoning-patterns/mcts.js';

const UnifiedReasoningSchema = z.object({
  pattern: z.enum(['chain', 'tree', 'graph', 'beam', 'mcts', 'recursive', 'dialectical'])
    .describe('Reasoning pattern to use'),
  operation: z.enum(['create', 'continue', 'evaluate', 'branch', 'merge', 'prune', 'analyze', 'iterate', 'export'])
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

export type UnifiedReasoningArgs = z.infer<typeof UnifiedReasoningSchema>;

// Simple in-memory session pools per pattern
const pools = {
  tree: new Map<string, ReturnType<TreeOfThoughtHandler['initializeSession']>>(),
  graph: new Map<string, ReturnType<GraphOfThoughtHandler['initializeSession']>>(),
  beam: new Map<string, ReturnType<BeamSearchHandler['initializeSession']>>(),
  mcts: new Map<string, ReturnType<MCTSHandler['initializeSession']>>()
};

const handlers = {
  tree: new TreeOfThoughtHandler(),
  graph: new GraphOfThoughtHandler(),
  beam: new BeamSearchHandler(),
  mcts: new MCTSHandler()
};

async function handleUnifiedReasoning(
  args: UnifiedReasoningArgs,
  session: SessionState
) {
  const nowId = args.sessionId || `unified-${args.pattern}-${Date.now()}`;
  const stats = session.getStats();

  if (args.pattern === 'chain') {
    // Chain falls back to sequential thoughts
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          status: 'success',
          pattern: 'chain',
          operation: args.operation,
          sessionId: session.sessionId,
          message: 'Handled via sequential thinking store',
          sessionContext: { sessionId: session.sessionId, stats }
        })
      }]
    };
  }

  // Prepare pool and handler
  const pool = (pools as Record<string, Map<string, any>>)[args.pattern as keyof typeof pools];
  const handler = (handlers as Record<string, any>)[args.pattern as keyof typeof handlers];

  if (!pool || !handler) {
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ status: 'error', message: 'unsupported_pattern', pattern: args.pattern }) }]
    };
  }

  let patternSession = pool.get(nowId);
  if (!patternSession || args.operation === 'create') {
    switch (args.pattern) {
      case 'tree':
        patternSession = handlers.tree.initializeSession({ maxDepth: args.parameters?.maxDepth, pruningThreshold: args.parameters?.pruningThreshold });
        break;
      case 'graph':
        patternSession = handlers.graph.initializeSession();
        break;
      case 'beam':
        patternSession = handlers.beam.initializeSession(args.parameters?.beamWidth);
        break;
      case 'mcts':
        patternSession = handlers.mcts.initializeSession(args.parameters?.explorationConstant);
        break;
    }
    pool.set(patternSession.sessionId, patternSession);
  }

  // Import current sequential chain if operation is continue/analyze and no prior data
  if ((args.operation === 'continue' || args.operation === 'analyze' || args.operation === 'iterate') && patternSession) {
    const seq = session.getThoughts();
    if (seq.length > 0) {
      switch (args.pattern) {
        case 'tree': patternSession = handlers.tree.importFromSequentialFormat(seq); break;
        case 'graph': patternSession = handlers.graph.importFromSequentialFormat(seq); break;
        case 'beam': patternSession = handlers.beam.importFromSequentialFormat(seq); break;
        case 'mcts': patternSession = handlers.mcts.importFromSequentialFormat(seq); break;
      }
      pool.set(patternSession.sessionId, patternSession);
    }
  }

  // Execute operation
  try {
    switch (args.pattern) {
      case 'tree': {
        if (args.operation === 'iterate') handlers.tree.runIteration(patternSession);
        if (args.operation === 'prune' && args.nodeId) handlers.tree.prune(args.nodeId, 'unified-prune', patternSession);
        break;
      }
      case 'graph': {
        if (args.operation === 'analyze') {
          handlers.graph.calculateCentrality(patternSession);
          handlers.graph.detectCommunities(patternSession);
        }
        break;
      }
      case 'beam': {
        if (args.operation === 'iterate') handlers.beam.runIteration(patternSession);
        if (args.operation === 'evaluate') handlers.beam.evaluatePaths(patternSession);
        if (args.operation === 'prune') handlers.beam.prunePaths(patternSession);
        break;
      }
      case 'mcts': {
        if (args.operation === 'iterate') handlers.mcts.runIteration(patternSession);
        if (args.operation === 'evaluate') handlers.mcts.getActionProbabilities(patternSession.rootNodeId, patternSession);
        break;
      }
    }
  } catch (err) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ status: 'error', message: (err as Error)?.message }) }] };
  }

  // Build export
  let exportSequential: any[] = [];
  let summary: any = {};
  switch (args.pattern) {
    case 'tree':
      exportSequential = handlers.tree.exportToSequentialFormat(patternSession);
      summary = { stats: patternSession.stats, bestPath: handlers.tree.getBestPath(patternSession) };
      break;
    case 'graph':
      exportSequential = handlers.graph.exportToSequentialFormat(patternSession);
      summary = { stats: patternSession.stats, analysis: (patternSession as any).analysisMetrics };
      break;
    case 'beam':
      exportSequential = handlers.beam.exportToSequentialFormat(patternSession);
      summary = { stats: patternSession.stats, generation: patternSession.currentGeneration };
      break;
    case 'mcts':
      exportSequential = handlers.mcts.exportToSequentialFormat(patternSession);
      summary = { stats: patternSession.stats, simulations: patternSession.totalSimulations, bestAction: handlers.mcts.getBestAction(patternSession) };
      break;
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        status: 'success',
        pattern: args.pattern,
        operation: args.operation,
        sessionId: patternSession.sessionId,
        summary,
        exportSequential,
        sessionContext: { sessionId: session.sessionId, stats }
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