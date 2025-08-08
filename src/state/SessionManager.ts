import { SessionState } from './SessionState.js';

interface SessionInfo {
  id: string;
  state: SessionState;
  createdAt: Date;
  lastAccessedAt: Date;
}

export class SessionManager {
  private sessions = new Map<string, SessionInfo>();
  private maxSessions = 100;
  private sessionTimeout = 3600000; // 1 hour

  getOrCreateSession(sessionId: string): SessionInfo {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastAccessedAt = new Date();
      return session;
    }

    // Clean up old sessions if at limit
    if (this.sessions.size >= this.maxSessions) {
      this.cleanupOldSessions();
    }

    const sessionInfo: SessionInfo = {
      id: sessionId,
      state: new SessionState(sessionId, {} as any),
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };

    this.sessions.set(sessionId, sessionInfo);
    return sessionInfo;
  }

  getSession(sessionId: string): SessionInfo | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = new Date();
    }
    return session;
  }

  private cleanupOldSessions(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, session] of this.sessions) {
      if (now - session.lastAccessedAt.getTime() > this.sessionTimeout) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.sessions.delete(id);
    }

    // If still over limit, remove oldest
    if (this.sessions.size >= this.maxSessions) {
      const sorted = Array.from(this.sessions.entries())
        .sort((a, b) => a[1].lastAccessedAt.getTime() - b[1].lastAccessedAt.getTime());
      
      const toRemove = sorted.slice(0, Math.floor(this.maxSessions / 4));
      for (const [id] of toRemove) {
        this.sessions.delete(id);
      }
    }
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  clearAllSessions(): void {
    this.sessions.clear();
  }
}