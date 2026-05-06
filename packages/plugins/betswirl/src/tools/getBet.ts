import { createTool } from "@openclawdsolana/core";
import { EVMWalletClient } from "@openclawdsolana/wallet-evm";
import { type Hex } from "viem";
import { z } from "zod";

import { getBet } from "../utils/betswirl";

export function createGetBetTool(walletClient: EVMWalletClient, theGraphKey?: string) {
    return createTool(
        {
            name: "betswirl_getBet",
            description: "Get a bet from its hash.",
            parameters: z.object({
                hash: z.string().describe("The bet hash"),
            }),
        },
        async (parameters) => {
            return await getBet(walletClient, parameters.hash as Hex, theGraphKey);
        },
    );
}
