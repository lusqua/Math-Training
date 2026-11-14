import { type Rng, int, pick, signed } from './rng';

export type Problem = {
  prompt: string;
  answer: number;
};

export type Level = {
  id: string;
  stage: string;
  title: string;
  description: string;
  /** Standard time per problem, in seconds. A sheet's target time is this × number of problems. */
  secondsPerProblem: number;
  /** Label shown before the answer field (e.g. "x ="). */
  answerLabel?: string;
  /** Whether answers can be negative (affects the mobile keyboard). */
  allowNegative?: boolean;
  generate: (rng: Rng) => Problem;
};

const MINUS = '−';
const show = (n: number) => (n < 0 ? `${MINUS}${-n}` : String(n));
const paren = (n: number) => (n < 0 ? `(${MINUS}${-n})` : String(n));

const add = (a: number, b: number): Problem => ({ prompt: `${a} + ${b}`, answer: a + b });
const sub = (a: number, b: number): Problem => ({ prompt: `${a} ${MINUS} ${b}`, answer: a - b });
const mul = (a: number, b: number): Problem => ({ prompt: `${a} × ${b}`, answer: a * b });
const div = (dividend: number, divisor: number): Problem => ({
  prompt: `${dividend} ÷ ${divisor}`,
  answer: dividend / divisor,
});

/** Retry a generator until it accepts a candidate. */
function until(make: () => Problem | null): Problem {
  for (let i = 0; i < 1000; i++) {
    const p = make();
    if (p) return p;
  }
  throw new Error('generator could not satisfy its constraints');
}

const units = (n: number) => n % 10;

