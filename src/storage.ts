import { type Progress, newProgress } from './mastery';

export type Profile = {
  id: string;
  name: string;
  createdAt: string;
  progress: Progress;
};

export type Store = {
  profiles: Profile[];
  activeId: string | null;
};

const KEY = 'degrau:v1';

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { profiles: [], activeId: null };
    const parsed = JSON.parse(raw) as Store;
    return {
      activeId: parsed.activeId ?? null,
      profiles: (parsed.profiles ?? []).map((p) => ({ ...p, progress: { ...newProgress(), ...p.progress } })),
    };
  } catch {
    return { profiles: [], activeId: null };
  }
}

export function saveStore(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage can be blocked (private mode); the session still works in memory.
  }
}

export function createProfile(name: string): Profile {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, name: name.trim(), createdAt: new Date().toISOString(), progress: newProgress() };
}
