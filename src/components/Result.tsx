import { LEVELS, levelIndexById } from '../curriculum';
import { MAX_ERRORS, SHEETS_TO_ADVANCE, type Outcome, type SheetResult } from '../mastery';
import { formatTime } from '../format';

type Props = {
  result: SheetResult;
  outcome: Outcome;
  onNext: () => void;
  onHome: () => void;
};

export function Result({ result, outcome, onNext, onHome }: Props) {
  const level = LEVELS[levelIndexById(result.levelId)];
  const errors = result.total - result.correctFirstTry;
  const inTime = result.seconds <= result.standardSeconds;
  const next = LEVELS[outcome.progress.levelIndex];
  const isReview = !outcome.advanced && levelIndexById(result.levelId) !== outcome.progress.levelIndex;

  let headline: string;
  if (outcome.completedCourse) headline = 'Trilha concluída!';
  else if (outcome.advanced) headline = `Subiu de nível: ${next.id}`;
  else if (result.mastered) headline = 'Folha dominada';
  else headline = 'Vamos repetir este nível';

  return (
    <section className="result">
      <div className={`card highlight${result.mastered ? ' good' : ''}`}>
        <p className="eyebrow">
          <span className="tag">{level.id}</span> {level.title}
        </p>
        <h1>{headline}</h1>
        {outcome.advanced && (
          <p>
            Próximo: <strong>{next.title}</strong>. {next.description}
          </p>
        )}

        <div className="stats">
          <div className={`stat${errors <= MAX_ERRORS ? ' ok' : ' bad'}`}>
            <span className="stat-value">
              {result.correctFirstTry}/{result.total}
            </span>
            <span className="stat-label">de primeira</span>
          </div>
          <div className={`stat${inTime ? ' ok' : ' bad'}`}>
            <span className="stat-value">{formatTime(result.seconds)}</span>
            <span className="stat-label">padrão {formatTime(result.standardSeconds)}</span>
          </div>
        </div>

        {!result.mastered && (
          <p>
            {errors > MAX_ERRORS && `Foram ${errors} erros de primeira (o limite é ${MAX_ERRORS}). `}
            {!inTime && 'Passou do tempo padrão. '}
            Repetir até ficar automático é o que faz a próxima etapa ficar fácil.
          </p>
        )}
        {result.mastered && !outcome.advanced && !outcome.completedCourse && !isReview && (
          <p>
            Falta {SHEETS_TO_ADVANCE - outcome.progress.masteredInARow}{' '}
            {SHEETS_TO_ADVANCE - outcome.progress.masteredInARow === 1 ? 'folha dominada' : 'folhas dominadas'} seguida
            pra subir de nível.
          </p>
        )}
        {isReview && <p className="muted">Folha de revisão: não muda seu nível atual.</p>}

        <div className="row wrap">
          <button type="button" className="primary" onClick={onNext} autoFocus>
            Próxima folha
          </button>
          <button type="button" className="ghost" onClick={onHome}>
            Voltar ao início
          </button>
        </div>
      </div>
    </section>
  );
}
