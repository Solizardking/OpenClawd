import { z } from 'zod';
import type { Character } from '../types/agent';
export declare const uuidSchema: z.ZodString;
export declare const mediaSchema: any;
export declare const contentSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    thought: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    source: z.ZodOptional<z.ZodString>;
    target: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    inReplyTo: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<any, "many">>;
    channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
}, "strip", z.ZodUnknown, z.objectOutputType<{
    text: z.ZodOptional<z.ZodString>;
    thought: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    source: z.ZodOptional<z.ZodString>;
    target: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    inReplyTo: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<any, "many">>;
    channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
}, z.ZodUnknown, "strip">, z.objectInputType<{
    text: z.ZodOptional<z.ZodString>;
    thought: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    source: z.ZodOptional<z.ZodString>;
    target: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    inReplyTo: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<any, "many">>;
    channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
}, z.ZodUnknown, "strip">>;
export declare const messageExampleSchema: z.ZodObject<{
    name: z.ZodString;
    content: z.ZodObject<{
        text: z.ZodOptional<z.ZodString>;
        thought: z.ZodOptional<z.ZodString>;
        actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        source: z.ZodOptional<z.ZodString>;
        target: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        inReplyTo: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<any, "many">>;
        channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    }, "strip", z.ZodUnknown, z.objectOutputType<{
        text: z.ZodOptional<z.ZodString>;
        thought: z.ZodOptional<z.ZodString>;
        actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        source: z.ZodOptional<z.ZodString>;
        target: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        inReplyTo: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<any, "many">>;
        channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    }, z.ZodUnknown, "strip">, z.objectInputType<{
        text: z.ZodOptional<z.ZodString>;
        thought: z.ZodOptional<z.ZodString>;
        actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        source: z.ZodOptional<z.ZodString>;
        target: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        inReplyTo: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<any, "many">>;
        channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    }, z.ZodUnknown, "strip">>;
}, "strip", z.ZodTypeAny, {
    content: {
        thought?: string | undefined;
        text?: string | undefined;
        actions?: string[] | undefined;
        providers?: string[] | undefined;
        source?: string | undefined;
        target?: string | undefined;
        url?: string | undefined;
        inReplyTo?: string | undefined;
        attachments?: any[] | undefined;
        channelType?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    name: string;
}, {
    content: {
        thought?: string | undefined;
        text?: string | undefined;
        actions?: string[] | undefined;
        providers?: string[] | undefined;
        source?: string | undefined;
        target?: string | undefined;
        url?: string | undefined;
        inReplyTo?: string | undefined;
        attachments?: any[] | undefined;
        channelType?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    name: string;
}>;
export declare const directoryItemSchema: z.ZodObject<{
    directory: z.ZodString;
    shared: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    shared?: boolean | undefined;
}, {
    directory: string;
    shared?: boolean | undefined;
}>;
export declare const knowledgeItemSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    path: z.ZodString;
    shared: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path: string;
    shared?: boolean | undefined;
}, {
    path: string;
    shared?: boolean | undefined;
}>, z.ZodObject<{
    directory: z.ZodString;
    shared: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    shared?: boolean | undefined;
}, {
    directory: string;
    shared?: boolean | undefined;
}>]>;
export declare const templateTypeSchema: z.ZodUnion<[z.ZodString, z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>]>;
export declare const styleSchema: z.ZodOptional<z.ZodObject<{
    all: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    chat: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    post: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    all?: string[] | undefined;
    post?: string[] | undefined;
    chat?: string[] | undefined;
}, {
    all?: string[] | undefined;
    post?: string[] | undefined;
    chat?: string[] | undefined;
}>>;
export declare const settingsSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber, any, z.ZodArray<z.ZodUnknown, "many">]>>>;
export declare const secretsSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber]>>>;
export declare const characterSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    system: z.ZodOptional<z.ZodString>;
    templates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>]>>>;
    bio: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    messageExamples: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        content: z.ZodObject<{
            text: z.ZodOptional<z.ZodString>;
            thought: z.ZodOptional<z.ZodString>;
            actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            source: z.ZodOptional<z.ZodString>;
            target: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            inReplyTo: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<any, "many">>;
            channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        }, "strip", z.ZodUnknown, z.objectOutputType<{
            text: z.ZodOptional<z.ZodString>;
            thought: z.ZodOptional<z.ZodString>;
            actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            source: z.ZodOptional<z.ZodString>;
            target: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            inReplyTo: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<any, "many">>;
            channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        }, z.ZodUnknown, "strip">, z.objectInputType<{
            text: z.ZodOptional<z.ZodString>;
            thought: z.ZodOptional<z.ZodString>;
            actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            providers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            source: z.ZodOptional<z.ZodString>;
            target: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            inReplyTo: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<any, "many">>;
            channelType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        }, z.ZodUnknown, "strip">>;
    }, "strip", z.ZodTypeAny, {
        content: {
            thought?: string | undefined;
            text?: string | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
            source?: string | undefined;
            target?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
            channelType?: string | undefined;
        } & {
            [k: string]: unknown;
        };
        name: string;
    }, {
        content: {
            thought?: string | undefined;
            text?: string | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
            source?: string | undefined;
            target?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
            channelType?: string | undefined;
        } & {
            [k: string]: unknown;
        };
        name: string;
    }>, "many">, "many">>;
    postExamples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    topics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adjectives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    knowledge: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        path: z.ZodString;
        shared: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        shared?: boolean | undefined;
    }, {
        path: string;
        shared?: boolean | undefined;
    }>, z.ZodObject<{
        directory: z.ZodString;
        shared: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        directory: string;
        shared?: boolean | undefined;
    }, {
        directory: string;
        shared?: boolean | undefined;
    }>]>, "many">>;
    plugins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber, any, z.ZodArray<z.ZodUnknown, "many">]>>>;
    secrets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber]>>>;
    style: z.ZodOptional<z.ZodObject<{
        all: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        chat: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        post: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        all?: string[] | undefined;
        post?: string[] | undefined;
        chat?: string[] | undefined;
    }, {
        all?: string[] | undefined;
        post?: string[] | undefined;
        chat?: string[] | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    bio: string | string[];
    username?: string | undefined;
    id?: string | undefined;
    system?: string | undefined;
    templates?: Record<string, string | ((...args: unknown[]) => unknown) | undefined> | undefined;
    messageExamples?: {
        content: {
            thought?: string | undefined;
            text?: string | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
            source?: string | undefined;
            target?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
            channelType?: string | undefined;
        } & {
            [k: string]: unknown;
        };
        name: string;
    }[][] | undefined;
    postExamples?: string[] | undefined;
    topics?: string[] | undefined;
    adjectives?: string[] | undefined;
    knowledge?: (string | {
        directory: string;
        shared?: boolean | undefined;
    } | {
        path: string;
        shared?: boolean | undefined;
    })[] | undefined;
    plugins?: string[] | undefined;
    settings?: Record<string, any> | undefined;
    secrets?: Record<string, string | number | boolean> | undefined;
    style?: {
        all?: string[] | undefined;
        post?: string[] | undefined;
        chat?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    bio: string | string[];
    username?: string | undefined;
    id?: string | undefined;
    system?: string | undefined;
    templates?: Record<string, string | ((...args: unknown[]) => unknown) | undefined> | undefined;
    messageExamples?: {
        content: {
            thought?: string | undefined;
            text?: string | undefined;
            actions?: string[] | undefined;
            providers?: string[] | undefined;
            source?: string | undefined;
            target?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
            channelType?: string | undefined;
        } & {
            [k: string]: unknown;
        };
        name: string;
    }[][] | undefined;
    postExamples?: string[] | undefined;
    topics?: string[] | undefined;
    adjectives?: string[] | undefined;
    knowledge?: (string | {
        directory: string;
        shared?: boolean | undefined;
    } | {
        path: string;
        shared?: boolean | undefined;
    })[] | undefined;
    plugins?: string[] | undefined;
    settings?: Record<string, any> | undefined;
    secrets?: Record<string, string | number | boolean> | undefined;
    style?: {
        all?: string[] | undefined;
        post?: string[] | undefined;
        chat?: string[] | undefined;
    } | undefined;
}>;
export interface CharacterValidationResult {
    success: boolean;
    data?: Character;
    error?: {
        message: string;
        issues?: z.ZodIssue[];
    };
}
/**
 * Safely validates character data using Zod schema
 * @param data - Raw character data to validate
 * @returns Validation result with success flag and either data or error
 */
export declare function validateCharacter(data: unknown): CharacterValidationResult;
/**
 * Safely parses JSON string and validates as character
 * @param jsonString - JSON string to parse and validate
 * @returns Validation result with success flag and either data or error
 */
export declare function parseAndValidateCharacter(jsonString: string): CharacterValidationResult;
/**
 * Type guard to check if data is a valid Character
 * @param data - Data to check
 * @returns True if data is a valid Character
 */
export declare function isValidCharacter(data: unknown): data is Character;
//# sourceMappingURL=character.d.ts.map