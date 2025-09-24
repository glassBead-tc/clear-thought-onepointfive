import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';
import GraphOfThoughtHandler from '../handlers/reasoning-patterns/graph-of-thought.js';

const gotSessions = new Map<string, ReturnType<GraphOfThoughtHandler['initializeSession']>>();
const gotHandler = new GraphOfThoughtHandler();

const GoTSchema = z.object({
  operation: z.enum(['init', 'import', 'addNode', 'connect', 'paths', 'neighbors', 'analyze', 'merge', 'export'])
    .describe('Graph-of-Thought operation'),
  sessionId: z.string().optional(),
  node: z.object({
    content: z.string(),
    nodeType: z.enum(['hypothesis','evidence','conclusion','question','insight','assumption','counterargument']),
    strength: z.number().min(0).max(1),
    metadata: z.record(z.any()).optional()
  }).optional(),
  edge: z.object({
    sourceId: z.string(),
    targetId: z.string(),
    edgeType: z.enum(['supports','contradicts','refines','questions','leads-to','depends-on','alternatives','elaborates']),
    weight: z.number().min(0).max(1)
  }).optional(),
  startId: z.string().optional(),
  endId: z.string().optional(),
  direction: z.enum(['incoming','outgoing','both']).optional(),
  sequentialImport: z.array(z.object({
    thought: z.string(),
    thoughtNumber: z.number(),
    totalThoughts: z.number(),
    nextThoughtNeeded: z.boolean()
  })).optional(),
  config: z.object({
    maxNodes: z.number().optional(),
    maxEdges: z.number().optional(),
    allowCycles: z.boolean().optional(),
    edgeWeightThreshold: z.number().optional(),
    analysisAlgorithms: z.array(z.enum(['centrality','clustering','paths','cycles'])).optional(),
    defaultNodeType: z.enum(['hypothesis','evidence','conclusion','question','insight','assumption','counterargument']).optional(),
    autoPruneWeakEdges: z.boolean().optional()
  }).optional()
});

export type GoTArgs = z.infer<typeof GoTSchema>;

async function handleGoT(args: GoTArgs, _session: SessionState) {
  let sessionId = args.sessionId;
  let session = sessionId ? gotSessions.get(sessionId) : undefined;

  if (!session || args.operation === 'init') {
    session = gotHandler.initializeSession(args.config || {});
    sessionId = session.sessionId;
    gotSessions.set(sessionId, session);
  }

  if (!session) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ status: 'error', message: 'session_not_found' }) }] };
  }

  switch (args.operation) {
    case 'import': {
      if (!args.sequentialImport) break;
      const imported = gotHandler.importFromSequentialFormat(args.sequentialImport as any);
      gotSessions.set(imported.sessionId, imported);
      sessionId = imported.sessionId;
      session = imported;
      break;
    }
    case 'addNode': {
      if (!args.node) break;
      gotHandler.addNode(args.node as any, session);
      break;
    }
    case 'connect': {
      if (!args.edge) break;
      gotHandler.connectNodes(args.edge.sourceId, args.edge.targetId, args.edge.edgeType as any, args.edge.weight, session);
      break;
    }
    case 'paths': {
      if (args.startId && args.endId) {
        gotHandler.findPaths(args.startId, args.endId, session);
      }
      break;
    }
    case 'neighbors': {
      if (args.startId) {
        gotHandler.getNeighbors(args.startId, args.direction || 'both', session);
      }
      break;
    }
    case 'analyze': {
      gotHandler.calculateCentrality(session);
      gotHandler.detectCommunities(session);
      gotHandler.findContradictions(session);
      break;
    }
    case 'merge': {
      // Caller will pass node IDs via startId/endId as a minimal interface; support 2-node merge
      if (args.startId && args.endId) {
        gotHandler.mergeNodes([args.startId, args.endId], session);
      }
      break;
    }
    case 'export': {
      // No-op, we always return export
      break;
    }
  }

  const exportSeq = gotHandler.exportToSequentialFormat(session);
  const analysis = session.analysisMetrics ? {
    centralityNodes: session.analysisMetrics.centrality ? session.analysisMetrics.centrality.size : 0,
    clusters: session.analysisMetrics.clusters ? session.analysisMetrics.clusters.length : 0
  } : undefined;

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        status: 'success',
        sessionId,
        stats: session.stats,
        analysis,
        exportSequential: exportSeq
      })
    }]
  };
}

// ToolRegistry.getInstance().register({
//   name: 'graphofthought',
//   description: 'Graph-of-Thought reasoning tool (nodes/edges/analysis/merge/export)',
//   schema: GoTSchema,
//   handler: handleGoT,
//   category: 'reasoning'
// });

export { handleGoT };


