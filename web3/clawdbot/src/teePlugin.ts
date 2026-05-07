import { type Plugin, type IAgentRuntime, logger, Service } from '@openclawdsolana/core';
import { z } from 'zod';
import { TappdClient } from '@phala/dstack-sdk';
import { type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts';
import { keccak256 } from 'viem';
import { Keypair } from '@solana/web3.js';
import crypto from 'node:crypto';

const configSchema = z.object({
    TEE_MODE: z.string().optional().default('OFF'),
    TEE_VENDOR: z.string().optional().default('phala'),
    WALLET_SECRET_SALT: z.string().optional().default('secret_salt'),
});

type TeeServiceConfig = {
    teeClient: TappdClient;
    secretSalt: string;
    runtime: IAgentRuntime;
};

type DeriveKeyResponse = Awaited<ReturnType<TappdClient['deriveKey']>>;

const createTeeServiceConfig = (runtime: IAgentRuntime): TeeServiceConfig => ({
    teeClient: new TappdClient(),
    secretSalt: (process.env.WALLET_SECRET_SALT || 'secret_salt').trim(),
    runtime,
});

const deriveEcdsaKeypair = (deriveKeyResponse: DeriveKeyResponse): PrivateKeyAccount => {
    const hex = keccak256(deriveKeyResponse.asUint8Array());
    return privateKeyToAccount(hex);
};

const deriveEd25519Keypair = (deriveKeyResponse: DeriveKeyResponse): Keypair => {
    const uint8ArrayDerivedKey = deriveKeyResponse.asUint8Array();
    const hash = crypto.createHash('sha256');
    hash.update(uint8ArrayDerivedKey);
    const seed = hash.digest();
    const seedArray = new Uint8Array(seed);
    return Keypair.fromSeed(seedArray.slice(0, 32));
};

const isTeeConnectionError = (error: unknown): boolean => {
    return (
        error instanceof Error &&
        (error.message.includes('ENOENT') || error.message.includes('Failed to connect'))
    );
};

const handleTeeKeyDerivation = async (config: TeeServiceConfig): Promise<void> => {
    try {
        const deriveKeyResponse: DeriveKeyResponse = await config.teeClient.deriveKey();

        const ecdsaKeypair = deriveEcdsaKeypair(deriveKeyResponse);
        const ed25519Keypair = deriveEd25519Keypair(deriveKeyResponse);

        logger.info('*** Phala TEE Key Derived Successfully! ***');
        logger.info({ address: ecdsaKeypair.address }, 'ECDSA Address:');
        logger.info({ publicKey: ed25519Keypair.publicKey.toBase58() }, 'Solana Public Key:');

    } catch (error) {
        if (isTeeConnectionError(error)) {
            logger.warn('Phala TEE daemon not available - running in non-TEE mode');
        } else {
            logger.error({ error }, 'Phala TEE connection failed:');
        }
    }
};

export class PhalaTeeService extends Service {
    public static serviceType = 'phala-tee';

    static async start(runtime: IAgentRuntime): Promise<PhalaTeeService> {
        const service = new PhalaTeeService(runtime);
        const config = createTeeServiceConfig(runtime);
        await handleTeeKeyDerivation(config);
        return service;
    }
}

export const phalaTeePlugin: Plugin = {
    name: 'phala-tee-plugin',
    description: 'Integration with Phala Network TEE (dstack)',
    config: {
        TEE_MODE: process.env.TEE_MODE || 'OFF',
        TEE_VENDOR: process.env.TEE_VENDOR || 'phala',
        WALLET_SECRET_SALT: process.env.WALLET_SECRET_SALT || 'secret_salt',
    },
    async init(_config: Record<string, string>, runtime: IAgentRuntime) {
        logger.info('Initializing Phala TEE plugin');
    },
    services: [PhalaTeeService],
};

export default phalaTeePlugin;
