// track and save game state, unlocks, etc.
import { get, writable } from 'svelte/store';
import { Engines } from './rocket';

const initial = {
  unlocks: {
    engines: {
      [Engines.COMBUSTION]: true,
    },
  },
};

const createProgression = () => {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update,
    reset: () => set(initial),
  };
};

export const progression = createProgression();
