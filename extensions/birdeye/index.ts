/**
 * Birdeye OpenClawd Plugin Registration
 * Registers the Birdeye tools with OpenClawd's plugin system
 */

import type { OpenClawdPluginApi } from "../../src/plugins/types.js";
import { Type } from "@sinclair/typebox";
import { BirdeyeClient, type SupportedChain } from "./src/client.js";

type PluginConfig = {
    apiKey?: string;
    defaultChain?: SupportedChain;
    timeoutMs?: number;
};

function getClient(api: OpenClawdPluginApi): BirdeyeClient {
    const cfg = (api.pluginConfig ?? {}) as PluginConfig;
    const apiKey = cfg.apiKey || process.env.BIRDEYE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "BIRDEYE_API_KEY is required. Set it in environment or plugin config."
        );
    }

    return new BirdeyeClient({
        apiKey,
        defaultChain: cfg.defaultChain || "solana",
        timeoutMs: cfg.timeoutMs || 30000,
    });
}

function formatResult(data: unknown): { content: Array<{ type: "text"; text: string }> } {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}

const chainEnumValues = [
    "solana", "ethereum", "base", "bsc", "arbitrum", "optimism",
    "polygon", "avalanche", "sui", "aptos", "zksync", "linea",
    "fantom", "mantle", "fogo", "monad"
] as const;

