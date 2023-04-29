// track and save game state, unlocks, etc.
import { get, writable } from 'svelte/store';
import { Engines } from './rocket';
import { TaskIds } from './research';
import clone from 'just-clone';

export const initialProgression = {
  departed: false,
  unlocks: {
    [Engines.COMBUSTION]: true,
    // [TaskIds[Engines.COMBUSTION].AUTOMATION]: true,
  },
};

const createProgression = () => {
  const store = writable(clone(initialProgression));
  const { subscribe, set, update } = store;

  const updateProgression = (data) => {
    update((current) => {
      const updated = {
        ...current,
        ...data,
      };
      return updated;
    });
  };

  return {
    subscribe,
    set,
    update: updateProgression,
    unlock: (unlock) => update((current) => ({ ...current, unlocks: { ...current.unlocks, ...unlock } })),
    reset: () => set(clone(initialProgression)),
  };
};

export const progression = createProgression();
