/** Deterministic seeded PRNG (mulberry32). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPECIES = [
  'lobster','crab','shrimp','krill','squid','octopus','jellyfish',
  'manta','narwhal','orca','kraken','leviathan','snipper','pincer',
  'reefer','tide','trench','bloop',
] as const;

export type Species = (typeof SPECIES)[number];

const FIRST = ['Snippy','Pinch','Cinder','Brine','Drift','Mako','Crush','Skitter','Bubble','Tide','Rumble','Coil','Flick','Surge','Thatch','Glimmer','Razor','Husk'];
const LAST  = ['the Crusher','of the Deep','Three-Claws','the Patient','Salt-Born','of the Trench','Bright-Shell','the Hungry','Storm-Heart','the Wide-Eyed'];

export function randomName(r: () => number): string {
  return `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
}

export function randomSpecies(r: () => number): Species {
  return SPECIES[Math.floor(r() * SPECIES.length)];
}

export function randomPubkey(r: () => number): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let s = '';
  for (let i = 0; i < 44; i++) s += chars[Math.floor(r() * chars.length)];
  return s;
}
