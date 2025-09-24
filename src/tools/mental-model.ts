import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';
import type { MentalModelData } from '../types/index.js';

const MentalModelSchema = z.object({
  modelName: z.enum([
    'first_principles',
    'opportunity_cost',
    'error_propagation',
    'rubber_duck',
    'pareto_principle',
    'occams_razor'
  ]).describe('Name of the mental model'),
  problem: z.string().describe('The problem being analyzed'),
  steps: z.array(z.string()).describe('Steps to apply the model'),
  reasoning: z.string().describe('Reasoning process'),
  conclusion: z.string().describe('Conclusions drawn'),
  // NEW: Optional sessionId for continuation
  sessionId: z.string().optional().describe('Session ID for continuing existing mental model session')
});

export type MentalModelArgs = z.infer<typeof MentalModelSchema>;

async function handleMentalModel(
  args: MentalModelArgs,
  session: SessionState
) {
  const modelData: MentalModelData = {
    modelName: args.modelName,
    problem: args.problem,
    steps: args.steps,
    reasoning: args.reasoning,
    conclusion: args.conclusion
  };
  
  session.addMentalModel(modelData);
  
  // Get session context
  const stats = session.getStats();
  const allModels = session.getMentalModels();
  const recentModels = allModels.slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        ...modelData,
        status: 'success',
        sessionContext: {
          sessionId: session.sessionId,
          totalModels: allModels.length,
          recentModels,
          stats
        }
      })
    }]
  };
}

// Self-register - DISABLED for ToolHost pattern
// ToolRegistry.getInstance().register({
//   name: 'mentalmodel',
//   description: 'Apply mental models to analyze problems systematically',
//   schema: MentalModelSchema,
//   handler: handleMentalModel,
//   category: 'metacognitive'
// });

export { handleMentalModel };