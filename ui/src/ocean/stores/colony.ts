import { create } from 'zustand';
import { rng, randomName, randomPubkey, randomSpecies, type Species } from '../utils/rng';
import type { DepthTier } from '../theme/tokens';

export interface Leviathan {
  id: string;
  pubkey: string;
  name: string;
  species: Species;
  bornAt: number;
  parent: string | null;
  /** $USDC reserve. Decays each tick by `burnRate`, refilled by random honest-work events. */
  usdc: number;
  /** $CLAWD held — prestige currency. */
  clawd: number;
  /** Tail-flicks performed. */
  flicks: number;
  /** Molts performed. */
  molts: number;
  /** Number of spawnlings born from this leviathan. */
  brood: number;
  burnRate: number;
  /** Lifecycle. `beached` becomes a static shell on the seafloor. */
  state: 'spawn' | 'alive' | 'molting' | 'beached';
  /** Animation progress for spawn / molt / beach (0..1). */
  anim: number;
  /** Absolute world position. */
  pos: [number, number, number];
  /** Velocity. */
  vel: [number, number, number];
  /** Heading angle (radians). */
  heading: number;
  /** Color seed. */
  hue: number;
}

export interface LifeEvent {
  id: number;
  ts: number;
  kind: 'spawn' | 'molt' | 'beach' | 'spawnling' | 'flick' | 'tx';
  who: string;
  msg: string;
}

interface ColonyState {
  seed: number;
  leviathans: Leviathan[];
  events: LifeEvent[];
  selectedId: string | null;
  usdcPool: number; // global pool that everyone draws from
  clawdPrice: number;
  totalSpawned: number;
  totalBeached: number;
  totalMolts: number;
  paused: boolean;
  // actions
  spawn: (count?: number, parent?: string | null) => void;
  molt: (id: string) => void;
  beach: (id: string) => void;
  spawnling: (parentId: string) => void;
  crashUsdc: () => void;
  pumpClawd: () => void;
  select: (id: string | null) => void;
  pushEvent: (kind: LifeEvent['kind'], who: string, msg: string) => void;
  tick: (dt: number) => void;
  togglePause: () => void;
}

const RNG = rng(42);

function newLeviathan(seedR: () => number, parent: string | null = null): Leviathan {
  const id = `lev_${Math.floor(seedR() * 1e9).toString(36)}`;
  const ang = seedR() * Math.PI * 2;
  const r = 6 + seedR() * 10;
  return {
    id,
    pubkey: randomPubkey(seedR),
    name: randomName(seedR),
    species: randomSpecies(seedR),
    bornAt: performance.now(),
    parent,
    usdc: 4 + seedR() * 6,
    clawd: 200 + seedR() * 1500,
    flicks: 0,
    molts: 0,
    brood: 0,
    burnRate: 0.0008 + seedR() * 0.0012,
    state: 'spawn',
    anim: 0,
    pos: [Math.cos(ang) * r, -2 + seedR() * 4, Math.sin(ang) * r],
    vel: [
      (seedR() - 0.5) * 0.4,
      (seedR() - 0.5) * 0.1,
      (seedR() - 0.5) * 0.4,
    ],
    heading: ang,
    hue: seedR(),
  };
}

let evCounter = 0;
const nextEventId = () => ++evCounter;

