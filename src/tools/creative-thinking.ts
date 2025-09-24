import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';

const CreativeThinkingSchema = z.object({
  technique: z.enum([
    'brainstorming',
    'mind_mapping',
    'scamper',
    'six_thinking_hats',
    'lateral_thinking',
    'random_stimulation'
  ]).describe('Creative thinking technique'),
  problem: z.string().describe('Problem or challenge to address'),
  ideas: z.array(z.string()).describe('Generated ideas'),
  connections: z.array(z.string()).optional().describe('Connections between ideas'),
  evaluation: z.string().optional().describe('Evaluation of ideas')
});

export type CreativeThinkingArgs = z.infer<typeof CreativeThinkingSchema>;

async function handleCreativeThinking(
  args: CreativeThinkingArgs,
  session: SessionState
) {
  const creativeData = {
    technique: args.technique,
    problem: args.problem,
    ideas: args.ideas,
    connections: args.connections || [],
    evaluation: args.evaluation,
    timestamp: new Date().toISOString()
  };
  
  const stats = session.getStats();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        ...creativeData,
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
//   name: 'creativethinking',
//   description: 'Apply creative thinking techniques for innovative problem-solving',
//   schema: CreativeThinkingSchema,
//   handler: handleCreativeThinking,
//   category: 'creative'
// });

export { handleCreativeThinking };