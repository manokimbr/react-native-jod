# 💾 Nano Store — Step‑by‑Step, Plain‑English Guide

*A tiny, dependency‑free global state for React/React Native.*  
Think of it as: **one state object + subscribers + a tiny React hook**.  
No Context. No Redux. No magic.

---

## 1) What it does (two sentences)
- Keeps a **single source of truth** (a plain object) and lets components **subscribe to just the part they need**.
- When you call **`setState`**, it **immutably** creates a new object, **notifies subscribers**, and React re‑renders only what changed.

---

## 2) The public contract (“interface mindset”)
This is what callers see. If you’re a C# dev, imagine this as `IStore<T>`.

```ts
type IStore<T> = {
  getState(): T;                                            // read current snapshot
  setState(patch: Partial<T> | ((prev: T) => Partial<T>)): void; // immutable update
  subscribe(listener: () => void): () => void;              // observe changes (returns unsubscribe)
  useStore<U>(selector: (s: T) => U): U;                    // React-only: subscribe to a slice
};
```

Program to this surface, not to the implementation.

---

## 3) The tiny implementation (the whole store in ~40 lines)

```ts
// Minimal global store with selective subscriptions (no deps)
import { useSyncExternalStore, useRef } from 'react';

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

    // shallow compare: bail if nothing actually changed
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

  // React adapter: subscribe to a selected slice of state
  function useStore<U>(selector: (s: T) => U): U {
    const selectedRef = useRef<U>(selector(state));
    return useSyncExternalStore(
      subscribe,
      () => {
        const sel = selector(state);
        if (sel !== selectedRef.current) selectedRef.current = sel;
        return selectedRef.current;
      },
      () => selector(initial)
    );
  }

  return { getState, setState, subscribe, useStore };
}
```

> Why this is safe in React 18+: `useSyncExternalStore` guarantees **tear‑free reads** and correct re‑rendering in concurrent mode.

---

## 4) How to declare a typed store (one minute)

```ts
// /shared/state/appStore.ts
import { createStore } from './nano-store';

export type AppState = {
  theme: 'light' | 'dark';
  user?: { id: string; name: string };
  counter: number;
};

export const appStore = createStore<AppState>({
  theme: 'dark',
  user: undefined,
  counter: 0,
});
```

- **Typed** from end to end.
- You can create more stores (authStore, uiStore, settingsStore) the same way.

---

## 5) How components use it (read + update)

```tsx
// Read a slice (re-renders only if that slice changes)
const theme = appStore.useStore(s => s.theme);

// Update immutably
appStore.setState({ theme: 'light' });

// Functional update (read previous state)
appStore.setState(prev => ({ counter: prev.counter + 1 }));

// Update nested objects (copy the branch you change)
appStore.setState(prev => ({
  user: prev.user ? { ...prev.user, name: 'Kim' } : { id: '1', name: 'Kim' }
}));
```

> **Rule of thumb:** return **primitives or memoized values** from selectors to avoid extra renders.

---

## 6) What actually happens (step‑by‑step)

**On subscribe (component mount):**
1. Your component calls `useStore(selector)`.
2. React registers a listener via `subscribe`.
3. The component reads the selected slice (`selector(state)`) and renders.

**On update (`setState`):**
1. Build `nextPartial` (object or result of a function).
2. Create a **new** object: `next = { ...state, ...nextPartial }`.
3. Run a quick **shallow compare** to skip no‑ops.
4. Replace `state` with `next` and **notify** all listeners.
5. React re-renders subscribers; each recalculates `selector(state)`.
6. Components whose **selected value changed by reference** re-render; others don’t.

That’s the whole lifecycle.

---

## 7) For C# developers (mental map)

- Treat the store as an **interface** (`IStore<T>`). You can swap the implementation as long as the surface stays the same (LSP/DIP).
- `subscribe` + returned disposer feels like **event handlers** / **`IDisposable`**.
- `setState` returns a **new record‑like object** (think C# 9 records with `with { }`), making change detection trivial.
- `useStore(selector)` is like **LINQ projection** over an observable source — UI only watches the fields it needs.

If you know events and records, you already understand this pattern.

---

## 8) Parallels with Vue 3 + Pinia (quick table)

| Concept | Pinia (Vue 3) | Nano Store (React/Native) |
|---|---|---|
| Define store | `defineStore()` with state/getters/actions | `createStore()` returning `get/set/subscribe/useStore` |
| Reactivity | Proxy-based; computed/refs update automatically | Explicit subscriptions via `useSyncExternalStore` |
| Read slices | `computed(() => store.x)` | `useStore(s => s.x)` |
| Update | call actions or assign state | `setState({ x: 1 })` or `setState(p => ({ x: p.x + 1 }))` |
| Tooling | Vue DevTools | React DevTools (and your own logs) |

Different runtime, **same architecture spirit**: small store modules, clear reads, explicit updates.

---

## 9) Common pitfalls (and how to avoid them)

### A) **Selectors that create new objects**
```ts
// ❌ bad: always new object → always re-render
useStore(s => ({ theme: s.theme }));

// ✅ good: return primitives or stable refs
useStore(s => s.theme);
```
If you truly need objects/arrays, **memoize them upstream** (e.g., compute once inside the store, or store them directly in state).

### B) **Forgetting to copy nested state**
```ts
// ❌ bad: mutates previous object
setState(prev => { prev.user!.name = 'Kim'; return { user: prev.user }; });

// ✅ good: copy the branch you change
setState(prev => ({ user: prev.user ? { ...prev.user, name: 'Kim' } : prev.user }));
```

### C) **Too many sequential updates**
Each `setState` notifies subscribers. If you do several in a row, you’ll trigger several renders.  
**Combine** patches into one call, or rely on React’s batching when inside event handlers.

### D) **Expecting deep equality**
The store doesn’t deep‑compare — by design (speed + simplicity).  
If you need deep checks, memoize derived data and store the memoized reference.

---

## 10) Where to put files (suggestion)

```
/shared/state/nano-store.ts    ← the implementation (factory)
/shared/state/appStore.ts      ← your concrete store(s)
/docs/nano-store.md            ← this document
```

Link it from your main `README.md`:
```md
### 💾 Nano Store
Our tiny, predictable state layer → [docs/nano-store.md](./docs/nano-store.md)
```

---

## 11) Quick tests you can copy/paste

```ts
it('updates state immutably', () => {
  const s = createStore({ n: 0 });
  s.setState({ n: 1 });
  expect(s.getState().n).toBe(1);
});

it('notifies subscribers once per call', () => {
  const s = createStore({ n: 0 });
  const fn = vi.fn();
  const un = s.subscribe(fn);
  s.setState({ n: 1 });
  expect(fn).toHaveBeenCalledTimes(1);
  un();
});

it('skips no-op updates', () => {
  const s = createStore({ n: 0 });
  const fn = vi.fn();
  const un = s.subscribe(fn);
  s.setState({});            // no actual change
  expect(fn).not.toHaveBeenCalled();
  un();
});
```

---

### TL;DR
**One object. Four methods. Zero dependencies.**  
Predictable reads, immutable updates, and selective subscriptions — in about 40 lines.