/**
 * Main session state management class for the Clear Thought MCP server
 * 
 * This class manages all thinking session data and provides centralized
 * access to different types of thinking tools and their data.
 */

import { ServerConfig } from '../config.js';
import {
  ThoughtData,
  MentalModelData,
  DebuggingSession,
  CollaborativeSession,
  DecisionData,
  MetacognitiveData,
  ScientificInquiryData,
  CreativeData,
  SystemsData,
  VisualData,
  SessionExport,
  ArgumentData,
  SocraticData
} from '../types/index.js';
import { UnifiedStore, DataTypeTag } from './stores/UnifiedStore.js';

// Using a single unified store for all tool data

/**
 * Comprehensive session statistics
 */
export interface SessionStatistics {
  sessionId: string;
  createdAt: Date;
  lastAccessedAt: Date;
  thoughtCount: number;
  toolsUsed: string[];
  totalOperations: number;
  isActive: boolean;
  remainingThoughts: number;
  stores: {
    thoughts: Record<string, any>;
    mentalModels: Record<string, any>;
    debugging: Record<string, any>;
    collaborative: Record<string, any>;
    decisions: Record<string, any>;
    metacognitive: Record<string, any>;
    scientific: Record<string, any>;
    creative: Record<string, any>;
    systems: Record<string, any>;
    visual: Record<string, any>;
  };
}

/**
 * Main session state class
 */
export class SessionState {
  /** Unique session identifier */
  readonly sessionId: string;
  
  /** Server configuration */
  private readonly config: ServerConfig;
  
  /** Session creation timestamp */
  private readonly createdAt: Date;
  
  /** Last access timestamp */
  private lastAccessedAt: Date;
  
  /** Timeout timer reference */
  private timeoutTimer?: NodeJS.Timeout;
  
  /** Unified memory store */
  private readonly store: UnifiedStore;
  
  /**
   * Create a new session state
   * @param sessionId - Unique identifier for this session
   * @param config - Server configuration
   */
  constructor(sessionId: string, config: ServerConfig) {
    this.sessionId = sessionId;
    this.config = config;
    this.createdAt = new Date();
    this.lastAccessedAt = new Date();
    
    // Initialize unified store
    this.store = new UnifiedStore();
    
    // Start timeout timer
    this.resetTimeout();
  }
  
  /**
   * Reset the session timeout
   */
  private resetTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    
    this.timeoutTimer = setTimeout(() => {
      this.cleanup();
    }, this.config.sessionTimeout);
    
