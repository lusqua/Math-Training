import { useEffect, useMemo, useState } from 'react';
import { LEVELS, generateSheet, levelIndexById } from './curriculum';
import { SHEET_SIZE, type Outcome, type SheetResult, applyResult, evaluateSheet, standardSeconds } from './mastery';
import { type Profile, type Store, createProfile, loadStore, saveStore } from './storage';
import { Profiles } from './components/Profiles';
import { Dashboard } from './components/Dashboard';
import { Placement } from './components/Placement';
import { SheetRunner } from './components/SheetRunner';
import { Result } from './components/Result';

type Screen =
  | { name: 'home' }
  | { name: 'placement' }
  | { name: 'sheet'; levelIndex: number; run: number }
  | { name: 'result'; result: SheetResult; outcome: Outcome };

export function App() {
  const [store, setStore] = useState<Store>(loadStore);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => saveStore(store), [store]);

  const profile = store.profiles.find((p) => p.id === store.activeId) ?? null;

  function updateProfile(next: Profile) {
    setStore((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === next.id ? next : p)) }));
  }

  function startSheet(levelIndex: number) {
    setScreen({ name: 'sheet', levelIndex, run: Date.now() });
  }

  if (!profile) {
    return (
      <Shell>
        <Profiles
          profiles={store.profiles}
          onSelect={(id) => setStore((s) => ({ ...s, activeId: id }))}
          onCreate={(name) => {
            const p = createProfile(name);
            setStore((s) => ({ profiles: [...s.profiles, p], activeId: p.id }));
            setScreen({ name: 'home' });
          }}
          onDelete={(id) =>
            setStore((s) => ({
              profiles: s.profiles.filter((p) => p.id !== id),
              activeId: s.activeId === id ? null : s.activeId,
            }))
          }
        />
      </Shell>
    );
  }

  const home = () => setScreen({ name: 'home' });

  switch (screen.name) {
    case 'placement':
      return (
        <Shell>
          <Placement
            onQuit={home}
            onPlaced={(levelIndex) => {
              updateProfile({
                ...profile,
                progress: { ...profile.progress, placed: true, levelIndex, masteredInARow: 0, completedCourse: false },
              });
              home();
            }}
          />
        </Shell>
      );

    case 'sheet':
      return (
        <Shell>
          <Sheet
            key={screen.run}
            levelIndex={screen.levelIndex}
            onQuit={home}
            onDone={(result) => {
              const outcome = applyResult(profile.progress, result);
              updateProfile({ ...profile, progress: outcome.progress });
              setScreen({ name: 'result', result, outcome });
            }}
          />
        </Shell>
      );

    case 'result': {
      const { result, outcome } = screen;
      const nextLevel = outcome.advanced ? outcome.progress.levelIndex : levelIndexById(result.levelId);
      return (
        <Shell>
          <Result result={result} outcome={outcome} onHome={home} onNext={() => startSheet(nextLevel)} />
        </Shell>
      );
    }

    default:
      return (
        <Shell>
          <Dashboard
            profile={profile}
            onPractice={startSheet}
            onPlacement={() => setScreen({ name: 'placement' })}
            onStartFromZero={() =>
              updateProfile({ ...profile, progress: { ...profile.progress, placed: true, levelIndex: 0 } })
            }
            onSwitchProfile={() => setStore((s) => ({ ...s, activeId: null }))}
          />
        </Shell>
      );
  }
}

function Sheet({
  levelIndex,
  onDone,
  onQuit,
}: {
  levelIndex: number;
  onDone: (r: SheetResult) => void;
  onQuit: () => void;
}) {
  const level = LEVELS[levelIndex];
  const problems = useMemo(() => generateSheet(level, SHEET_SIZE, Math.random), [level]);
  return (
    <SheetRunner
      level={level}
      problems={problems}
      targetSeconds={standardSeconds(level, problems.length)}
      correction
      heading={level.title}
      onQuit={onQuit}
      onDone={(correct, seconds) => onDone(evaluateSheet(level, correct, problems.length, seconds))}
    />
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="shell">{children}</main>;
}
