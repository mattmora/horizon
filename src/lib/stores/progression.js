// track and save game state, unlocks, etc.
import { get, writable } from 'svelte/store';
import { Engines } from './rocket';
import { TaskIds } from './research';

const initial = {
  departed: false,
  unlocks: {
    [Engines.COMBUSTION]: true,
    [TaskIds.FUEL_COLLECTION]: true,
  },
};

const createProgression = () => {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update: (updated) => update((current) => ({ ...current, ...updated })),
    unlock: (unlock) => update((current) => ({ ...current, unlocks: { ...current.unlocks, ...unlock } })),
    reset: () => set(initial),
  };
};

export const progression = createProgression();
