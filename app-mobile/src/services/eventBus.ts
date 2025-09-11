// src/services/eventBus.ts
export type Unsubscribe = () => void;

export function createBus<T>() {
  const listeners = new Set<(payload: T) => void>();

  return {
    emit(payload: T) {
      listeners.forEach((fn) => fn(payload));
    },
    subscribe(fn: (payload: T) => void): Unsubscribe {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
