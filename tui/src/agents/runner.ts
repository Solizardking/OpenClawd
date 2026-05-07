import type { AgentEvent, RunningAgent } from './types.js';
import { trending } from '../services/birdeye.js';
import { jupPrice } from '../services/jupiter.js';

type Tick = (push: (e: AgentEvent) => void) => Promise<void>;

function makeAgent(name: string, intervalMs: number, tick: Tick): RunningAgent {
  const id = `${name.toLowerCase()}_${Date.now().toString(36)}`;
  const events: AgentEvent[] = [];
  let stopped = false;

  const push = (e: AgentEvent) => {
    events.push(e);
    if (events.length > 200) events.splice(0, events.length - 200);
  };

  const agent: RunningAgent = {
    id,
    name,
    status: 'running',
    events,
    stop: () => {
      stopped = true;
      agent.status = 'stopped';
      push({ ts: Date.now(), level: 'info', msg: `${name} stopped.` });
    },
  };

  const loop = async () => {
    push({ ts: Date.now(), level: 'info', msg: `${name} started.` });
    while (!stopped) {
      try {
        await tick(push);
      } catch (e: any) {
        push({ ts: Date.now(), level: 'error', msg: `${name}: ${e?.message ?? e}` });
        agent.status = 'error';
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };
  void loop();
  return agent;
}

export function spawnScanner(): RunningAgent {
  return makeAgent('scanner', 30_000, async (push) => {
    const tokens = await trending('1h', 5);
    for (const t of tokens) {
      push({ ts: Date.now(), level: 'signal', msg: `${t.symbol} vol $${Math.round(t.v24hUSD || 0).toLocaleString()}` });
    }
  });
}

export function spawnMonitor(mint: string): RunningAgent {
  return makeAgent(`monitor:${mint.slice(0, 6)}`, 15_000, async (push) => {
    const p = await jupPrice(mint);
    if (p === null) push({ ts: Date.now(), level: 'warn', msg: 'no price' });
    else push({ ts: Date.now(), level: 'info', msg: `price $${p.toFixed(8)}` });
  });
}

export function spawnAnalyst(): RunningAgent {
  return makeAgent('analyst', 60_000, async (push) => {
    const tokens = await trending('24h', 3);
    if (!tokens.length) {
      push({ ts: Date.now(), level: 'warn', msg: 'no signals' });
      return;
    }
    for (const t of tokens) {
      const verdict =
        (t.v24hUSD || 0) > 1_000_000 && (t.liquidity || 0) > 100_000
          ? 'BUY 📈'
          : (t.liquidity || 0) < 25_000
          ? 'AVOID ⚠️'
          : 'WATCH 👀';
      push({ ts: Date.now(), level: 'signal', msg: `${t.symbol}: ${verdict}` });
    }
  });
}

export function spawnTrader(): RunningAgent {
  return makeAgent('trader', 45_000, async (push) => {
    push({ ts: Date.now(), level: 'info', msg: 'evaluating positions...' });
    push({ ts: Date.now(), level: 'info', msg: 'no executable signals (paper mode)' });
  });
}
