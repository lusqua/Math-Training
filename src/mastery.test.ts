import { describe, expect, it } from 'vitest';
import { LEVELS } from './curriculum';
import {
  PLACEMENT_CHECKPOINTS,
  SHEETS_TO_ADVANCE,
  applyResult,
  dayStreak,
  evaluateSheet,
  newProgress,
  placementStartIndex,
} from './mastery';

const A1 = LEVELS[0];

describe('evaluateSheet', () => {
  it('masters with at most one mistake inside the standard time', () => {
    expect(evaluateSheet(A1, 10, 10, 40).mastered).toBe(true);
    expect(evaluateSheet(A1, 9, 10, 40).mastered).toBe(true);
  });
  it('does not master with two mistakes or over time', () => {
    expect(evaluateSheet(A1, 8, 10, 10).mastered).toBe(false);
    expect(evaluateSheet(A1, 10, 10, 41).mastered).toBe(false);
  });
});

describe('applyResult', () => {
  const pass = () => evaluateSheet(A1, 10, 10, 20);
  const fail = () => evaluateSheet(A1, 5, 10, 20);

  it(`advances after ${SHEETS_TO_ADVANCE} mastered sheets in a row`, () => {
    let o = applyResult({ ...newProgress(), placed: true }, pass());
    expect(o.advanced).toBe(false);
    o = applyResult(o.progress, pass());
    expect(o.advanced).toBe(true);
    expect(o.progress.levelIndex).toBe(1);
    expect(o.progress.masteredInARow).toBe(0);
    expect(o.progress.history).toHaveLength(2);
  });

  it('resets the streak when a sheet is not mastered', () => {
    let o = applyResult(newProgress(), pass());
    o = applyResult(o.progress, fail());
    expect(o.progress.masteredInARow).toBe(0);
    o = applyResult(o.progress, pass());
    expect(o.advanced).toBe(false);
  });

  it('review sheets of past levels do not move progress', () => {
    const p = { ...newProgress(), levelIndex: 3 };
    const o = applyResult(p, pass());
    expect(o.progress.levelIndex).toBe(3);
    expect(o.progress.masteredInARow).toBe(0);
    expect(o.progress.history).toHaveLength(1);
  });

  it('completes the course on the last level', () => {
    const last = LEVELS[LEVELS.length - 1];
    const r = evaluateSheet(last, 10, 10, 1);
    let o = applyResult({ ...newProgress(), levelIndex: LEVELS.length - 1 }, r);
    o = applyResult(o.progress, r);
    expect(o.completedCourse).toBe(true);
    expect(o.progress.levelIndex).toBe(LEVELS.length - 1);
  });
});

describe('placementStartIndex', () => {
  it('starts at the beginning when nothing was passed', () => {
    expect(placementStartIndex(0)).toBe(0);
  });
  it('starts at the last milestone passed', () => {
    expect(LEVELS[placementStartIndex(1)].id).toBe(PLACEMENT_CHECKPOINTS[0]);
    expect(LEVELS[placementStartIndex(PLACEMENT_CHECKPOINTS.length)].id).toBe('E3');
  });
  it('every checkpoint exists in the curriculum', () => {
    for (const id of PLACEMENT_CHECKPOINTS) expect(LEVELS.some((l) => l.id === id), id).toBe(true);
  });
});

describe('dayStreak', () => {
  const at = (iso: string) => ({ ...evaluateSheet(A1, 10, 10, 1), finishedAt: new Date(iso).toISOString() });
  it('counts consecutive days ending today or yesterday', () => {
    const today = new Date('2026-11-14T15:00:00');
    expect(dayStreak([at('2026-11-12T10:00:00'), at('2026-11-13T10:00:00'), at('2026-11-14T09:00:00')], today)).toBe(3);
    expect(dayStreak([at('2026-11-12T10:00:00'), at('2026-11-13T10:00:00')], today)).toBe(2);
    expect(dayStreak([at('2026-11-10T10:00:00')], today)).toBe(0);
  });
});
