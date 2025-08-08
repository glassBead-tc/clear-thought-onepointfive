/**
 * Unified Store Implementation
 * 
 * Consolidates all specialized stores into a single, type-safe store
 * with efficient indexing and querying capabilities.
 */

import { IdGenerator } from '../utils/IdGenerator.js';
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
  ArgumentData,
  SocraticData,
  SessionExport
} from '../../types/index.js';

/**
 * Union type for all data types managed by the unified store
 */
export type UnifiedDataType = 
  | ThoughtData
  | MentalModelData
  | DebuggingSession
  | CollaborativeSession
  | DecisionData
  | MetacognitiveData
  | ScientificInquiryData
  | CreativeData
  | SystemsData
  | VisualData
  | ArgumentData
  | SocraticData;

/**
 * Data type tags for categorization and indexing
 */
export enum DataTypeTag {
  THOUGHT = 'thought',
  MENTAL_MODEL = 'mentalModel',
  DEBUGGING = 'debugging',
  COLLABORATIVE = 'collaborative',
  DECISION = 'decision',
  METACOGNITIVE = 'metacognitive',
  SCIENTIFIC = 'scientific',
  CREATIVE = 'creative',
  SYSTEMS = 'systems',
  VISUAL = 'visual',
  ARGUMENT = 'argument',
  SOCRATIC = 'socratic'
}

/**
 * Storage entry with metadata for tracking and indexing
 */
export interface StorageEntry<T extends UnifiedDataType = UnifiedDataType> {
  id: string;
  type: DataTypeTag;
  data: T;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Type guards for runtime type checking
 */
export const TypeGuards = {
  isThoughtData: (data: UnifiedDataType): data is ThoughtData => 
    'thoughtNumber' in data && 'totalThoughts' in data && 'nextThoughtNeeded' in data,

  isMentalModelData: (data: UnifiedDataType): data is MentalModelData =>
    'modelName' in data && 'steps' in data && 'reasoning' in data,

  isDebuggingSession: (data: UnifiedDataType): data is DebuggingSession =>
    'sessionId' in data && 'approach' in data && 'debugSteps' in data,

  isCollaborativeSession: (data: UnifiedDataType): data is CollaborativeSession =>
    'sessionId' in data && 'personas' in data && 'conversationHistory' in data,

  isDecisionData: (data: UnifiedDataType): data is DecisionData =>
    'decisionId' in data && 'options' in data && 'criteria' in data,

  isMetacognitiveData: (data: UnifiedDataType): data is MetacognitiveData =>
    'monitoringId' in data && 'metacognitiveStrategy' in data,

  isScientificInquiry: (data: UnifiedDataType): data is ScientificInquiryData =>
    'inquiryId' in data && 'hypotheses' in data && 'experiments' in data,

  isCreativeData: (data: UnifiedDataType): data is CreativeData =>
    'technique' in data && 'ideaCategories' in data,

  isSystemsData: (data: UnifiedDataType): data is SystemsData =>
    'systemName' in data && 'components' in data,

  isVisualData: (data: UnifiedDataType): data is VisualData =>
    'diagramId' in data && 'diagramType' in data,

  isArgumentData: (data: UnifiedDataType): data is ArgumentData =>
    'argumentId' in data && 'argumentType' in data && 'claims' in data,

  isSocraticData: (data: UnifiedDataType): data is SocraticData =>
    TypeGuards.isArgumentData(data) && 'socraticMethod' in data
};

/**
 * Unified store for all data types with type-safe operations
 */
export class UnifiedStore {
  // Internal storage map and store name (inlined from BaseStore)
  private data: Map<string, StorageEntry>;
  private readonly storeName: string;
  // Type-specific indexes for efficient queries
  private typeIndexes: Map<DataTypeTag, Set<string>>;
  
  // Special indexes for specific data types
  private thoughtSequence: string[] = [];
  private collaborativeSessions: Map<string, Set<string>> = new Map();
  private visualDiagrams: Map<string, Set<string>> = new Map();
  private decisionIndex: Map<string, string> = new Map();
  private inquiryIndex: Map<string, string> = new Map();
  
