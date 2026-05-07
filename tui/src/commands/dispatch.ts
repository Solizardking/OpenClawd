import {
  createBuddy,
  feedBuddy,
  getActiveBuddy,
  listBuddies,
  playBuddy,
  SPECIES,
  Buddy,
} from '../store/buddies.js';
import { spawnAnalyst, spawnMonitor, spawnScanner, spawnTrader } from '../agents/runner.js';
import type { RunningAgent } from '../agents/types.js';
import { trending, search as birdSearch, portfolio, tokenOverview } from '../services/birdeye.js';
import { jupPrice } from '../services/jupiter.js';
import { getBalance } from '../services/helius.js';
import { xaiChat, xaiSearch } from '../services/xai.js';
import { optEnv } from '../services/env.js';

export interface DispatchCtx {
  buddy: Buddy | null;
  setBuddy: (b: Buddy | null) => void;
  agents: RunningAgent[];
  setAgents: (a: RunningAgent[]) => void;
  model: string;
  setModel: (m: string) => void;
  chain: string;
  setChain: (c: string) => void;
  yolo: boolean;
  print: (kind: 'system' | 'tool' | 'agent' | 'error', text: string) => void;
  setShowHelp: (v: boolean) => void;
  exit: () => void;
}

const VALID_MODELS = [
  'grok-4-1-fast',
  'grok-4.20-reasoning',
  'claude-sonnet-4-6',
  'claude-opus-4-7',
  'kimi-k2.5',
  'glm-4.7-flash',
  'minimax/minimax-m2-her',
  'gpt-image-2',
];

function parts(raw: string): string[] {
  return raw.trim().split(/\s+/).filter(Boolean);
}

