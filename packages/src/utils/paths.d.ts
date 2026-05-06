/**
 * OpenClawd data directory paths configuration
 * This module provides a unified interface for accessing data directory paths
 * that can be customized via environment variables.
 */
/**
 * Interface for OpenClawd paths configuration
 */
export interface OpenClawdPathsConfig {
    dataDir: string;
    databaseDir: string;
    charactersDir: string;
    generatedDir: string;
    uploadsAgentsDir: string;
    uploadsChannelsDir: string;
}
/**
 * OpenClawd paths management class
 * Provides centralized access to all OpenClawd data directory paths
 */
declare class OpenClawdPaths {
    private cache;
    /**
     * Get the base data directory
     */
    getDataDir(): string;
    /**
     * Get the database directory (backward compatible with PGLITE_DATA_DIR)
     */
    getDatabaseDir(): string;
    /**
     * Get the characters storage directory
     */
    getCharactersDir(): string;
    /**
     * Get the AI-generated content directory
     */
    getGeneratedDir(): string;
    /**
     * Get the agent uploads directory
     */
    getUploadsAgentsDir(): string;
    /**
     * Get the channel uploads directory
     */
    getUploadsChannelsDir(): string;
    /**
     * Get all paths as a configuration object
     */
    getAllPaths(): OpenClawdPathsConfig;
    /**
     * Clear the cache (useful for testing)
     */
    clearCache(): void;
}
/**
 * Get the singleton OpenClawdPaths instance
 */
export declare function getOpenClawdPaths(): OpenClawdPaths;
/**
 * Convenience function to get the data directory
 */
export declare function getDataDir(): string;
/**
 * Convenience function to get the database directory
 */
export declare function getDatabaseDir(): string;
/**
 * Convenience function to get the characters directory
 */
export declare function getCharactersDir(): string;
/**
 * Convenience function to get the generated content directory
 */
export declare function getGeneratedDir(): string;
/**
 * Convenience function to get the agent uploads directory
 */
export declare function getUploadsAgentsDir(): string;
/**
 * Convenience function to get the channel uploads directory
 */
export declare function getUploadsChannelsDir(): string;
/**
 * Convenience function to get all paths
 */
export declare function getAllOpenClawdPaths(): OpenClawdPathsConfig;
/**
 * Reset the singleton instance (mainly for testing)
 */
export declare function resetPaths(): void;
export {};
//# sourceMappingURL=paths.d.ts.map