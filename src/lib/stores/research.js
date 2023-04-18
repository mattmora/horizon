import { get, writable } from 'svelte/store';

const initial = {
  engines: {
    combustion: {
      count: 1,
      weight: 2000,
      throttle: 0,
    },
  },
  fuel: 10000,
};

const createSpacecraft = () => {
  const store = writable(initial);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update,
    reset: () => set(initial),
    getMass: () => {
      const { engines, fuel } = get(store);
      let mass = fuel;
      Object.values(engines).forEach((e) => (mass += e.count * e.weight));
      return mass;
    },
  };
};

export const spacecraft = createSpacecraft();
