import { LEVELS, type Level, levelIndexById } from './curriculum';

/** Problems per worksheet. */
export const SHEET_SIZE = 10;
/** Mistakes (on the first try) still allowed on a mastered sheet. */
export const MAX_ERRORS = 1;
/** Mastered sheets in a row needed to move up a level. */
export const SHEETS_TO_ADVANCE = 2;

/** Placement test: a few problems from milestone levels, stopping at the first one that is not solid. */
export const PLACEMENT_CHECKPOINTS = ['A3', 'A4', 'B2', 'B4', 'B6', 'C3', 'C4', 'C6', 'D1', 'D3', 'E3'];
export const PLACEMENT_PROBLEMS = 3;
/** Placement is a bit more forgiving on time than a regular sheet. */
export const PLACEMENT_TIME_FACTOR = 1.5;

export type SheetResult = {
  levelId: string;
  finishedAt: string;
  correctFirstTry: number;
  total: number;
  seconds: number;
  standardSeconds: number;
  mastered: boolean;
};

export type Progress = {
  placed: boolean;
  levelIndex: number;
  masteredInARow: number;
  completedCourse: boolean;
  history: SheetResult[];
};

export const newProgress = (): Progress => ({
  placed: false,
  levelIndex: 0,
  masteredInARow: 0,
  completedCourse: false,
  history: [],
});

export const standardSeconds = (level: Level, total: number) => level.secondsPerProblem * total;

export function evaluateSheet(
  level: Level,
  correctFirstTry: number,
  total: number,
  seconds: number,
  now: Date = new Date(),
): SheetResult {
  const target = standardSeconds(level, total);
  return {
    levelId: level.id,
    finishedAt: now.toISOString(),
    correctFirstTry,
    total,
    seconds,
    standardSeconds: target,
    mastered: total - correctFirstTry <= MAX_ERRORS && seconds <= target,
  };
}

export type Outcome = {
  progress: Progress;
  advanced: boolean;
  completedCourse: boolean;
};

/**
 * Records a sheet. Only sheets of the current level count towards advancing;
 * a sheet that is not mastered resets the streak (the learner repeats the level).
 */
export function applyResult(progress: Progress, result: SheetResult): Outcome {
  const history = [...progress.history, result];
  const sheetLevel = levelIndexById(result.levelId);
  if (sheetLevel !== progress.levelIndex || progress.completedCourse) {
    return { progress: { ...progress, history }, advanced: false, completedCourse: false };
  }
  if (!result.mastered) {
    return { progress: { ...progress, history, masteredInARow: 0 }, advanced: false, completedCourse: false };
  }
  const inARow = progress.masteredInARow + 1;
  if (inARow < SHEETS_TO_ADVANCE) {
    return { progress: { ...progress, history, masteredInARow: inARow }, advanced: false, completedCourse: false };
  }
  if (progress.levelIndex >= LEVELS.length - 1) {
    return {
      progress: { ...progress, history, masteredInARow: 0, completedCourse: true },
      advanced: false,
      completedCourse: true,
    };
  }
  return {
    progress: { ...progress, history, masteredInARow: 0, levelIndex: progress.levelIndex + 1 },
    advanced: true,
    completedCourse: false,
  };
}

export function placementTimeLimit(level: Level): number {
  return standardSeconds(level, PLACEMENT_PROBLEMS) * PLACEMENT_TIME_FACTOR;
}

/**
 * Starting level after the placement test. Like the original method, the learner
 * starts at the last milestone they handled comfortably, not at the edge of their ability.
 */
export function placementStartIndex(passedCheckpoints: number): number {
  if (passedCheckpoints <= 0) return 0;
  const id = PLACEMENT_CHECKPOINTS[Math.min(passedCheckpoints, PLACEMENT_CHECKPOINTS.length) - 1];
  return levelIndexById(id);
}

export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Consecutive days with at least one sheet, ending today (or yesterday, if today is still open). */
export function dayStreak(history: SheetResult[], today: Date = new Date()): number {
  const days = new Set(history.map((h) => dayKey(new Date(h.finishedAt))));
  const cursor = new Date(today);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const sheetsToday = (history: SheetResult[], today: Date = new Date()) =>
  history.filter((h) => dayKey(new Date(h.finishedAt)) === dayKey(today)).length;
