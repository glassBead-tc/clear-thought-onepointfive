import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';

const MetacognitiveSchema = z.object({
  thinkingProcess: z.string().describe('Description of the thinking process'),
  observations: z.array(z.string()).describe('Observations about the thinking'),
  adjustments: z.array(z.string()).describe('Adjustments to improve thinking'),
  effectiveness: z.number().min(0).max(10).describe('Effectiveness rating 0-10'),
  insights: z.string().describe('Key insights gained')
});

export type MetacognitiveArgs = z.infer<typeof MetacognitiveSchema>;

async function handleMetacognitive(
  args: MetacognitiveArgs,
  session: SessionState
) {
  const metacognitiveData = {
    thinkingProcess: args.thinkingProcess,
    observations: args.observations,
    adjustments: args.adjustments,
    effectiveness: args.effectiveness,
    insights: args.insights,
    timestamp: new Date().toISOString()
  };
  
  // Store in session
  const stats = session.getStats();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        ...metacognitiveData,
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
//   name: 'metacognitivemonitoring',
//   description: 'Monitor and adjust thinking processes in real-time',
//   schema: MetacognitiveSchema,
//   handler: handleMetacognitive,
//   category: 'metacognitive'
// });

export { handleMetacognitive };