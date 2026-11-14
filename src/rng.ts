export type Rng = () => number;

/** Small seeded PRNG so worksheets are reproducible in tests. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max], both inclusive. */
export const int = (rng: Rng, min: number, max: number): number =>
  min + Math.floor(rng() * (max - min + 1));

export const pick = <T,>(rng: Rng, items: readonly T[]): T =>
  items[Math.floor(rng() * items.length)];

/** Random non-zero integer whose absolute value is in [min, max]. */
export const signed = (rng: Rng, min: number, max: number): number =>
  int(rng, min, max) * (rng() < 0.5 ? -1 : 1);
