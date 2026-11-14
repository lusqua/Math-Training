import { useState } from 'react';
import { LEVELS } from '../curriculum';
import type { Profile } from '../storage';

type Props = {
  profiles: Profile[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
};

export function Profiles({ profiles, onSelect, onCreate, onDelete }: Props) {
  const [name, setName] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <section className="profiles">
      <div className="hero">
        <h1>Degrau</h1>
        <p className="lead">
          Matemática do jeito que funciona: folhas curtas todo dia, um passo de cada vez, e só sobe de nível quando
          domina o atual.
        </p>
      </div>

      {profiles.length > 0 && (
        <div className="card">
          <h2>Quem vai treinar?</h2>
          <ul className="profile-list">
            {profiles.map((p) => (
              <li key={p.id}>
                <button type="button" className="profile" onClick={() => onSelect(p.id)}>
                  <span className="avatar" aria-hidden>
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="profile-name">{p.name}</span>
                  <span className="muted">
                    {p.progress.placed ? `Nível ${LEVELS[p.progress.levelIndex].id}` : 'Ainda sem nível'}
                  </span>
                </button>
                {confirming === p.id ? (
                  <span className="confirm">
                    Apagar todo o progresso?{' '}
                    <button type="button" className="danger" onClick={() => onDelete(p.id)}>
                      Apagar
                    </button>{' '}
                    <button type="button" className="ghost" onClick={() => setConfirming(null)}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="ghost small"
                    aria-label={`Remover ${p.name}`}
                    onClick={() => setConfirming(p.id)}
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        className="card new-profile"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name);
          setName('');
        }}
      >
        <h2>{profiles.length ? 'Novo perfil' : 'Comece por aqui'}</h2>
        <label htmlFor="name">Como você quer ser chamado?</label>
        <div className="row">
          <input id="name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          <button type="submit" className="primary" disabled={!name.trim()}>
            Criar
          </button>
        </div>
        <p className="muted small-text">O progresso fica salvo neste navegador.</p>
      </form>
    </section>
  );
}
