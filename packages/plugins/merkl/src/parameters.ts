import { createToolParameters } from "@openclawdsolana/core";
import { z } from "zod";

export class ClaimProtocolIncentivesParams extends createToolParameters(
    z.object({
        campaignId: z.string().optional().describe("Optional UUID of the Merkl protocol incentives campaign"),
    }),
) {}
