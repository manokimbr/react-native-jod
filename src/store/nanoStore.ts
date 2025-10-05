// Minimal global store with selective subscriptions (no deps)
import { useSyncExternalStore, useRef, useEffect } from 'react';

type Listener = () => void;
type PartialOrUpdater<T> = Partial<T> | ((prev: T) => Partial<T>);

export function createStore<T extends object>(initial: T) {
  let state: T = initial;
  const listeners = new Set<Listener>();

  function getState() {
    return state;
  }

  function setState(patch: PartialOrUpdater<T>) {
    const nextPartial = typeof patch === 'function' ? patch(state) : patch;
    if (!nextPartial) return;
    const next = { ...state, ...nextPartial } as T;

    // shallow compare to avoid needless updates
    let changed = false;
    for (const k in next) {
      if ((next as any)[k] !== (state as any)[k]) { changed = true; break; }
    }
    if (!changed) return;

    state = next;
    listeners.forEach(l => l());
  }

  function subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  }

  // Selective subscription hook
  function useStore<U>(selector: (s: T) => U): U {
    // keep last selected value to compare cheaply
    const selectedRef = useRef<U>(selector(state));

    return useSyncExternalStore(
      subscribe,
      () => {
        const sel = selector(state);
        // simple referential check; if you need deep, memo upstream
        if (sel !== selectedRef.current) selectedRef.current = sel;
        return selectedRef.current;
      },
      () => selector(initial)
    );
  }

  return { getState, setState, subscribe, useStore };
}
