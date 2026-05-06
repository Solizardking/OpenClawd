import { PluginBase } from "@openclawdsolana/core";
import { Chain } from "@openclawdsolana/core";
import { EVMWalletClient } from "@openclawdsolana/wallet-evm";
import { BalanceService } from "./service";

export type OneInchCtorParams = {
    apiKey: string;
};

export class OneInchPlugin extends PluginBase<EVMWalletClient> {
    constructor(params: OneInchCtorParams) {
        super("1inch", [new BalanceService(params)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm";
}

export function oneInch(params: OneInchCtorParams) {
    return new OneInchPlugin(params);
}
