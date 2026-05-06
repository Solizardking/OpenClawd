import { type Chain, PluginBase } from "@openclawdsolana/core";
import type { EVMWalletClient } from "@openclawdsolana/wallet-evm";
import { mode } from "viem/chains";
import { BmxService } from "./bmx.service";

const SUPPORTED_CHAINS = [mode];

export class BmxPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("bmx", [new BmxService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const bmx = () => new BmxPlugin();
