export * from './autoFixer';
export declare function waitFor(seconds: number): Promise<void>;
export declare function truncate(text: string, maxLength: number): string;
export declare function randomID(existingIDs?: string[]): string;
/**
 * Generate a random ID.
 * @note Unique within this window.
 */
export declare function uid(): string;
/** Fetch /llms.txt for a URL's origin. Cached per origin, `null` = tried and not found. */
export declare function fetchLlmsTxt(url: string): Promise<string | null>;
/**
 * Simple assertion function that throws an error if the condition is falsy
 * @param condition - The condition to assert
 * @param message - Optional error message
 * @throws Error if condition is falsy
 */
export declare function assert(condition: unknown, message?: string, silent?: boolean): asserts condition;
//# sourceMappingURL=index.d.ts.map