export const LEVELS: Level[] = [
  {
    id: 'A1',
    stage: 'Adição',
    title: 'Somar 1 e 2',
    description: 'Contar pra frente de 1 em 1 e de 2 em 2.',
    secondsPerProblem: 4,
    generate: (r) => add(int(r, 1, 9), int(r, 1, 2)),
  },
  {
    id: 'A2',
    stage: 'Adição',
    title: 'Somar 3, 4 e 5',
    description: 'Somar números pequenos sem contar nos dedos.',
    secondsPerProblem: 5,
    generate: (r) => add(int(r, 1, 9), int(r, 3, 5)),
  },
  {
    id: 'A3',
    stage: 'Adição',
    title: 'Somas até 10',
    description: 'Todos os pares que dão até 10.',
    secondsPerProblem: 5,
    generate: (r) => {
      const a = int(r, 1, 9);
      return add(a, int(r, 1, 10 - a));
    },
  },
  {
    id: 'A4',
    stage: 'Adição',
    title: 'Passando da dezena',
    description: 'Somas de 1 dígito que passam de 10.',
    secondsPerProblem: 6,
    generate: (r) =>
      until(() => {
        const a = int(r, 2, 9);
        const b = int(r, 2, 9);
        return a + b > 10 ? add(a, b) : null;
      }),
  },
  {
    id: 'B1',
    stage: 'Subtração',
    title: 'Subtração até 10',
    description: 'Tirar de números até 10.',
    secondsPerProblem: 5,
    generate: (r) => {
      const a = int(r, 2, 10);
      return sub(a, int(r, 1, a));
    },
  },
  {
    id: 'B2',
    stage: 'Subtração',
    title: 'Voltando da dezena',
    description: 'Subtrair de 11 a 18 atravessando o 10.',
    secondsPerProblem: 6,
    generate: (r) =>
      until(() => {
        const a = int(r, 11, 18);
        const b = int(r, 2, 9);
        return units(a) < b ? sub(a, b) : null;
      }),
  },
  {
    id: 'B3',
    stage: 'Adição e subtração',
    title: 'Somar com 2 dígitos',
    description: 'Somas de dezenas sem "vai um".',
    secondsPerProblem: 8,
    generate: (r) =>
      until(() => {
        const a = int(r, 10, 89);
        const b = int(r, 10, 89);
        return units(a) + units(b) < 10 && a + b < 100 ? add(a, b) : null;
      }),
  },
  {
    id: 'B4',
    stage: 'Adição e subtração',
    title: 'Somar com "vai um"',
    description: 'Somas de 2 dígitos em que as unidades passam de 10.',
    secondsPerProblem: 10,
    generate: (r) =>
      until(() => {
        const a = int(r, 10, 89);
        const b = int(r, 10, 89);
        return units(a) + units(b) >= 10 ? add(a, b) : null;
      }),
  },
  {
    id: 'B5',
    stage: 'Adição e subtração',
    title: 'Subtrair com 2 dígitos',
    description: 'Subtrações de dezenas sem empréstimo.',
    secondsPerProblem: 8,
    generate: (r) =>
      until(() => {
        const a = int(r, 20, 99);
        const b = int(r, 10, a - 1);
        return units(a) >= units(b) ? sub(a, b) : null;
      }),
  },
  {
    id: 'B6',
    stage: 'Adição e subtração',
    title: 'Subtrair com empréstimo',
    description: 'Subtrações de 2 dígitos que pedem emprestado da dezena.',
    secondsPerProblem: 12,
    generate: (r) =>
      until(() => {
        const a = int(r, 20, 99);
        const b = int(r, 10, a - 1);
        return units(a) < units(b) ? sub(a, b) : null;
      }),
  },
  {
    id: 'C1',
    stage: 'Multiplicação e divisão',
    title: 'Tabuada do 2 ao 5',
    description: 'Decorar as tabuadas mais curtas.',
    secondsPerProblem: 4,
    generate: (r) => mul(int(r, 2, 5), int(r, 1, 10)),
  },
  {
    id: 'C2',
    stage: 'Multiplicação e divisão',
    title: 'Tabuada do 6 ao 9',
    description: 'As tabuadas que mais confundem.',
    secondsPerProblem: 5,
    generate: (r) => mul(int(r, 6, 9), int(r, 1, 10)),
  },
  {
    id: 'C3',
    stage: 'Multiplicação e divisão',
    title: 'Tabuada misturada',
    description: 'Qualquer par de 2 a 9, fora de ordem.',
    secondsPerProblem: 5,
    generate: (r) => mul(int(r, 2, 9), int(r, 2, 9)),
  },
  {
    id: 'C4',
    stage: 'Multiplicação e divisão',
    title: 'Divisão pela tabuada',
    description: 'Divisões exatas que saem direto da tabuada.',
    secondsPerProblem: 6,
    generate: (r) => {
      const d = int(r, 2, 9);
      return div(d * int(r, 1, 10), d);
    },
  },
  {
    id: 'C5',
    stage: 'Multiplicação e divisão',
    title: '2 dígitos × 1 dígito',
    description: 'Multiplicar dezenas por um número de 2 a 9.',
    secondsPerProblem: 12,
    generate: (r) => mul(int(r, 12, 99), int(r, 2, 9)),
  },
  {
    id: 'C6',
    stage: 'Multiplicação e divisão',
    title: 'Divisão por 1 dígito',
    description: 'Divisões exatas de até 3 dígitos.',
    secondsPerProblem: 15,
    generate: (r) => {
      const d = int(r, 2, 9);
      return div(d * int(r, 11, 99), d);
    },
  },
  {
    id: 'C7',
    stage: 'Multiplicação e divisão',
    title: '2 dígitos × 2 dígitos',
    description: 'Multiplicação com duas linhas de conta.',
    secondsPerProblem: 40,
    generate: (r) => mul(int(r, 11, 49), int(r, 11, 19)),
  },
  {
    id: 'D1',
    stage: 'Números inteiros',
    title: 'Somar e subtrair negativos',
    description: 'Regras de sinal na adição e na subtração.',
    secondsPerProblem: 8,
    allowNegative: true,
    generate: (r) => {
      const a = signed(r, 1, 20);
      const b = signed(r, 1, 20);
      return r() < 0.5
        ? { prompt: `${show(a)} + ${paren(b)}`, answer: a + b }
        : { prompt: `${show(a)} ${MINUS} ${paren(b)}`, answer: a - b };
    },
  },
  {
    id: 'D2',
    stage: 'Números inteiros',
    title: 'Multiplicar e dividir negativos',
    description: 'Regras de sinal na multiplicação e na divisão.',
    secondsPerProblem: 8,
    allowNegative: true,
    generate: (r) => {
      if (r() < 0.5) {
        const a = signed(r, 2, 12);
        const b = signed(r, 2, 12);
        return { prompt: `${show(a)} × ${paren(b)}`, answer: a * b };
      }
      const d = signed(r, 2, 9);
      const q = signed(r, 1, 10);
      return { prompt: `${show(d * q)} ÷ ${paren(d)}`, answer: q };
    },
  },
  {
    id: 'D3',
    stage: 'Números inteiros',
    title: 'Ordem das operações',
    description: 'Multiplicação antes da soma, parênteses primeiro.',
    secondsPerProblem: 12,
    generate: (r) => {
      const form = pick(r, ['a+b*c', 'a*b-c', '(a+b)*c'] as const);
      if (form === 'a+b*c') {
        const [a, b, c] = [int(r, 1, 20), int(r, 2, 9), int(r, 2, 9)];
        return { prompt: `${a} + ${b} × ${c}`, answer: a + b * c };
      }
      if (form === 'a*b-c') {
        const [a, b] = [int(r, 2, 9), int(r, 2, 9)];
        const c = int(r, 1, a * b);
        return { prompt: `${a} × ${b} ${MINUS} ${c}`, answer: a * b - c };
      }
      const [a, b, c] = [int(r, 1, 9), int(r, 1, 9), int(r, 2, 9)];
      return { prompt: `(${a} + ${b}) × ${c}`, answer: (a + b) * c };
    },
  },
  {
    id: 'E1',
    stage: 'Equações',
    title: 'x + a = b',
    description: 'Descobrir o número que falta numa soma ou subtração.',
    secondsPerProblem: 10,
    answerLabel: 'x =',
    generate: (r) => {
      const a = int(r, 1, 20);
      if (r() < 0.5) {
        const x = int(r, 1, 30);
        return { prompt: `x + ${a} = ${x + a}`, answer: x };
      }
      const x = int(r, a + 1, a + 30);
      return { prompt: `x ${MINUS} ${a} = ${x - a}`, answer: x };
    },
  },
  {
    id: 'E2',
    stage: 'Equações',
    title: 'ax = b',
    description: 'Isolar x dividindo pelos dois lados.',
    secondsPerProblem: 10,
    answerLabel: 'x =',
    generate: (r) => {
      const a = int(r, 2, 12);
      const x = int(r, 1, 12);
      return { prompt: `${a}x = ${a * x}`, answer: x };
    },
  },
  {
    id: 'E3',
    stage: 'Equações',
    title: 'ax + b = c',
    description: 'Equação de 1º grau em dois passos.',
    secondsPerProblem: 20,
    answerLabel: 'x =',
    generate: (r) => {
      const a = int(r, 2, 9);
      const x = int(r, 1, 12);
      const b = int(r, 1, 20);
      return r() < 0.5
        ? { prompt: `${a}x + ${b} = ${a * x + b}`, answer: x }
        : { prompt: `${a}x ${MINUS} ${b} = ${show(a * x - b)}`, answer: x };
    },
  },
];

export const levelIndexById = (id: string) => LEVELS.findIndex((l) => l.id === id);

/** Builds a worksheet, avoiding repeated prompts when the level has enough variety. */
export function generateSheet(level: Level, size: number, rng: Rng): Problem[] {
  const seen = new Set<string>();
  const problems: Problem[] = [];
  let attempts = 0;
  while (problems.length < size) {
    const p = level.generate(rng);
    attempts++;
    if (seen.has(p.prompt) && attempts < size * 20) continue;
    seen.add(p.prompt);
    problems.push(p);
  }
  return problems;
}

/** Parses what the learner typed. Accepts "-" and the typographic minus. */
export function parseAnswer(raw: string): number | null {
  const s = raw.trim().replace(/[−–]/g, '-').replace(/\s+/g, '');
  return /^-?\d+$/.test(s) ? Number(s) : null;
}
