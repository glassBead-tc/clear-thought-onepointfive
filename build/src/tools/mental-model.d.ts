import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const MentalModelSchema: z.ZodObject<{
    modelName: z.ZodEnum<["first_principles", "opportunity_cost", "error_propagation", "rubber_duck", "pareto_principle", "occams_razor"]>;
    problem: z.ZodString;
    steps: z.ZodArray<z.ZodString, "many">;
    reasoning: z.ZodString;
    conclusion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reasoning: string;
    conclusion: string;
    modelName: "first_principles" | "opportunity_cost" | "error_propagation" | "rubber_duck" | "pareto_principle" | "occams_razor";
    problem: string;
    steps: string[];
}, {
    reasoning: string;
    conclusion: string;
    modelName: "first_principles" | "opportunity_cost" | "error_propagation" | "rubber_duck" | "pareto_principle" | "occams_razor";
    problem: string;
    steps: string[];
}>;
export type MentalModelArgs = z.infer<typeof MentalModelSchema>;
declare function handleMentalModel(args: MentalModelArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleMentalModel };
//# sourceMappingURL=mental-model.d.ts.map