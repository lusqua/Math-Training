import { useEffect, useState } from 'react';
import type { Level, Problem } from '../curriculum';
import { AnswerForm } from './AnswerForm';
import { formatTime } from '../format';

type Mark = 'pending' | 'right' | 'wrong' | 'fixed';

type Props = {
  level: Level;
  problems: Problem[];
  /** Target time in seconds, shown next to the clock. */
  targetSeconds: number;
  /** When true, wrong answers come back at the end until the learner gets them right. */
  correction: boolean;
  heading: string;
  onDone: (correctFirstTry: number, seconds: number) => void;
  onQuit: () => void;
};

/** Reveal the answer after this many wrong attempts during correction. */
const REVEAL_AFTER = 2;

export function SheetRunner({ level, problems, targetSeconds, correction, heading, onDone, onQuit }: Props) {
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<Mark[]>(() => problems.map(() => 'pending'));
  const [given, setGiven] = useState<(number | null)[]>(() => problems.map(() => null));
  const [phase, setPhase] = useState<'work' | 'fix'>('work');
  const [queue, setQueue] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [flash, setFlash] = useState<'right' | 'wrong' | null>(null);

  useEffect(() => {
    if (phase !== 'work') return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 350);
    return () => clearTimeout(t);
  }, [flash]);

  const elapsed = phase === 'work' ? Math.floor((now - startedAt) / 1000) : seconds;
  const current = phase === 'work' ? index : queue[0];
  const problem = problems[current];

  function submitWork(value: number) {
    const right = value === problem.answer;
    const nextMarks = marks.map((m, i) => (i === index ? (right ? 'right' : 'wrong') : m)) as Mark[];
    setMarks(nextMarks);
    setGiven(given.map((g, i) => (i === index ? value : g)));
    setFlash(right ? 'right' : 'wrong');
    if (index < problems.length - 1) {
      setIndex(index + 1);
      return;
    }
    const total = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const correct = nextMarks.filter((m) => m === 'right').length;
    const wrong = nextMarks.flatMap((m, i) => (m === 'wrong' ? [i] : []));
    if (!correction || wrong.length === 0) {
      onDone(correct, total);
      return;
    }
    setSeconds(total);
    setQueue(wrong);
    setPhase('fix');
  }

  function submitFix(value: number) {
    if (value !== problem.answer) {
      setAttempts(attempts + 1);
      setGiven(given.map((g, i) => (i === current ? value : g)));
      setFlash('wrong');
      return;
    }
    setFlash('right');
    setMarks(marks.map((m, i) => (i === current ? 'fixed' : m)));
    setAttempts(0);
    const rest = queue.slice(1);
    if (rest.length === 0) {
      onDone(marks.filter((m) => m === 'right').length, seconds);
      return;
    }
    setQueue(rest);
  }

  const over = elapsed > targetSeconds;

  return (
    <section className="sheet">
      <header className="sheet-head">
        <button type="button" className="ghost" onClick={onQuit}>
          ← Sair
        </button>
        <div className="sheet-title">
          <span className="tag">{level.id}</span> {heading}
        </div>
        <div className={`clock${over ? ' over' : ''}`} title="Tempo da primeira passada / tempo padrão">
          {formatTime(elapsed)} <span className="muted">/ {formatTime(targetSeconds)}</span>
        </div>
      </header>

      <ol className="dots" aria-label="Progresso da folha">
        {marks.map((m, i) => (
          <li key={i} className={`dot ${m}${i === current ? ' current' : ''}`} />
        ))}
      </ol>

      {phase === 'fix' && (
        <div className="fix-banner">
          Correção: refaça {queue.length === 1 ? 'a conta que errou' : `as ${queue.length} contas que errou`}. O
          tempo já parou.
        </div>
      )}

      <div className={`problem${flash ? ` flash-${flash}` : ''}`} aria-live="polite">
        {problem.prompt}
      </div>

      {phase === 'fix' && (
        <p className="hint">
          Você respondeu <strong>{given[current]}</strong>.
          {attempts >= REVEAL_AFTER && (
            <>
              {' '}
              A resposta é <strong>{problem.answer}</strong>. Digite pra continuar.
            </>
          )}
        </p>
      )}

      <AnswerForm
        problemKey={`${phase}-${current}`}
        label={level.answerLabel}
        allowNegative={level.allowNegative}
        onSubmit={phase === 'work' ? submitWork : submitFix}
      />

      <p className="counter muted">
        {phase === 'work' ? `Conta ${index + 1} de ${problems.length}` : `Faltam ${queue.length} pra corrigir`}
      </p>
    </section>
  );
}
