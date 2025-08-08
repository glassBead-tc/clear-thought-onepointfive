/**
 * Centralized ID generation utility
 * 
 * Provides consistent, unique ID generation across the application
 * eliminating code duplication from multiple stores.
 */

/**
 * ID generation options
 */
export interface IdGeneratorOptions {
  /** Prefix for the generated ID */
  prefix?: string;
  /** Use timestamp in ID */
  includeTimestamp?: boolean;
  /** Length of random suffix */
  randomLength?: number;
  /** Custom separator between parts */
  separator?: string;
}

/**
 * Centralized ID generator with consistent format
 */
export class IdGenerator {
  private static readonly DEFAULT_RANDOM_LENGTH = 9;
  private static readonly DEFAULT_SEPARATOR = '-';
  
  /**
   * Generate a unique ID with optional prefix
   */
  static generate(prefix?: string, options?: IdGeneratorOptions): string {
    const opts = {
      includeTimestamp: true,
      randomLength: this.DEFAULT_RANDOM_LENGTH,
      separator: this.DEFAULT_SEPARATOR,
      ...options
    };
    
    const parts: string[] = [];
    
    // Add prefix if provided
    if (prefix || opts.prefix) {
      parts.push(prefix || opts.prefix!);
    }
    
    // Add timestamp if requested
    if (opts.includeTimestamp) {
      parts.push(Date.now().toString());
    }
    
    // Add random suffix
    if (opts.randomLength > 0) {
      parts.push(this.generateRandomString(opts.randomLength));
    }
    
    return parts.join(opts.separator);
  }
  
  /**
   * Generate a short unique ID (no timestamp)
   */
  static short(prefix?: string): string {
    return this.generate(prefix, {
      includeTimestamp: false,
      randomLength: 6
    });
  }
  
  /**
   * Generate a UUID v4-like ID
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Generate ID from existing object properties
   */
  static fromObject(obj: any, prefix?: string): string {
    // Check for existing ID properties
    const idProps = ['id', 'sessionId', 'decisionId', 'inquiryId', 
                    'monitoringId', 'argumentId', 'diagramId'];
    
    for (const prop of idProps) {
      if (prop in obj && typeof obj[prop] === 'string' && obj[prop]) {
        return obj[prop];
      }
    }
    
    // Generate new ID with prefix
    return this.generate(prefix);
  }
  
  /**
   * Generate a timestamp-based sortable ID
   */
  static sortable(prefix?: string): string {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '');
    const random = this.generateRandomString(6);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  }
  
  /**
   * Validate if a string is a valid generated ID
   */
  static isValid(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    
    // Check for common ID patterns
    const patterns = [
      /^[\w-]+-\d{13}-[\w]{6,}$/,  // Standard format with timestamp
      /^[\w-]+-[\w]{6,}$/,          // Short format
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, // UUID
      /^\d{14,}-[\w]{6}$/           // Sortable format
    ];
    
    return patterns.some(pattern => pattern.test(id));
  }
  
  /**
   * Extract prefix from a generated ID
   */
  static extractPrefix(id: string): string | null {
    if (!id || typeof id !== 'string') return null;
    
    const parts = id.split('-');
    if (parts.length < 2) return null;
    
    // Check if first part is not a timestamp
    if (!/^\d{13,}$/.test(parts[0])) {
      return parts[0];
    }
    
    return null;
  }
  
  /**
   * Extract timestamp from a generated ID
   */
  static extractTimestamp(id: string): Date | null {
    if (!id || typeof id !== 'string') return null;
    
    const parts = id.split('-');
    for (const part of parts) {
      if (/^\d{13}$/.test(part)) {
        return new Date(parseInt(part, 10));
      }
    }
    
    return null;
  }
  
  /**
   * Generate a random alphanumeric string
   */
  private static generateRandomString(length: number): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Create a namespaced ID generator
   */
  static namespace(namespace: string): (suffix?: string) => string {
    return (suffix?: string) => {
      const parts = [namespace];
      if (suffix) parts.push(suffix);
      return this.generate(parts.join('-'));
    };
  }
}