export default function register(api: OpenClawdPluginApi) {
    // Token Overview
    api.registerTool({
        name: "birdeye-token-overview",
        description: "Get comprehensive overview stats for a token including price, market cap, volume, holders, and price changes",
        parameters: Type.Object({
            address: Type.String({ description: "Token contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
            frames: Type.Optional(Type.String({ description: "Custom timeframes (e.g., '1m,5m,1h,24h')" })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTokenOverview(
                params.address as string,
                {
                    chain: params.chain as SupportedChain,
                    frames: params.frames as string,
                }
            );
            return formatResult(result);
        },
    });

    // Token Metadata
    api.registerTool({
        name: "birdeye-token-metadata",
        description: "Get metadata for a token (name, symbol, decimals, logo, social links)",
        parameters: Type.Object({
            address: Type.String({ description: "Token contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTokenMetadata(
                params.address as string,
                { chain: params.chain as SupportedChain }
            );
            return formatResult(result);
        },
    });

    // Token Metadata Multiple
    api.registerTool({
        name: "birdeye-token-metadata-multiple",
        description: "Get metadata for multiple tokens (max 50)",
        parameters: Type.Object({
            addresses: Type.String({ description: "Comma-separated list of token addresses" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const addressList = (params.addresses as string).split(",").map((a) => a.trim());
            const result = await client.getTokenMetadataMultiple(addressList, {
                chain: params.chain as SupportedChain,
            });
            return formatResult(result);
        },
    });

    // Token Market Data
    api.registerTool({
        name: "birdeye-token-market-data",
        description: "Get market data for a token (price, liquidity, market cap, FDV, holders)",
        parameters: Type.Object({
            address: Type.String({ description: "Token contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTokenMarketData(
                params.address as string,
                { chain: params.chain as SupportedChain }
            );
            return formatResult(result);
        },
    });

    // Token Market Data Multiple
    api.registerTool({
        name: "birdeye-token-market-data-multiple",
        description: "Get market data for multiple tokens (max 20)",
        parameters: Type.Object({
            addresses: Type.String({ description: "Comma-separated list of token addresses" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const addressList = (params.addresses as string).split(",").map((a) => a.trim());
            const result = await client.getTokenMarketDataMultiple(addressList, {
                chain: params.chain as SupportedChain,
            });
            return formatResult(result);
        },
    });

    // Token Trade Data
    api.registerTool({
        name: "birdeye-token-trade-data",
        description: "Get detailed trade statistics for a token with customizable timeframes",
        parameters: Type.Object({
            address: Type.String({ description: "Token contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
            frames: Type.Optional(Type.String({ description: "Custom timeframes (e.g., '1m,5m,1h,24h')" })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTokenTradeData(
                params.address as string,
                {
                    chain: params.chain as SupportedChain,
                    frames: params.frames as string,
                }
            );
            return formatResult(result);
        },
    });

    // Pair Overview
    api.registerTool({
        name: "birdeye-pair-overview",
        description: "Get overview stats for a trading pair (liquidity, volume, trades, price)",
        parameters: Type.Object({
            address: Type.String({ description: "Pair/pool contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getPairOverview(
                params.address as string,
                { chain: params.chain as SupportedChain }
            );
            return formatResult(result);
        },
    });

    // Price Stats
    api.registerTool({
        name: "birdeye-price-stats",
        description: "Get price stats (high/low, percentage change) across various timeframes",
        parameters: Type.Object({
            address: Type.String({ description: "Token contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
            timeframes: Type.Optional(Type.String({ description: "Timeframes (e.g., '1m,5m,1h,24h,7d')" })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getPriceStats(
                params.address as string,
                {
                    chain: params.chain as SupportedChain,
                    timeframes: params.timeframes as string,
                }
            );
            return formatResult(result);
        },
    });

    // Token List
    api.registerTool({
        name: "birdeye-token-list",
        description: "Get a filtered and sorted list of tokens with market data",
        parameters: Type.Object({
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
            sortBy: Type.Optional(Type.String({ description: "Sort field (e.g., 'liquidity', 'volume_24h_usd', 'market_cap')" })),
            sortType: Type.Optional(Type.Unsafe<"asc" | "desc">({ type: "string", enum: ["asc", "desc"] })),
            limit: Type.Optional(Type.Number({ description: "Number of results (max 100)" })),
            offset: Type.Optional(Type.Number({ description: "Pagination offset" })),
            minLiquidity: Type.Optional(Type.Number({ description: "Minimum liquidity filter" })),
            minVolume24h: Type.Optional(Type.Number({ description: "Minimum 24h volume filter" })),
            minMarketCap: Type.Optional(Type.Number({ description: "Minimum market cap filter" })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTokenList({
                chain: params.chain as SupportedChain,
                sortBy: params.sortBy as string,
                sortType: params.sortType as "asc" | "desc",
                limit: params.limit as number,
                offset: params.offset as number,
                minLiquidity: params.minLiquidity as number,
                minVolume24hUsd: params.minVolume24h as number,
                minMarketCap: params.minMarketCap as number,
            });
            return formatResult(result);
        },
    });

    // Token Trades
    api.registerTool({
        name: "birdeye-token-trades",
        description: "Get recent trades for a specific token",
        parameters: Type.Object({
            address: Type.String({ description: "Token contract address" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
            limit: Type.Optional(Type.Number({ description: "Number of results (max 100)" })),
            offset: Type.Optional(Type.Number({ description: "Pagination offset" })),
            txType: Type.Optional(Type.Unsafe<"swap" | "buy" | "sell" | "add" | "remove" | "all">({
                type: "string",
                enum: ["swap", "buy", "sell", "add", "remove", "all"],
            })),
            source: Type.Optional(Type.String({ description: "DEX source filter (e.g., 'raydium')" })),
            owner: Type.Optional(Type.String({ description: "Filter by wallet address" })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTokenTrades(
                params.address as string,
                {
                    chain: params.chain as SupportedChain,
                    limit: params.limit as number,
                    offset: params.offset as number,
                    txType: params.txType as "swap" | "buy" | "sell" | "add" | "remove" | "all",
                    source: params.source as string,
                    owner: params.owner as string,
                }
            );
            return formatResult(result);
        },
    });

    // Trader Trades
    api.registerTool({
        name: "birdeye-trader-trades",
        description: "Get trades by a specific trader/wallet address",
        parameters: Type.Object({
            address: Type.String({ description: "Wallet address of the trader" }),
            chain: Type.Optional(Type.Unsafe<SupportedChain>({ type: "string", enum: [...chainEnumValues] })),
            limit: Type.Optional(Type.Number({ description: "Number of results (max 100)" })),
            offset: Type.Optional(Type.Number({ description: "Pagination offset" })),
            beforeTime: Type.Optional(Type.Number({ description: "Unix timestamp to get trades before" })),
            afterTime: Type.Optional(Type.Number({ description: "Unix timestamp to get trades after" })),
        }),
        async execute(_id: string, params: Record<string, unknown>) {
            const client = getClient(api);
            const result = await client.getTraderTrades(
                params.address as string,
                {
                    chain: params.chain as SupportedChain,
                    limit: params.limit as number,
                    offset: params.offset as number,
                    beforeTime: params.beforeTime as number,
                    afterTime: params.afterTime as number,
                }
            );
            return formatResult(result);
        },
    });

    if (api.logger?.debug) {
        api.logger.debug("Birdeye plugin registered successfully");
    }
}
