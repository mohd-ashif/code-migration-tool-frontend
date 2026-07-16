import { useState, useEffect } from 'react';

export type StateCreator<T> = (
  set: (nextState: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T
) => T;

export function createStore<T>(creator: StateCreator<T>) {
  let state: T;
  const listeners = new Set<(state: T) => void>();

  const getState = () => state;
  const setState = (nextState: Partial<T> | ((state: T) => Partial<T>)) => {
    const next = typeof nextState === 'function' ? (nextState as any)(state) : nextState;
    state = { ...state, ...next };
    listeners.forEach((l) => l(state));
  };

  state = creator(setState, getState);

  const subscribe = (listener: (state: T) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const useStore = <U>(selector: (state: T) => U): U => {
    const [slice, setSlice] = useState(() => selector(state));

    useEffect(() => {
      const unsubscribe = subscribe((nextState) => {
        setSlice(selector(nextState));
      });
      return unsubscribe;
    }, [selector]);

    return slice;
  };

  return { getState, setState, subscribe, useStore };
}