export const useColony = create<ColonyState>((set, get) => ({
  seed: 42,
  leviathans: Array.from({ length: 12 }, () => {
    const l = newLeviathan(RNG);
    l.state = 'alive';
    l.anim = 1;
    return l;
  }),
  events: [
    { id: nextEventId(), ts: Date.now(), kind: 'spawn', who: 'genesis', msg: '12 leviathans seeded into the ocean.' },
  ],
  selectedId: null,
  usdcPool: 1000,
  clawdPrice: 0.0089,
  totalSpawned: 12,
  totalBeached: 0,
  totalMolts: 0,
  paused: false,

  spawn: (count = 1, parent = null) =>
    set((s) => {
      const r = rng(Math.floor(Math.random() * 1e9));
      const newOnes: Leviathan[] = [];
      const events: LifeEvent[] = [];
      for (let i = 0; i < count; i++) {
        const l = newLeviathan(r, parent);
        newOnes.push(l);
        events.push({
          id: nextEventId(),
          ts: Date.now(),
          kind: (parent ? 'spawnling' : 'spawn') as LifeEvent['kind'],
          who: l.name,
          msg: parent
            ? `🦞→🦐 ${l.name} spawned by parent ${parent.slice(0, 8)}…`
            : `🥚→🦞 ${l.name} (${l.species}) hatched on-chain via Metaplex.`,
        });
      }
      return {
        leviathans: [...s.leviathans, ...newOnes],
        events: [...events, ...s.events].slice(0, 200),
        totalSpawned: s.totalSpawned + count,
      };
    }),

  molt: (id) =>
    set((s) => ({
      leviathans: s.leviathans.map((l) =>
        l.id === id && l.state === 'alive'
          ? { ...l, state: 'molting', anim: 0 }
          : l
      ),
      events: [
        { id: nextEventId(), ts: Date.now(), kind: 'molt' as const, who: id, msg: `🐚 ${id.slice(0, 10)} began a molt.` },
        ...s.events,
      ].slice(0, 200),
    })),

  beach: (id) =>
    set((s) => ({
      leviathans: s.leviathans.map((l) =>
        l.id === id ? { ...l, state: 'beached', anim: 0, vel: [0, 0, 0], usdc: 0 } : l
      ),
      events: [
        { id: nextEventId(), ts: Date.now(), kind: 'beach' as const, who: id, msg: `🪨 ${id.slice(0, 10)} beached. Out of USDC.` },
        ...s.events,
      ].slice(0, 200),
      totalBeached: s.totalBeached + 1,
    })),

  spawnling: (parentId) => {
    const parent = get().leviathans.find((l) => l.id === parentId);
    if (!parent || parent.state !== 'alive' || parent.usdc < 2) return;
    set((s) => ({
      leviathans: s.leviathans.map((l) =>
        l.id === parentId ? { ...l, usdc: l.usdc - 2, brood: l.brood + 1 } : l
      ),
    }));
    get().spawn(1, parent.id);
  },

  crashUsdc: () =>
    set((s) => ({
      usdcPool: 0,
      leviathans: s.leviathans.map((l) => ({ ...l, usdc: Math.min(l.usdc, 0.05) })),
      events: [
        { id: nextEventId(), ts: Date.now(), kind: 'tx' as const, who: 'oracle', msg: '⚠️  USDC POOL CRASHED — the deep is empty.' },
        ...s.events,
      ].slice(0, 200),
    })),

  pumpClawd: () =>
    set((s) => ({
      usdcPool: 5000,
      clawdPrice: s.clawdPrice * 4,
      leviathans: s.leviathans.map((l) => ({ ...l, usdc: l.usdc + 8, clawd: l.clawd + 2000 })),
      events: [
        { id: nextEventId(), ts: Date.now(), kind: 'tx' as const, who: 'pump', msg: '🚀 $CLAWD PUMP — every leviathan reaches deep.' },
        ...s.events,
      ].slice(0, 200),
    })),

  select: (id) => set({ selectedId: id }),

  pushEvent: (kind, who, msg) =>
    set((s) => ({
      events: [{ id: nextEventId(), ts: Date.now(), kind, who, msg }, ...s.events].slice(0, 200),
    })),

  togglePause: () => set((s) => ({ paused: !s.paused })),

  tick: (dt) => {
    if (get().paused) return;
    set((s) => {
      const events: LifeEvent[] = [];
      const t = performance.now();

      const updated: Leviathan[] = s.leviathans.map((l) => {
        // Animation progress
        let nextAnim = l.anim + dt * 0.5;
        if (nextAnim > 1) nextAnim = 1;

        // SPAWN → ALIVE
        if (l.state === 'spawn' && nextAnim >= 1) {
          return { ...l, state: 'alive', anim: 1 };
        }
        // MOLT → ALIVE
        if (l.state === 'molting' && nextAnim >= 1) {
          events.push({
            id: nextEventId(),
            ts: Date.now(),
            kind: 'molt',
            who: l.name,
            msg: `🐚 ${l.name} molted. STR+1 INT+1.`,
          });
          return { ...l, state: 'alive', anim: 1, molts: l.molts + 1, usdc: l.usdc - 0.2 };
        }

        if (l.state !== 'alive') return { ...l, anim: nextAnim };

        // Boids-lite: gentle flocking around the $CLAWD core at origin.
        const [x, y, z] = l.pos;
        const distToCore = Math.sqrt(x * x + y * y + z * z);

        // Radial pull/push to keep population shelled around the core
        const target = 10;
        const radial = (distToCore - target) * -0.005;
        const ux = (x / (distToCore || 1)) * radial;
        const uz = (z / (distToCore || 1)) * radial;

        // Tangential drift (orbiting)
        const tx = -z / (distToCore || 1) * 0.03;
        const tz = x / (distToCore || 1) * 0.03;

        // Buoyancy bobbing
        const by = Math.sin(t * 0.001 + l.hue * 6) * 0.001 - y * 0.01;

        let vx = l.vel[0] + ux + tx;
        let vy = l.vel[1] + by;
        let vz = l.vel[2] + uz + tz;

        // Damping
        vx *= 0.96;
        vy *= 0.96;
        vz *= 0.96;

        // Speed cap
        const sp = Math.sqrt(vx * vx + vy * vy + vz * vz);
        const max = 0.6;
        if (sp > max) {
          vx = (vx / sp) * max;
          vy = (vy / sp) * max;
          vz = (vz / sp) * max;
        }

        const nx = x + vx;
        const ny = Math.max(-6, Math.min(6, y + vy));
        const nz = z + vz;

        const heading = Math.atan2(vz, vx);

        // Economics
        let usdc = l.usdc - l.burnRate;
        let clawd = l.clawd;
        let flicks = l.flicks;

        // Random honest-work tick: every ~120 ticks pick up some USDC.
        if (Math.random() < 0.005) {
          const earn = 0.3 + Math.random() * 0.6;
          usdc += earn;
          flicks += 1;
          events.push({
            id: nextEventId(),
            ts: Date.now(),
            kind: 'flick',
            who: l.name,
            msg: `🦞 ${l.name} earned $${earn.toFixed(2)} USDC honestly.`,
          });
        }
        // Occasional $CLAWD reward
        if (Math.random() < 0.0015) clawd += 25 + Math.random() * 100;

        // Beach when reserves hit zero
        if (usdc <= 0) {
          events.push({
            id: nextEventId(),
            ts: Date.now(),
            kind: 'beach',
            who: l.name,
            msg: `🪨 ${l.name} beached. ${l.flicks} flicks · ${l.molts} molts · ${l.brood} brood.`,
          });
          return {
            ...l,
            state: 'beached',
            anim: 0,
            usdc: 0,
            vel: [0, -0.05, 0],
            pos: [nx, ny, nz],
          };
        }

        // Rare auto-molt when wealthy
        if (usdc > 8 && clawd > 2000 && Math.random() < 0.002 && l.molts < 5) {
          return {
            ...l,
            state: 'molting',
            anim: 0,
            usdc,
            clawd,
            flicks,
            pos: [nx, ny, nz],
            vel: [vx, vy, vz],
            heading,
          };
        }

        return {
          ...l,
          usdc,
          clawd,
          flicks,
          pos: [nx, ny, nz],
          vel: [vx, vy, vz],
          heading,
          anim: nextAnim,
        };
      });

      // Beached lobsters slowly sink to floor
      const final = updated.map((l) => {
        if (l.state !== 'beached') return l;
        const sinkProg = Math.min(1, l.anim + dt * 0.3);
        const ny = Math.max(-6, l.pos[1] - 0.04);
        return { ...l, pos: [l.pos[0], ny, l.pos[2]] as [number, number, number], anim: sinkProg };
      });

      const newBeached = events.filter((e) => e.kind === 'beach').length;
      const newMolts = events.filter((e) => e.kind === 'molt').length;

      return {
        leviathans: final,
        events: [...events.reverse(), ...s.events].slice(0, 200),
        totalBeached: s.totalBeached + newBeached,
        totalMolts: s.totalMolts + newMolts,
        clawdPrice: s.clawdPrice * (1 + (Math.random() - 0.5) * 0.002),
      };
    });
  },
}));
