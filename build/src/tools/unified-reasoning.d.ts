import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const UnifiedReasoningSchema: z.ZodObject<{
    pattern: z.ZodEnum<["chain", "tree", "graph", "beam", "mcts", "recursive", "dialectical"]>;
    operation: z.ZodEnum<["create", "continue", "evaluate", "branch", "merge", "prune", "analyze"]>;
    content: z.ZodOptional<z.ZodString>;
    nodeId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodObject<{
        maxDepth: z.ZodOptional<z.ZodNumber>;
        beamWidth: z.ZodOptional<z.ZodNumber>;
        explorationConstant: z.ZodOptional<z.ZodNumber>;
        pruningThreshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        beamWidth?: number | undefined;
        maxDepth?: number | undefined;
        explorationConstant?: number | undefined;
        pruningThreshold?: number | undefined;
    }, {
        beamWidth?: number | undefined;
        maxDepth?: number | undefined;
        explorationConstant?: number | undefined;
        pruningThreshold?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    operation: "create" | "continue" | "evaluate" | "branch" | "merge" | "prune" | "analyze";
    pattern: "tree" | "graph" | "beam" | "mcts" | "chain" | "recursive" | "dialectical";
    content?: string | undefined;
    nodeId?: string | undefined;
    sessionId?: string | undefined;
    parameters?: {
        beamWidth?: number | undefined;
        maxDepth?: number | undefined;
        explorationConstant?: number | undefined;
        pruningThreshold?: number | undefined;
    } | undefined;
}, {
    operation: "create" | "continue" | "evaluate" | "branch" | "merge" | "prune" | "analyze";
    pattern: "tree" | "graph" | "beam" | "mcts" | "chain" | "recursive" | "dialectical";
    content?: string | undefined;
    nodeId?: string | undefined;
    sessionId?: string | undefined;
    parameters?: {
        beamWidth?: number | undefined;
        maxDepth?: number | undefined;
        explorationConstant?: number | undefined;
        pruningThreshold?: number | undefined;
    } | undefined;
}>;
export type UnifiedReasoningArgs = z.infer<typeof UnifiedReasoningSchema>;
declare function handleUnifiedReasoning(args: UnifiedReasoningArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleUnifiedReasoning };
//# sourceMappingURL=unified-reasoning.d.ts.map