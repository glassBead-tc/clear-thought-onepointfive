import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';

const VisualReasoningSchema = z.object({
  visualType: z.enum([
    'diagram',
    'flowchart',
    'mind_map',
    'concept_map',
    'graph',
    'matrix'
  ]).describe('Type of visual representation'),
  elements: z.array(z.object({
    id: z.string(),
    type: z.string(),
    label: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number()
    }).optional()
  })).describe('Visual elements'),
  connections: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
    type: z.string().optional()
  })).optional().describe('Connections between elements'),
  insights: z.string().describe('Insights from visual analysis')
});

export type VisualReasoningArgs = z.infer<typeof VisualReasoningSchema>;

async function handleVisualReasoning(
  args: VisualReasoningArgs,
  session: SessionState
) {
  const visualData = {
    visualType: args.visualType,
    elements: args.elements,
    connections: args.connections || [],
    insights: args.insights,
    timestamp: new Date().toISOString()
  };
  
  const stats = session.getStats();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        ...visualData,
        status: 'success',
        sessionContext: {
          sessionId: session.sessionId,
          stats
        }
      })
    }]
  };
}

// Self-register
// ToolRegistry.getInstance().register({
//   name: 'visualreasoning',
//   description: 'Use visual representations to analyze and understand complex information',
//   schema: VisualReasoningSchema,
//   handler: handleVisualReasoning,
//   category: 'reasoning'
// });

export { handleVisualReasoning };