    this.lastAccessedAt = new Date();
  }
  
  /**
   * Touch the session to prevent timeout
   */
  touch(): void {
    this.resetTimeout();
  }
  
  // ============================================================================
  // Thought Management
  // ============================================================================
  
  /**
   * Add a new thought
   * @param thought - The thought data
   * @returns True if added, false if limit reached
   */
  addThought(thought: ThoughtData): boolean {
    this.touch();
    
    // Check thought limit
    if (this.store.getThoughts().length >= this.config.maxThoughtsPerSession) {
      return false;
    }
    
    const id = `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, thought);
    return true;
  }
  
  /**
   * Get all thoughts
   */
  getThoughts(): ThoughtData[] {
    this.touch();
    return this.store.getThoughts();
  }
  
  /**
   * Get remaining thought capacity
   */
  getRemainingThoughts(): number {
    return Math.max(0, this.config.maxThoughtsPerSession - this.store.getThoughts().length);
  }
  
  // ============================================================================
  // Mental Model Management
  // ============================================================================
  
  /**
   * Add a mental model application
   */
  addMentalModel(model: MentalModelData): void {
    this.touch();
    const id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, model);
  }
  
  /**
   * Get all mental model applications
   */
  getMentalModels(): MentalModelData[] {
    this.touch();
    return this.store.getMentalModels();
  }
  
  // ============================================================================
  // Debugging Management
  // ============================================================================
  
  /**
   * Add a debugging session
   */
  addDebuggingSession(session: DebuggingSession): void {
    this.touch();
    const id = `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, session);
  }
  
  /**
   * Get all debugging sessions
   */
  getDebuggingSessions(): DebuggingSession[] {
    this.touch();
    return this.store.getDebuggingSessions();
  }
  
  // ============================================================================
  // Collaborative Reasoning Management
  // ============================================================================
  
  /**
   * Add a collaborative session
   */
  addCollaborativeSession(session: CollaborativeSession): void {
    this.touch();
    const id = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, session);
  }
  
  /**
   * Get all collaborative sessions
   */
  getCollaborativeSessions(): CollaborativeSession[] {
    this.touch();
    return this.store.getCollaborativeSessions();
  }
  
  /**
   * Get a specific collaborative session by ID
   */
  getCollaborativeSession(sessionId: string): CollaborativeSession | undefined {
    this.touch();
    const sessions = this.store.getCollaborativeSessions();
    return sessions.find(s => s.sessionId === sessionId);
  }
  
  // ============================================================================
  // Decision Framework Management
  // ============================================================================
  
  /**
   * Add a decision session
   */
  addDecision(decision: DecisionData): void {
    this.touch();
    const id = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, decision);
  }
  
  /**
   * Get all decision sessions
   */
  getDecisions(): DecisionData[] {
    this.touch();
    return this.store.getDecisions();
  }
  
  /**
   * Get a specific decision by ID
   */
  getDecision(decisionId: string): DecisionData | undefined {
    this.touch();
    const decisions = this.store.getDecisions();
    return decisions.find(d => d.decisionId === decisionId);
  }
  
  // ============================================================================
  // Metacognitive Monitoring Management
  // ============================================================================
  
  /**
   * Add a metacognitive monitoring session
   */
  addMetacognitive(session: MetacognitiveData): void {
    this.touch();
    const id = `meta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, session);
  }
  
  /**
   * Get all metacognitive sessions
   */
  getMetacognitiveSessions(): MetacognitiveData[] {
    this.touch();
    return this.store.getMetacognitiveSessions();
  }
  
  /**
   * Get a specific metacognitive session by ID
   */
  getMetacognitiveSession(monitoringId: string): MetacognitiveData | undefined {
    this.touch();
    const meta = this.store.getMetacognitiveSessions();
    return meta.find(m => m.monitoringId === monitoringId);
  }
  
  // ============================================================================
  // Scientific Method Management
  // ============================================================================
  
  /**
   * Add a scientific inquiry session
   */
  addScientificInquiry(inquiry: ScientificInquiryData): void {
    this.touch();
    const id = `sci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, inquiry);
  }
  
  /**
   * Get all scientific inquiry sessions
   */
  getScientificInquiries(): ScientificInquiryData[] {
    this.touch();
    return this.store.getScientificInquiries();
  }
  
  /**
   * Get a specific scientific inquiry by ID
   */
  getScientificInquiry(inquiryId: string): ScientificInquiryData | undefined {
    this.touch();
    const inquiries = this.store.getScientificInquiries();
    return inquiries.find(i => i.inquiryId === inquiryId);
  }
  
  // ============================================================================
  // Creative Thinking Management
  // ============================================================================
  
  /**
   * Add a creative thinking session
   */
  addCreativeSession(session: CreativeData): void {
    this.touch();
    const id = `creative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, session);
  }
  
  /**
   * Get all creative sessions
   */
  getCreativeSessions(): CreativeData[] {
    this.touch();
    return this.store.getCreativeSessions();
  }
  
  // ============================================================================
  // Systems Thinking Management
  // ============================================================================
  
  /**
   * Add a systems thinking session
   */
  addSystemsAnalysis(system: SystemsData): void {
    this.touch();
    const id = `systems-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, system);
  }
  
  /**
   * Get all systems analyses
   */
  getSystemsAnalyses(): SystemsData[] {
    this.touch();
    return this.store.getSystemsAnalyses();
  }
  
  // ============================================================================
  // Visual Reasoning Management
  // ============================================================================
  
  /**
   * Add a visual reasoning operation
   */
  addVisualOperation(visual: VisualData): void {
    this.touch();
    const id = `visual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.store.add(id, visual);
  }
  
  /**
   * Get all visual operations
   */
  getVisualOperations(): VisualData[] {
    this.touch();
    return this.store.getVisualOperations();
  }
  
  /**
   * Get visual operations for a specific diagram
   */
  getVisualDiagram(diagramId: string): VisualData[] {
    this.touch();
    return this.store.getVisualDiagram(diagramId);
  }
  
  // ============================================================================
  // Argumentation Support (Socratic method uses ArgumentData)
  // ============================================================================
  
  /**
   * Add a Socratic/argumentation session
   * Note: Since SocraticData extends ArgumentData, we can store it directly
   */
  addArgumentation(argument: ArgumentData | SocraticData): void {
    this.touch();
    // For now, we'll store these in the creative store as a placeholder
    // In a real implementation, you might want a dedicated ArgumentStore
    const session: CreativeData = {
      prompt: argument.claim,
      ideas: argument.premises,
      techniques: ['socratic-method'],
      connections: [],
      insights: [argument.conclusion],
      sessionId: argument.sessionId,
      iteration: argument.iteration,
      nextIdeaNeeded: argument.nextArgumentNeeded
    };
    this.addCreativeSession(session);
  }
  
  // ============================================================================
  // Statistics and Export
  // ============================================================================
  
  /**
   * Get comprehensive session statistics
   */
  getStats(): SessionStatistics {
    this.touch();
    
    const toolsUsed = new Set<string>();
    let totalOperations = 0;
    
    // Check which tools have been used
    if (this.store.getThoughts().length > 0) {
      toolsUsed.add('sequential-thinking');
      totalOperations += this.store.getThoughts().length;
    }
    if (this.store.getMentalModels().length > 0) {
      toolsUsed.add('mental-models');
      totalOperations += this.store.getMentalModels().length;
    }
    if (this.store.getDebuggingSessions().length > 0) {
      toolsUsed.add('debugging');
      totalOperations += this.store.getDebuggingSessions().length;
    }
    if (this.store.getCollaborativeSessions().length > 0) {
      toolsUsed.add('collaborative-reasoning');
      totalOperations += this.store.getCollaborativeSessions().length;
    }
    if (this.store.getDecisions().length > 0) {
      toolsUsed.add('decision-framework');
      totalOperations += this.store.getDecisions().length;
    }
    if (this.store.getMetacognitiveSessions().length > 0) {
      toolsUsed.add('metacognitive-monitoring');
      totalOperations += this.store.getMetacognitiveSessions().length;
    }
    if (this.store.getScientificInquiries().length > 0) {
      toolsUsed.add('scientific-method');
      totalOperations += this.store.getScientificInquiries().length;
    }
    if (this.store.getCreativeSessions().length > 0) {
      toolsUsed.add('creative-thinking');
      totalOperations += this.store.getCreativeSessions().length;
    }
    if (this.store.getSystemsAnalyses().length > 0) {
      toolsUsed.add('systems-thinking');
      totalOperations += this.store.getSystemsAnalyses().length;
    }
    if (this.store.getVisualOperations().length > 0) {
      toolsUsed.add('visual-reasoning');
      totalOperations += this.store.getVisualOperations().length;
    }
    
    return {
      sessionId: this.sessionId,
      createdAt: this.createdAt,
      lastAccessedAt: this.lastAccessedAt,
      thoughtCount: this.store.getThoughts().length,
      toolsUsed: Array.from(toolsUsed),
      totalOperations,
      isActive: !!this.timeoutTimer,
      remainingThoughts: this.getRemainingThoughts(),
      stores: {
        byType: this.store.getStatsByType()
      } as any
    };
  }
  
  /**
   * Export session data
   * @param storeType - Optional specific store to export
   * @returns Exportable session data
   */
  export(storeType?: string): SessionExport | SessionExport[] {
    this.touch();
    
    const baseExport = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };
    
    // Export specific store if requested (via unified store)
    if (storeType) {
      const exports: SessionExport[] = [];
      switch (storeType) {
        case 'thoughts':
          this.store.getThoughts().forEach((thought) => {
            exports.push({ ...baseExport, sessionType: 'sequential', data: thought });
          });
          break;
        case 'mentalModels':
          this.store.getMentalModels().forEach((model) => {
            exports.push({ ...baseExport, sessionType: 'mental-model', data: model });
          });
          break;
        case 'debugging':
          this.store.getDebuggingSessions().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'debugging', data: item });
          });
          break;
        case 'collaborative':
          this.store.getCollaborativeSessions().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'collaborative', data: item });
          });
          break;
        case 'decision':
          this.store.getDecisions().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'decision', data: item });
          });
          break;
        case 'metacognitive':
          this.store.getMetacognitiveSessions().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'metacognitive', data: item });
          });
          break;
        case 'scientific':
          this.store.getScientificInquiries().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'scientific', data: item });
          });
          break;
        case 'creative':
          this.store.getCreativeSessions().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'creative', data: item });
          });
          break;
        case 'systems':
          this.store.getSystemsAnalyses().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'systems', data: item });
          });
          break;
        case 'visual':
          this.store.getVisualOperations().forEach((item) => {
            exports.push({ ...baseExport, sessionType: 'visual', data: item });
          });
          break;
      }
      return exports.length === 1 ? exports[0] : exports;
    }
    
    // Export all data
    const allExports: SessionExport[] = [];
    
    // Add exports from all types via unified store
    this.store.getThoughts().forEach(thought => {
      allExports.push({
        ...baseExport,
        sessionType: 'sequential',
        data: thought
      });
    });
    
    this.store.getMentalModels().forEach(model => {
      allExports.push({
        ...baseExport,
        sessionType: 'mental-model',
        data: model
      });
    });
    
    this.store.getDebuggingSessions().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'debugging', data: item });
    });
    this.store.getCollaborativeSessions().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'collaborative', data: item });
    });
    this.store.getDecisions().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'decision', data: item });
    });
    this.store.getMetacognitiveSessions().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'metacognitive', data: item });
    });
    this.store.getScientificInquiries().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'scientific', data: item });
    });
    this.store.getCreativeSessions().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'creative', data: item });
    });
    this.store.getSystemsAnalyses().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'systems', data: item });
    });
    this.store.getVisualOperations().forEach(item => {
      allExports.push({ ...baseExport, sessionType: 'visual', data: item });
    });
    
    return allExports;
  }
  
  /**
   * Import session data
   * @param data - The session export data to import
   */
  import(data: SessionExport | SessionExport[]): void {
    this.touch();
    
    const imports = Array.isArray(data) ? data : [data];
    
    imports.forEach(item => {
      switch (item.sessionType) {
        case 'sequential':
          this.addThought(item.data as ThoughtData);
          break;
          
        case 'mental-model':
          this.addMentalModel(item.data as MentalModelData);
          break;
          
        case 'debugging':
          this.addDebuggingSession(item.data as DebuggingSession);
          break;
          
        case 'collaborative':
          this.addCollaborativeSession(item.data as CollaborativeSession);
          break;
          
        case 'decision':
          this.addDecision(item.data as DecisionData);
          break;
          
        case 'metacognitive':
          this.addMetacognitive(item.data as MetacognitiveData);
          break;
          
        case 'scientific':
          this.addScientificInquiry(item.data as ScientificInquiryData);
          break;
          
        case 'creative':
          this.addCreativeSession(item.data as CreativeData);
          break;
          
        case 'systems':
          this.addSystemsAnalysis(item.data as SystemsData);
          break;
          
        case 'visual':
          this.addVisualOperation(item.data as VisualData);
          break;
      }
    });
  }
  
  /**
   * Cleanup session data and stop timers
   */
  cleanup(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }
    
    // Clear unified store
    this.store.clear();
  }
  
  /**
   * Check if session is still active
   */
  isActive(): boolean {
    return !!this.timeoutTimer;
  }
}