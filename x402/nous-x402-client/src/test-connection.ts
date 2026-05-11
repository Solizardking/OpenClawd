#!/usr/bin/env node

/**
 * End-to-end test for the Nous x402 Hermes Agent
 *
 * Tests:
 * 1. Nous Research API connectivity (models endpoint)
 * 2. Wallet availability (pay CLI sandbox or private key)
 * 3. x402 payment flow (trigger 402, sign, retry)
 * 4. Paper trading loop
 *
 * Usage:
 *   pnpm test              # Full end-to-end test
 *   pnpm test -- --quick   # Skip trading test
 *   pnpm test -- --verbose # Verbose output
 *
 * @package @openclawdsolana/nous-x402
 */

import { NousApiClient, NOUS_MODELS, getSolUsdcPrice, estimateCost } from './nous-api.js';
import { X402WalletClient, createNousX402Signer } from './x402-client.js';
import { TradeLoop } from './trade-loop.js';

// ─── Test Results ────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];
let passed = 0;
let failed = 0;

function record(name: string, success: boolean, message: string) {
  results.push({ name, passed: success, message, duration: 0 });
  if (success) {
    console.error(`  ✅ ${name}: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${name}: ${message}`);
    failed++;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function testNousApiConnectivity(): Promise<void> {
  const start = Date.now();
  try {
    const client = new NousApiClient();
    const models = await client.listModels();
    const modelIds = models.data?.map(m => m.id) ?? [];
    const hasHermes = modelIds.some(id => id.includes('hermes'));

    record(
      'Nous API Connectivity',
      hasHermes,
      `Found ${modelIds.length} models${hasHermes ? ', including Hermes' : ''}`
    );
  } catch (err) {
    record('Nous API Connectivity', false, `Failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function testSolPrice(): Promise<void> {
  const start = Date.now();
  try {
    const price = await getSolUsdcPrice();
    record('SOL Price Fetch', price > 0, `SOL = $${price.toFixed(2)}`);
  } catch (err) {
    record('SOL Price Fetch', false, `Failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function testWalletAvailability(): Promise<void> {
  const start = Date.now();
  try {
    const wallet = new X402WalletClient({
      walletConfig: process.env.SOLANA_PRIVATE_KEY
        ? { privateKey: process.env.SOLANA_PRIVATE_KEY, publicKey: process.env.SOLANA_PUBLIC_KEY ?? '' }
        : undefined,
    });

    const pubkey = wallet.getPublicKey();
    record('Wallet Available', !!pubkey, `Public key: ${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`);
  } catch (err) {
    // Pay CLI might not be installed
    record('Wallet Available', false, `No wallet: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function testBalance(): Promise<void> {
  const start = Date.now();
  try {
    const wallet = new X402WalletClient({
      walletConfig: process.env.SOLANA_PRIVATE_KEY
        ? { privateKey: process.env.SOLANA_PRIVATE_KEY, publicKey: process.env.SOLANA_PUBLIC_KEY ?? '' }
        : undefined,
    });

    const balance = await wallet.getBalance();
    record(
      'Wallet Balance',
      true,
      `SOL: ${balance.sol.toFixed(4)}`
    );
  } catch (err) {
    record('Wallet Balance', false, `Failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function testX402PaymentFlow(): Promise<void> {
  const start = Date.now();
  try {
    const wallet = new X402WalletClient({
      walletConfig: process.env.SOLANA_PRIVATE_KEY
        ? { privateKey: process.env.SOLANA_PRIVATE_KEY, publicKey: process.env.SOLANA_PUBLIC_KEY ?? '' }
        : undefined,
    });

    const client = new NousApiClient();

    // Check if we have enough balance first
    const balance = await wallet.getBalance();
    if (balance.sol < 0.001) {
      record('x402 Payment Flow', false, `Insufficient SOL for gas (${balance.sol.toFixed(4)} SOL). Need at least ~0.001 SOL`);
      return;
    }

    // Send a minimal request to trigger 402
    const signer = createNousX402Signer(wallet);

    try {
      const response = await client.sendWithX402(
        {
          model: NOUS_MODELS.HERMES_4_3_36B,
          messages: [{ role: 'user', content: 'Say "ok" if you can hear me.' }],
          max_tokens: 10,
        },
        signer
      );

      const content = response.choices[0]?.message?.content ?? '';
      record(
        'x402 Payment Flow',
        true,
        `Got response: "${content.slice(0, 100)}" (${response.usage?.total_tokens ?? 0} tokens)`
      );
    } catch (err: any) {
      // x402 might fail if the endpoint doesn't support it yet, or if balance is low
      if (err.message?.includes('402')) {
        record('x402 Payment Flow', false, 'Server returned 402 but x402 flow failed. May need more USDC or the endpoint may not support x402 yet.');
      } else if (err.message?.includes('No X-Payment-Required')) {
        record('x402 Payment Flow', false, 'Server returned 402 but no X-Payment-Required header. The endpoint may use standard API key auth only.');
      } else {
        record('x402 Payment Flow', false, `Failed: ${err.message ?? String(err)}`);
      }
    }
  } catch (err) {
    record('x402 Payment Flow', false, `Setup failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function testPaperTrading(): Promise<void> {
  const start = Date.now();
  try {
    const trader = new TradeLoop({
      mode: 'paper',
      cycleIntervalMs: 5_000, // Fast cycles for testing
    });

    // Run 3 cycles
    for (let i = 0; i < 3; i++) {
      await trader.runCycle();
      await new Promise(r => setTimeout(r, 500));
    }

    const stats = trader.stats;
    record(
      'Paper Trading',
      stats.totalTrades >= 0,
      `${stats.totalTrades} trades, $${stats.totalProfitUsdc.toFixed(4)} profit, ${stats.cycleCount} cycles`
    );
  } catch (err) {
    record('Paper Trading', false, `Failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function testCostEstimation(): Promise<void> {
  const cost = estimateCost('hermes-4.3-36b', 500, 200);
  record(
    'Cost Estimation',
    cost > 0 && cost < 1,
    `~500 in + 200 out = $${cost.toFixed(6)}`
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const quick = args.includes('--quick');
  const verbose = args.includes('--verbose');

  console.error('╔══════════════════════════════════════════════╗');
  console.error('║  🦞 Hermes x402 — End-to-End Test Suite      ║');
  console.error('╚══════════════════════════════════════════════╝');
  console.error('');

  // Run tests
  await testNousApiConnectivity();
  await testSolPrice();
  await testCostEstimation();
  await testWalletAvailability();
  await testBalance();

  // x402 flow (requires wallet + balance)
  const hasWallet = results.find(r => r.name === 'Wallet Available')?.passed;
  if (hasWallet) {
    await testX402PaymentFlow();
  } else {
    console.error('\n  ⚠️  Skipping x402 payment flow (no wallet configured)');
    console.error('     Set SOLANA_PRIVATE_KEY or install pay CLI (brew install pay)');
  }

  // Paper trading test
  if (!quick) {
    await testPaperTrading();
  } else {
    console.error('\n  ⚠️  Skipping paper trading (--quick mode)');
  }

  // Summary
  const total = passed + failed;
  console.error('\n' + '='.repeat(50));
  console.error(`Results: ${passed}/${total} passed${failed > 0 ? `, ${failed} failed` : ''}`);
  console.error('='.repeat(50));

  // Print detailed results
  if (verbose) {
    for (const r of results) {
      console.error(`  ${r.passed ? '✅' : '❌'} ${r.name}: ${r.message}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
