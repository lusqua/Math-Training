import { LEVELS } from '../curriculum';
import { MAX_ERRORS, SHEETS_TO_ADVANCE, SHEET_SIZE, dayStreak, sheetsToday, standardSeconds } from '../mastery';
import type { Profile } from '../storage';
import { formatDate, formatTime } from '../format';

type Props = {
  profile: Profile;
  onPractice: (levelIndex: number) => void;
  onPlacement: () => void;
  onStartFromZero: () => void;
  onSwitchProfile: () => void;
};

const stages = [...new Set(LEVELS.map((l) => l.stage))];

export function Dashboard({ profile, onPractice, onPlacement, onStartFromZero, onSwitchProfile }: Props) {
  const { progress } = profile;
  const level = LEVELS[progress.levelIndex];
  const streak = dayStreak(progress.history);
  const today = sheetsToday(progress.history);
  const recent = [...progress.history].reverse().slice(0, 8);

  return (
    <section className="dashboard">
      <header className="top">
        <div>
          <p className="muted">Olá,</p>
          <h1>{profile.name}</h1>
        </div>
        <button type="button" className="ghost" onClick={onSwitchProfile}>
          Trocar perfil
        </button>
      </header>

      {!progress.placed ? (
        <div className="card highlight">
          <h2>Vamos achar seu ponto de partida</h2>
          <p>
            O teste de nivelamento traz poucas contas de cada etapa e para assim que algo ficar difícil. Você começa
            no último ponto em que foi bem: fácil de propósito, pra pegar ritmo.
          </p>
          <div className="row wrap">
            <button type="button" className="primary" onClick={onPlacement}>
              Fazer o nivelamento
            </button>
            <button type="button" className="ghost" onClick={onStartFromZero}>
              Começar do início
            </button>
          </div>
        </div>
      ) : (
        <div className="card highlight">
          <p className="eyebrow">
            {level.stage} · nível {progress.levelIndex + 1} de {LEVELS.length}
          </p>
          <h2>
            <span className="tag">{level.id}</span> {level.title}
          </h2>
          <p>{level.description}</p>
          {progress.completedCourse ? (
            <p className="success">Você concluiu a trilha inteira. Pode continuar treinando qualquer nível.</p>
          ) : (
            <p className="muted">
              Folhas dominadas seguidas: <strong>{progress.masteredInARow}</strong> de {SHEETS_TO_ADVANCE} · tempo
              padrão {formatTime(standardSeconds(level, SHEET_SIZE))}
            </p>
          )}
          <button type="button" className="primary big" onClick={() => onPractice(progress.levelIndex)}>
            {today === 0 ? 'Fazer a folha de hoje' : 'Fazer mais uma folha'}
          </button>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <span className="stat-value">{streak}</span>
          <span className="stat-label">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{today}</span>
          <span className="stat-label">{today === 1 ? 'folha hoje' : 'folhas hoje'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{progress.history.length}</span>
          <span className="stat-label">folhas no total</span>
        </div>
      </div>

      <div className="card">
        <h2>Trilha</h2>
        <p className="muted small-text">Níveis já dominados ficam liberados pra revisão.</p>
        {stages.map((stage) => (
          <div key={stage} className="stage">
            <h3>{stage}</h3>
            <ul className="track">
              {LEVELS.map((l, i) =>
                l.stage !== stage ? null : (
                  <li key={l.id}>
                    <button
                      type="button"
                      className={`step ${
                        i < progress.levelIndex || (progress.completedCourse && i === progress.levelIndex)
                          ? 'done'
                          : i === progress.levelIndex && progress.placed
                            ? 'current'
                            : 'locked'
                      }`}
                      disabled={!progress.placed || i > progress.levelIndex}
                      onClick={() => onPractice(i)}
                      title={`${l.id} · ${l.title}`}
                    >
                      <span className="step-id">{l.id}</span>
                      <span className="step-title">{l.title}</span>
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="card">
          <h2>Últimas folhas</h2>
          <table className="history">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Nível</th>
                <th>Acertos</th>
                <th>Tempo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recent.map((h) => (
                <tr key={h.finishedAt}>
                  <td>{formatDate(h.finishedAt)}</td>
                  <td>
                    <span className="tag">{h.levelId}</span>
                  </td>
                  <td>
                    {h.correctFirstTry}/{h.total}
                  </td>
                  <td className={h.seconds > h.standardSeconds ? 'over' : undefined}>
                    {formatTime(h.seconds)}
                  </td>
                  <td>{h.mastered ? <span className="pill ok">dominada</span> : <span className="pill">repetir</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="card rules">
        <summary>Como funciona</summary>
        <ul>
          <li>Cada folha tem {SHEET_SIZE} contas e um tempo padrão. Faça todo dia, de preferência mais de uma.</li>
          <li>
            Uma folha é <strong>dominada</strong> quando você erra no máximo {MAX_ERRORS} conta de primeira e termina
            dentro do tempo padrão.
          </li>
          <li>
            Depois de {SHEETS_TO_ADVANCE} folhas dominadas seguidas, você sobe de nível. Se não dominar, repete o
            nível: a repetição é o método, não castigo.
          </li>
          <li>As contas erradas voltam no fim da folha pra você corrigir. A correção não conta no tempo.</li>
        </ul>
      </details>

      {progress.placed && (
        <p className="footer-actions">
          <button type="button" className="ghost small" onClick={onPlacement}>
            Refazer o nivelamento
          </button>
        </p>
      )}
    </section>
  );
}
