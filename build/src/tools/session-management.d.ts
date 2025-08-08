import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const SessionManagementSchema: z.ZodObject<{
    action: z.ZodEnum<["export", "import", "clear", "stats", "summary"]>;
    data: z.ZodOptional<z.ZodAny>;
    format: z.ZodOptional<z.ZodEnum<["json", "summary"]>>;
}, "strip", z.ZodTypeAny, {
    action: "export" | "import" | "clear" | "stats" | "summary";
    data?: any;
    format?: "summary" | "json" | undefined;
}, {
    action: "export" | "import" | "clear" | "stats" | "summary";
    data?: any;
    format?: "summary" | "json" | undefined;
}>;
export type SessionManagementArgs = z.infer<typeof SessionManagementSchema>;
declare function handleSessionManagement(args: SessionManagementArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleSessionManagement };
//# sourceMappingURL=session-management.d.ts.map