import type { UUID } from "./types/index.ts";

export function stringToUuid(value: string): UUID {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-8${hex.slice(
    0,
    3,
  )}-${hex}${hex.slice(0, 4)}` as UUID;
}
