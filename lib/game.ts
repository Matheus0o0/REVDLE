import { cars, carById, type Car, type Aspiration } from './cars';

export { carById };

export const POINTS_CORRECT = 100;
export const ROUNDS_PRACTICE = 5;
export const ROUNDS_DAILY = 1;

// mulberry32 — deterministic, no deps
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function comboMultiplier(streak: number): number {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function dailyDateString(tz = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

// Cars eligible for aspiration mode (NA, Turbo, Twin-Turbo — not Supercharged)
export const aspirationEligible = cars.filter(
  (c) => c.engine.aspiration !== 'Supercharged'
);

export function normalizeAspiration(a: Aspiration): 'NA' | 'Turbo' | null {
  if (a === 'NA') return 'NA';
  if (a === 'Turbo' || a === 'Twin-Turbo') return 'Turbo';
  return null;
}

export type GuessQuestion = {
  type: 'guess';
  correctId: string;
  distractorId: string;
  correctPosition: 0 | 1;
};

export type AspirationQuestion = {
  type: 'aspiration';
  carId: string;
  answer: 'NA' | 'Turbo';
};

export type Question = GuessQuestion | AspirationQuestion;

export type Session = {
  mode: 'guess' | 'aspiration' | 'daily';
  questions: Question[];
  dateStr?: string;
};

function makeGuessQuestion(
  correctId: string,
  pool: Car[],
  rand: () => number,
  usedDistractors: Set<string>
): GuessQuestion {
  const available = pool.filter((c) => c.id !== correctId && !usedDistractors.has(c.id));
  const distractor = available[Math.floor(rand() * available.length)];
  usedDistractors.add(distractor.id);
  return {
    type: 'guess',
    correctId,
    distractorId: distractor.id,
    correctPosition: rand() < 0.5 ? 0 : 1,
  };
}

export function generateGuessSession(rand: () => number = Math.random): Session {
  const selected = shuffle(cars, rand).slice(0, ROUNDS_PRACTICE);
  const usedDistractors = new Set<string>();
  return {
    mode: 'guess',
    questions: selected.map((c) => makeGuessQuestion(c.id, cars, rand, usedDistractors)),
  };
}

export function generateAspirationSession(rand: () => number = Math.random): Session {
  const selected = shuffle(aspirationEligible, rand).slice(0, ROUNDS_PRACTICE);
  return {
    mode: 'aspiration',
    questions: selected.map((c) => ({
      type: 'aspiration' as const,
      carId: c.id,
      answer: normalizeAspiration(c.engine.aspiration) as 'NA' | 'Turbo',
    })),
  };
}

export function generateDailyChallenge(tz = 'America/Sao_Paulo'): Session {
  const dateStr = dailyDateString(tz);
  return generateChallengeForDate(dateStr, 'daily');
}

// Correct car is seeded by date (deterministic); distractor is random each play.
export function generateChallengeForDate(dateStr: string, mode: 'daily' | 'archive' = 'archive'): Session {
  const seed = parseInt(dateStr.replace(/-/g, ''), 10);
  const seededRand = mulberry32(seed);
  const [correct] = shuffle(cars, seededRand);
  const usedDistractors = new Set<string>();
  const question = makeGuessQuestion(correct.id, cars, Math.random, usedDistractors);
  return { mode, questions: [question], dateStr };
}

export type ScoreResult = {
  total: number;
  correct: number;
  bestCombo: number;
  breakdown: Array<{ pts: number; combo: number }>;
};

export function computeScore(answers: boolean[]): ScoreResult {
  let streak = 0;
  let bestCombo = 0;
  let total = 0;
  const breakdown: Array<{ pts: number; combo: number }> = [];

  for (const correct of answers) {
    if (correct) {
      streak++;
      bestCombo = Math.max(bestCombo, streak);
      const pts = Math.round(POINTS_CORRECT * comboMultiplier(streak));
      total += pts;
      breakdown.push({ pts, combo: streak });
    } else {
      streak = 0;
      breakdown.push({ pts: 0, combo: 0 });
    }
  }

  return { total, correct: answers.filter(Boolean).length, bestCombo, breakdown };
}

export function makeShareText(result: ScoreResult, total: number, dateStr?: string): string {
  const squares = result.breakdown.map((b) => (b.pts > 0 ? '🟥' : '⬜')).join('');
  const header = dateStr ? `REVDLE — Desafio ${dateStr}` : 'REVDLE';
  return `${header}\n${result.correct}/${total} | melhor combo: ${result.bestCombo}\n${squares}`;
}