  constructor() {
    this.storeName = 'UnifiedStore';
    this.data = new Map<string, StorageEntry>();
    this.typeIndexes = new Map();
    
    // Initialize indexes for all types
    Object.values(DataTypeTag).forEach(type => {
      this.typeIndexes.set(type, new Set());
    });
  }

  // -------- Inlined generic store utilities (from BaseStore) --------

  get(id: string): StorageEntry | undefined {
    return this.data.get(id);
  }

  has(id: string): boolean {
    return this.data.has(id);
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }

  size(): number {
    return this.data.size;
  }

  export(): Record<string, StorageEntry> {
    const result: Record<string, StorageEntry> = {};
    this.data.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  import(data: Record<string, StorageEntry>): void {
    this.clear();
    Object.entries(data).forEach(([key, value]) => {
      this.add(key, value);
    });
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  values(): StorageEntry[] {
    return Array.from(this.data.values());
  }

  forEach(callback: (value: StorageEntry, key: string) => void): void {
    this.data.forEach(callback);
  }

  filter(predicate: (item: StorageEntry) => boolean): StorageEntry[] {
    return this.values().filter(predicate);
  }

  find(predicate: (item: StorageEntry) => boolean): StorageEntry | undefined {
    return this.values().find(predicate);
  }

  update(id: string, updater: (item: StorageEntry) => StorageEntry): boolean {
    const item = this.get(id);
    if (item) {
      this.add(id, updater(item));
      return true;
    }
    return false;
  }
  
  /**
   * Determine the data type tag for indexing
   */
  private getDataType(data: UnifiedDataType): DataTypeTag {
    if (TypeGuards.isSocraticData(data)) return DataTypeTag.SOCRATIC;
    if (TypeGuards.isArgumentData(data)) return DataTypeTag.ARGUMENT;
    if (TypeGuards.isThoughtData(data)) return DataTypeTag.THOUGHT;
    if (TypeGuards.isMentalModelData(data)) return DataTypeTag.MENTAL_MODEL;
    if (TypeGuards.isDebuggingSession(data)) return DataTypeTag.DEBUGGING;
    if (TypeGuards.isCollaborativeSession(data)) return DataTypeTag.COLLABORATIVE;
    if (TypeGuards.isDecisionData(data)) return DataTypeTag.DECISION;
    if (TypeGuards.isMetacognitiveData(data)) return DataTypeTag.METACOGNITIVE;
    if (TypeGuards.isScientificInquiry(data)) return DataTypeTag.SCIENTIFIC;
    if (TypeGuards.isCreativeData(data)) return DataTypeTag.CREATIVE;
    if (TypeGuards.isSystemsData(data)) return DataTypeTag.SYSTEMS;
    if (TypeGuards.isVisualData(data)) return DataTypeTag.VISUAL;
    
    throw new Error(`Unknown data type: ${JSON.stringify(data).substring(0, 100)}`);
  }
  
  /**
   * Add any type of data to the store
   */
  add(id: string, item: StorageEntry | UnifiedDataType): void {
    let entry: StorageEntry;
    
    // Handle both StorageEntry and raw data
    if (this.isStorageEntry(item)) {
      entry = item;
    } else {
      const dataType = this.getDataType(item);
      entry = {
        id,
        type: dataType,
        data: item,
        timestamp: new Date()
      };
    }
    
    // Store in main map
    this.data.set(id, entry);
    
    // Update type index
    this.typeIndexes.get(entry.type)?.add(id);
    
    // Update special indexes
    this.updateSpecialIndexes(entry);
  }
  
  /**
   * Type guard for StorageEntry
   */
  private isStorageEntry(item: any): item is StorageEntry {
    return item && 
           typeof item === 'object' && 
           'type' in item && 
           'data' in item &&
           'id' in item &&
           'timestamp' in item;
  }
  
  /**
   * Update special indexes based on data type
   */
  private updateSpecialIndexes(entry: StorageEntry): void {
    switch (entry.type) {
      case DataTypeTag.THOUGHT:
        const thought = entry.data as ThoughtData;
        if (!thought.isRevision) {
          this.thoughtSequence.push(entry.id);
        }
        break;
        
      case DataTypeTag.COLLABORATIVE:
        const collab = entry.data as CollaborativeSession;
        if (!this.collaborativeSessions.has(collab.sessionId)) {
          this.collaborativeSessions.set(collab.sessionId, new Set());
        }
        this.collaborativeSessions.get(collab.sessionId)?.add(entry.id);
        break;
        
      case DataTypeTag.VISUAL:
        const visual = entry.data as VisualData;
        if (!this.visualDiagrams.has(visual.diagramId)) {
          this.visualDiagrams.set(visual.diagramId, new Set());
        }
        this.visualDiagrams.get(visual.diagramId)?.add(entry.id);
        break;
        
      case DataTypeTag.DECISION:
        const decision = entry.data as DecisionData;
        this.decisionIndex.set(decision.decisionId, entry.id);
        break;
        
      case DataTypeTag.SCIENTIFIC:
        const inquiry = entry.data as ScientificInquiryData;
        this.inquiryIndex.set(inquiry.inquiryId, entry.id);
        break;
    }
  }
  
  /**
   * Get all items of a specific type
   */
  getByType<T extends UnifiedDataType>(type: DataTypeTag): T[] {
    const ids = this.typeIndexes.get(type);
    if (!ids) return [];
    
    const results: T[] = [];
    ids.forEach(id => {
      const entry = this.data.get(id);
      if (entry) {
        results.push(entry.data as T);
      }
    });
    
    return results;
  }
  
  /**
   * Get all items (returns StorageEntry objects)
   */
  getAll(): StorageEntry[] {
    return Array.from(this.data.values());
  }
  
  /**
   * Clear all data and indexes
   */
  clear(): void {
    this.data.clear();
    this.typeIndexes.forEach(index => index.clear());
    this.thoughtSequence = [];
    this.collaborativeSessions.clear();
    this.visualDiagrams.clear();
    this.decisionIndex.clear();
    this.inquiryIndex.clear();
  }
  
  // Type-safe getters for specific data types
  
  getThoughts(): ThoughtData[] {
    return this.getByType<ThoughtData>(DataTypeTag.THOUGHT);
  }
  
  getMentalModels(): MentalModelData[] {
    return this.getByType<MentalModelData>(DataTypeTag.MENTAL_MODEL);
  }
  
  getDebuggingSessions(): DebuggingSession[] {
    return this.getByType<DebuggingSession>(DataTypeTag.DEBUGGING);
  }
  
  getCollaborativeSessions(): CollaborativeSession[] {
    return this.getByType<CollaborativeSession>(DataTypeTag.COLLABORATIVE);
  }
  
  getDecisions(): DecisionData[] {
    return this.getByType<DecisionData>(DataTypeTag.DECISION);
  }
  
  getMetacognitiveSessions(): MetacognitiveData[] {
    return this.getByType<MetacognitiveData>(DataTypeTag.METACOGNITIVE);
  }
  
  getScientificInquiries(): ScientificInquiryData[] {
    return this.getByType<ScientificInquiryData>(DataTypeTag.SCIENTIFIC);
  }
  
  getCreativeSessions(): CreativeData[] {
    return this.getByType<CreativeData>(DataTypeTag.CREATIVE);
  }
  
  getSystemsAnalyses(): SystemsData[] {
    return this.getByType<SystemsData>(DataTypeTag.SYSTEMS);
  }
  
  getVisualOperations(): VisualData[] {
    return this.getByType<VisualData>(DataTypeTag.VISUAL);
  }
  
  getArguments(): (ArgumentData | SocraticData)[] {
    const args = this.getByType<ArgumentData>(DataTypeTag.ARGUMENT);
    const socratic = this.getByType<SocraticData>(DataTypeTag.SOCRATIC);
    return [...args, ...socratic];
  }
  
  // Special accessors using indexes
  
  /**
   * Get ordered thought sequence
   */
  getThoughtSequence(): ThoughtData[] {
    return this.thoughtSequence.map(id => {
      const entry = this.data.get(id);
      return entry?.data as ThoughtData;
    }).filter(Boolean);
  }
  
  /**
   * Get collaborative session by ID
   */
  getCollaborativeSession(sessionId: string): CollaborativeSession | undefined {
    const ids = this.collaborativeSessions.get(sessionId);
    if (!ids || ids.size === 0) return undefined;
    
    const firstId = ids.values().next().value;
    if (!firstId) return undefined;
    const entry = this.data.get(firstId);
    return entry?.data as CollaborativeSession;
  }
  
  /**
   * Get decision by ID
   */
  getDecision(decisionId: string): DecisionData | undefined {
    const id = this.decisionIndex.get(decisionId);
    if (!id) return undefined;
    
    const entry = this.data.get(id);
    return entry?.data as DecisionData;
  }
  
  /**
   * Get scientific inquiry by ID
   */
  getScientificInquiry(inquiryId: string): ScientificInquiryData | undefined {
    const id = this.inquiryIndex.get(inquiryId);
    if (!id) return undefined;
    
    const entry = this.data.get(id);
    return entry?.data as ScientificInquiryData;
  }
  
  /**
   * Get visual diagrams by diagram ID
   */
  getVisualDiagram(diagramId: string): VisualData[] {
    const ids = this.visualDiagrams.get(diagramId);
    if (!ids) return [];
    
    const results: VisualData[] = [];
    ids.forEach(id => {
      const entry = this.data.get(id);
      if (entry) {
        results.push(entry.data as VisualData);
      }
    });
    
    return results;
  }
  
  /**
   * Get statistics by type
   */
  getStatsByType(): Record<DataTypeTag, number> {
    const stats: Partial<Record<DataTypeTag, number>> = {};
    this.typeIndexes.forEach((ids, type) => {
      stats[type] = ids.size;
    });
    return stats as Record<DataTypeTag, number>;
  }
  
  /**
   * Export data by type or all data
   */
  exportByType(type?: DataTypeTag): SessionExport {
    const entries = type 
      ? Array.from(this.typeIndexes.get(type) || [])
          .map(id => this.data.get(id))
          .filter(Boolean) as StorageEntry[]
      : this.getAll();
    
    const exportData = entries.length === 1 
      ? entries[0].data 
      : entries.map(e => e.data);
    
    return {
      sessionId: 'unified-export',
      sessionType: (type as string) || 'sequential',
      timestamp: new Date().toISOString(),
      data: exportData
    };
  }
  
  /**
   * Import data from export
   */
  importData(sessionExport: SessionExport): void {
    const dataArray = Array.isArray(sessionExport.data) 
      ? sessionExport.data 
      : [sessionExport.data];
    
    dataArray.forEach(item => {
      const id = this.generateId(item);
      this.add(id, item);
    });
  }
  
  /**
   * Generate unique ID for data item
   */
  private generateId(data: UnifiedDataType): string {
    // Use IdGenerator for existing object IDs or generate new
    const existingId = IdGenerator.fromObject(data);
    if (existingId !== IdGenerator.generate()) {
      return existingId;
    }
    
    // Generate new ID with type prefix
    const typePrefix = this.getDataType(data);
    return IdGenerator.generate(typePrefix);
  }
  
  /**
   * Search across all data types with a predicate
   */
  searchAll(predicate: (entry: StorageEntry) => boolean): StorageEntry[] {
    return this.filter(predicate);
  }
  
  /**
   * Get recent items across all types
   */
  getRecent(limit: number = 10): StorageEntry[] {
    return Array.from(this.data.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}