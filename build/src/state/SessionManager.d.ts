import { SessionState } from './SessionState.js';
interface SessionInfo {
    id: string;
    state: SessionState;
    createdAt: Date;
    lastAccessedAt: Date;
}
export declare class SessionManager {
    private sessions;
    private maxSessions;
    private sessionTimeout;
    getOrCreateSession(sessionId: string): SessionInfo;
    getSession(sessionId: string): SessionInfo | undefined;
    private cleanupOldSessions;
    getAllSessions(): SessionInfo[];
    clearAllSessions(): void;
}
export {};
//# sourceMappingURL=SessionManager.d.ts.map