import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import type { SessionState } from '../state/SessionState.js';
import type { DebuggingApproachData } from '../types/index.js';

const DebuggingApproachSchema = z.object({
  approachName: z.enum([
    'binary_search',
    'reverse_engineering',
    'divide_conquer',
    'backtracking',
    'cause_elimination',
    'program_slicing'
  ]).describe('Debugging approach'),
  issue: z.string().describe('The issue being debugged'),
  steps: z.array(z.string()).describe('Steps taken to debug'),
  findings: z.string().describe('Findings during debugging'),
  resolution: z.string().describe('How the issue was resolved')
});

export type DebuggingApproachArgs = z.infer<typeof DebuggingApproachSchema>;

async function handleDebuggingApproach(
  args: DebuggingApproachArgs,
  session: SessionState
) {
  const debugData: DebuggingApproachData = {
    approachName: args.approachName,
    issue: args.issue,
    steps: args.steps,
    findings: args.findings,
    resolution: args.resolution
  };
  
  session.addDebuggingSession(debugData);
  
  // Get session context
  const stats = session.getStats();
  const recentDebugging = session.getDebuggingSessions().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        ...debugData,
        status: 'success',
        sessionContext: {
          sessionId: session.sessionId,
          totalDebuggingSessions: session.getDebuggingSessions().length,
          recentSessions: recentDebugging,
          stats
        }
      })
    }]
  };
}

// Self-register
// ToolRegistry.getInstance().register({
//   name: 'debuggingapproach',
//   description: 'Apply systematic debugging approaches to identify and resolve issues',
//   schema: DebuggingApproachSchema,
//   handler: handleDebuggingApproach,
//   category: 'metacognitive'
// });

export { handleDebuggingApproach };