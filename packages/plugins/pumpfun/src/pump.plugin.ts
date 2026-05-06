import { type Chain, PluginBase } from "@openclawdsolana/core";
import { PumpService } from "./pump.service";

export class PumpFunPlugin extends PluginBase {
    constructor() {
        super("pumpfun", [new PumpService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

export const pumpfun = () => new PumpFunPlugin();