export async function dispatch(name: string, raw: string, ctx: DispatchCtx): Promise<void> {
  const args = parts(raw);

  switch (name) {
    case 'help': {
      ctx.setShowHelp(true);
      return;
    }
    case 'clear': {
      ctx.setShowHelp(false);
      ctx.print('system', '(conversation cleared)');
      return;
    }
    case 'quit':
    case 'exit': {
      ctx.exit();
      return;
    }
    case 'model': {
      if (!args.length) {
        ctx.print('system', `Active model: ${ctx.model}`);
        ctx.print('tool', `Available: ${VALID_MODELS.join(', ')}`);
        return;
      }
      ctx.setModel(args[0]);
      ctx.print('system', `model → ${args[0]}`);
      return;
    }
    case 'chain': {
      if (!args.length) {
        ctx.print('system', `Active chain: ${ctx.chain}`);
        return;
      }
      const next = args[0].toLowerCase();
      if (next !== 'solana') {
        ctx.print('error', `${next} not supported yet (soon™). solana only.`);
        return;
      }
      ctx.setChain(next);
      ctx.print('system', `chain → ${next}`);
      return;
    }
    case 'personality': {
      const persona = args[0] || 'lobster';
      ctx.print('system', `personality → ${persona} 🦞`);
      return;
    }
    case 'voice': {
      const mode = args[0] || 'on';
      const provider = optEnv('CARTESIA_API_KEY') ? 'Cartesia' : optEnv('ELEVEN_LABS_API_KEY') ? 'ElevenLabs' : 'none';
      if (provider === 'none') {
        ctx.print('error', 'No voice provider configured (set CARTESIA_API_KEY or ELEVEN_LABS_API_KEY).');
        return;
      }
      ctx.print('system', `voice ${mode} via ${provider} (Ctrl+B to record)`);
      return;
    }
    // ── Buddy ─────────────────────────────────────────────
    case 'pet':
    case 'buddy': {
      const sub = args[0];
      if (!sub || sub === 'show') {
        const b = ctx.buddy || getActiveBuddy();
        if (!b) {
          ctx.print('system', 'No buddy yet. Hatch one with /buddy hatch <name> [species]');
          return;
        }
        ctx.setBuddy(b);
        ctx.print('system', `🦞 ${b.name} (${b.species}) lvl ${b.level}`);
        return;
      }
      if (sub === 'hatch') {
        const name = args[1];
        const species = args[2];
        if (!name) {
          ctx.print('error', 'Usage: /buddy hatch <name> [species]');
          return;
        }
        const created = createBuddy(name, species);
        ctx.setBuddy(created);
        ctx.print('system', `🥚→🦞 hatched "${created.name}" the ${created.species}!`);
        return;
      }
      if (sub === 'feed') {
        const b = ctx.buddy || getActiveBuddy();
        if (!b) return ctx.print('error', 'No buddy. /buddy hatch first.');
        const fed = feedBuddy(b.id);
        if (fed) {
          ctx.setBuddy(fed);
          ctx.print('system', `🍤 fed ${fed.name} — hunger ${fed.hunger}, joy ${fed.happiness}, +5 XP`);
        }
        return;
      }
      if (sub === 'play') {
        const b = ctx.buddy || getActiveBuddy();
        if (!b) return ctx.print('error', 'No buddy. /buddy hatch first.');
        const played = playBuddy(b.id);
        if (played) {
          ctx.setBuddy(played);
          ctx.print('system', `🎾 played with ${played.name} — joy ${played.happiness}, +10 XP`);
        }
        return;
      }
      if (sub === 'list') {
        const all = listBuddies();
        if (!all.length) return ctx.print('system', '(no buddies)');
        for (const x of all) {
          ctx.print('tool', `${x.name.padEnd(14)} ${x.species.padEnd(10)} lvl ${x.level}`);
        }
        return;
      }
      if (sub === 'species') {
        ctx.print('tool', `Species: ${SPECIES.join(', ')}`);
        return;
      }
      ctx.print('error', `Unknown /buddy subcommand: ${sub}`);
      return;
    }
    // ── Market ────────────────────────────────────────────
    case 'trending': {
      const tf = (args[0] as '1h' | '4h' | '24h' | undefined) || '24h';
      ctx.print('tool', `Birdeye trending ${tf}...`);
      try {
        const list = await trending(tf, 10);
        list.forEach((t, i) =>
          ctx.print('agent', `${i + 1}. ${(t.symbol || '?').padEnd(8)} vol $${Math.round(t.v24hUSD || 0).toLocaleString()}`)
        );
      } catch (e: any) {
        ctx.print('error', `Birdeye: ${e?.message ?? e}`);
      }
      return;
    }
    case 'search': {
      if (!raw) return ctx.print('error', 'Usage: /search <query>');
      ctx.print('tool', `searching tokens + web for "${raw}"...`);
      try {
        const [tok, web] = await Promise.all([birdSearch(raw).catch(() => null), xaiSearch(raw, 'web').catch(() => '')]);
        if (tok?.items?.[0]?.result?.length) {
          for (const t of tok.items[0].result.slice(0, 5)) {
            ctx.print('agent', `🪙 ${t.symbol} ${t.name} ${t.address?.slice(0, 8)}...`);
          }
        }
        if (web) ctx.print('agent', String(web).slice(0, 800));
      } catch (e: any) {
        ctx.print('error', `search: ${e?.message ?? e}`);
      }
      return;
    }
    case 'clawd': {
      if (!raw) return ctx.print('error', 'Usage: /clawd <message>');
      ctx.print('tool', `🦞 (◜°v°◝) thinking via ${ctx.model}...`);
      try {
        const reply = await xaiChat(raw, ctx.model);
        ctx.print('agent', reply);
      } catch (e: any) {
        ctx.print('error', `clawd: ${e?.message ?? e}`);
      }
      return;
    }
    // ── Wallet ────────────────────────────────────────────
    case 'wallet': {
      const addr = args[0];
      if (!addr) return ctx.print('error', 'Usage: /wallet <address>');
      try {
        const bal = await getBalance(addr);
        ctx.print('agent', `${addr.slice(0, 6)}... balance: ${bal.toFixed(4)} SOL`);
        const port = await portfolio(addr).catch(() => null);
        if (port?.items?.length) {
          for (const t of port.items.slice(0, 8)) {
            ctx.print('tool', `${(t.symbol || '?').padEnd(8)} ${(t.uiAmount || 0).toFixed(2)} (≈$${(t.valueUsd || 0).toFixed(2)})`);
          }
        }
      } catch (e: any) {
        ctx.print('error', `wallet: ${e?.message ?? e}`);
      }
      return;
    }
    case 'balance': {
      const addr = optEnv('PUBLIC_KEY') || optEnv('BAGS_WALLET');
      if (!addr) return ctx.print('error', 'No wallet configured (PUBLIC_KEY or BAGS_WALLET)');
      try {
        const bal = await getBalance(addr);
        ctx.print('agent', `Your wallet ${addr.slice(0, 6)}... — ${bal.toFixed(4)} SOL`);
      } catch (e: any) {
        ctx.print('error', `balance: ${e?.message ?? e}`);
      }
      return;
    }
    // ── Trading (gated) ───────────────────────────────────
    case 'launch':
    case 'ape':
    case 'long':
    case 'short':
    case 'buy':
    case 'sell': {
      if (!ctx.yolo) {
        ctx.print('error', `${name} requires --yolo flag at launch (clawd --yolo) for safety.`);
        return;
      }
      ctx.print('tool', `🦞 [paper] ${name} ${args.join(' ')}`);
      ctx.print('system', `(stub — wire to Bags/Pump/Aster services next iteration)`);
      return;
    }
    // ── Agent panes ───────────────────────────────────────
    case 'scan': {
      const a = spawnScanner();
      ctx.setAgents([...ctx.agents, a]);
      ctx.print('system', `agent ${a.id} spawned`);
      return;
    }
    case 'analyze':
    case 'analyst': {
      const a = spawnAnalyst();
      ctx.setAgents([...ctx.agents, a]);
      ctx.print('system', `agent ${a.id} spawned`);
      return;
    }
    case 'trade':
    case 'trader': {
      const a = spawnTrader();
      ctx.setAgents([...ctx.agents, a]);
      ctx.print('system', `agent ${a.id} spawned`);
      return;
    }
    case 'monitor': {
      const mint = args[0];
      if (!mint) return ctx.print('error', 'Usage: /monitor <mint>');
      const a = spawnMonitor(mint);
      ctx.setAgents([...ctx.agents, a]);
      ctx.print('system', `agent ${a.id} spawned`);
      return;
    }
    case 'agents': {
      if (!ctx.agents.length) return ctx.print('system', '(no agents running)');
      for (const a of ctx.agents) {
        ctx.print('tool', `${a.id.padEnd(28)} ${a.name.padEnd(14)} ${a.status}`);
      }
      return;
    }
    case 'kill': {
      const id = args[0];
      const a = ctx.agents.find((x) => x.id === id || x.id.startsWith(id || '__none__'));
      if (!a) return ctx.print('error', `no agent ${id}`);
      a.stop();
      ctx.setAgents(ctx.agents.filter((x) => x !== a));
      ctx.print('system', `killed ${a.id}`);
      return;
    }
    default:
      ctx.print('error', `Unknown command: /${name}. Try /help`);
  }
}
