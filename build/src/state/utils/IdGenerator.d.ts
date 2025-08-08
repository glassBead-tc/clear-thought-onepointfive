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
export declare class IdGenerator {
    private static readonly DEFAULT_RANDOM_LENGTH;
    private static readonly DEFAULT_SEPARATOR;
    /**
     * Generate a unique ID with optional prefix
     */
    static generate(prefix?: string, options?: IdGeneratorOptions): string;
    /**
     * Generate a short unique ID (no timestamp)
     */
    static short(prefix?: string): string;
    /**
     * Generate a UUID v4-like ID
     */
    static uuid(): string;
    /**
     * Generate ID from existing object properties
     */
    static fromObject(obj: any, prefix?: string): string;
    /**
     * Generate a timestamp-based sortable ID
     */
    static sortable(prefix?: string): string;
    /**
     * Validate if a string is a valid generated ID
     */
    static isValid(id: string): boolean;
    /**
     * Extract prefix from a generated ID
     */
    static extractPrefix(id: string): string | null;
    /**
     * Extract timestamp from a generated ID
     */
    static extractTimestamp(id: string): Date | null;
    /**
     * Generate a random alphanumeric string
     */
    private static generateRandomString;
    /**
     * Create a namespaced ID generator
     */
    static namespace(namespace: string): (suffix?: string) => string;
}
//# sourceMappingURL=IdGenerator.d.ts.map