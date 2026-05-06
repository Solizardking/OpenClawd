import { type Chain, PluginBase } from "@openclawdsolana/core";
import { OrcaService } from "./orca.service";

export class OrcaPlugin extends PluginBase {
    constructor() {
        super("orca", [new OrcaService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "solana";
}

export const orca = () => new OrcaPlugin();
