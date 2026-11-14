import { describe, expect, it } from 'vitest';
import { LEVELS, generateSheet, parseAnswer } from './curriculum';
import { mulberry32 } from './rng';

/** Independently evaluates a prompt as rendered on screen. */
function evaluate(prompt: string, x?: number): number {
  const js = prompt
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/(\d)x/g, '$1*x');
  return Function('x', `return (${js});`)(x);
}

function check(prompt: string, answer: number): boolean {
  if (prompt.includes('=')) {
    const [lhs, rhs] = prompt.split('=');
    return evaluate(lhs, answer) === evaluate(rhs);
  }
  return evaluate(prompt) === answer;
}

describe('curriculum', () => {
  it('has unique level ids', () => {
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
  });

  for (const level of LEVELS) {
    it(`${level.id} produces correct integer answers`, () => {
      const rng = mulberry32(level.id.charCodeAt(0) * 31 + level.id.charCodeAt(1));
      for (let i = 0; i < 2000; i++) {
        const p = level.generate(rng);
        expect(Number.isInteger(p.answer), p.prompt).toBe(true);
        expect(check(p.prompt, p.answer), `${p.prompt} = ${p.answer}`).toBe(true);
        if (!level.allowNegative) expect(p.answer, p.prompt).toBeGreaterThanOrEqual(0);
      }
    });
  }

  it('B4 always carries and B6 always borrows', () => {
    const rng = mulberry32(7);
    const b4 = LEVELS.find((l) => l.id === 'B4')!;
    const b6 = LEVELS.find((l) => l.id === 'B6')!;
    for (let i = 0; i < 500; i++) {
      const [a, b] = b4.generate(rng).prompt.split(' + ').map(Number);
      expect((a % 10) + (b % 10)).toBeGreaterThanOrEqual(10);
      const [c, d] = b6.generate(rng).prompt.split(' − ').map(Number);
      expect(c % 10).toBeLessThan(d % 10);
    }
  });

  it('avoids repeated prompts within a sheet', () => {
    const rng = mulberry32(42);
    for (const level of LEVELS) {
      const sheet = generateSheet(level, 10, rng);
      expect(sheet).toHaveLength(10);
      expect(new Set(sheet.map((p) => p.prompt)).size, level.id).toBe(10);
    }
  });
});

describe('parseAnswer', () => {
  it('accepts integers with either minus sign', () => {
    expect(parseAnswer(' 42 ')).toBe(42);
    expect(parseAnswer('-7')).toBe(-7);
    expect(parseAnswer('−7')).toBe(-7);
  });
  it('rejects anything else', () => {
    expect(parseAnswer('')).toBeNull();
    expect(parseAnswer('3.5')).toBeNull();
    expect(parseAnswer('abc')).toBeNull();
  });
});
